// app/schedule/actions.ts
// Server actions for the multi-year program schedule.
//
// Data model (migration: schedule_multiyear): program_schedule holds ONE ROW PER
// ACADEMIC YEAR, keyed by `academic_year` (id is set to the academic_year string
// for new rows; the legacy seed row keeps id='current'). Exactly one row carries
// is_current = true.
//
// Write access (small-program model):
//   • Staff (pd/apd/coordinator/admin) AND fellows — edit any year's schedule
//     (block grid, weekly skeleton, fellows, rotations, monthly calendars) and
//     CREATE a new academic year.
//   • Only staff may mark a year "current", PUBLISH a view (migration
//     0016_schedule_publish_flags), or (via RLS) delete a year.
//   • Attendings / anyone else — read-only.
//
// RLS (schedule_multiyear): read = true; insert/update = is_staff() OR is_fellow();
// delete = is_staff(). These actions add role checks on top (defence in depth).
//
// Evaluations are a SEPARATE feature and remain closed to fellows.
// De-identified PROGRAM data only — NO PHI. No service-role key, no raw SQL.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'
import {
  EMPTY_CONFIG,
  asConfig,
  type ScheduleConfig,
  type SchedulePayload,
} from '@/lib/schedule'

export type ActionResult = { ok: true } | { ok: false; error: string }
export type CreateYearResult =
  | { ok: true; academic_year: string }
  | { ok: false; error: string }

// The two independently-publishable views of a year's schedule.
export type ScheduleScope = 'blocks' | 'months'

const EDITOR_ROLES = ['pd', 'apd', 'coordinator', 'admin', 'fellow']
const STAFF_ROLES = ['pd', 'apd', 'coordinator', 'admin']
const AY_RE = /^\d{4}-\d{4}$/

type Me = { userId: string; role: string }

async function getMe(): Promise<Me | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  return { userId: user.id, role: profile?.role ?? '' }
}

// Validate 'YYYY-YYYY' where the second year is the first + 1.
function normalizeYear(input: string | undefined): string | null {
  const year = input?.trim() ?? ''
  if (!AY_RE.test(year)) return null
  const [a, b] = year.split('-').map(Number)
  if (b !== a + 1) return null
  return year
}

// Save edits for ONE academic year (matched by academic_year; never renames it).
export async function saveSchedule(payload: SchedulePayload): Promise<ActionResult> {
  const me = await getMe()
  if (!me) return { ok: false, error: 'Your session has expired. Please sign in again.' }
  if (!EDITOR_ROLES.includes(me.role)) {
    return { ok: false, error: 'You do not have permission to edit the schedule.' }
  }
  if (!payload?.config || typeof payload.config !== 'object') {
    return { ok: false, error: 'Schedule data is missing or malformed.' }
  }
  const academic_year = payload.academic_year?.trim()
  if (!academic_year) return { ok: false, error: 'Missing academic year.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('program_schedule')
    .update({
      config: payload.config as unknown as Json,
      updated_by: me.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('academic_year', academic_year)
    .select('academic_year')

  if (error) return { ok: false, error: `Could not save the schedule: ${error.message}` }
  if (!data || data.length === 0) {
    return { ok: false, error: 'That academic year no longer exists. Refresh and try again.' }
  }

  revalidatePath('/schedule')
  return { ok: true }
}

// Create a NEW academic year. Carries the reusable vocabulary (fellows, weekly
// skeleton, rotation suggestions) from `cloneFrom` if given, but starts with an
// empty block grid + empty monthly calendars — regenerate with the editor's
// "Generate monthly blocks" button. A new year is NOT made current automatically.
export async function createYear(
  academicYear: string,
  cloneFrom?: string
): Promise<CreateYearResult> {
  const me = await getMe()
  if (!me) return { ok: false, error: 'Your session has expired. Please sign in again.' }
  if (!EDITOR_ROLES.includes(me.role)) {
    return { ok: false, error: 'You do not have permission to create an academic year.' }
  }
  const year = normalizeYear(academicYear)
  if (!year) {
    return {
      ok: false,
      error: 'Enter the year as YYYY-YYYY with consecutive years, e.g. 2026-2027.',
    }
  }

  const supabase = await createClient()

  let config: ScheduleConfig = { ...EMPTY_CONFIG }
  if (cloneFrom) {
    const { data: src } = await supabase
      .from('program_schedule')
      .select('config')
      .eq('academic_year', cloneFrom)
      .maybeSingle()
    if (src) {
      const c = asConfig(src.config)
      config = {
        version: c.version,
        weekly: c.weekly,
        rotations: c.rotations,
        fellows: c.fellows,
        blocks: [],
        months: [],
      }
    }
  }

  const { error } = await supabase.from('program_schedule').insert({
    id: year,
    academic_year: year,
    config: config as unknown as Json,
    is_current: false,
    updated_by: me.userId,
  })

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: `Academic year ${year} already exists.` }
    }
    return { ok: false, error: `Could not create the year: ${error.message}` }
  }

  revalidatePath('/schedule')
  return { ok: true, academic_year: year }
}

// Mark one academic year as the program's current year (staff only). Clears the
// previous current first so the one-current unique index never sees two trues.
export async function setCurrentYear(academicYear: string): Promise<ActionResult> {
  const me = await getMe()
  if (!me) return { ok: false, error: 'Your session has expired. Please sign in again.' }
  if (!STAFF_ROLES.includes(me.role)) {
    return { ok: false, error: 'Only program staff can set the current year.' }
  }
  const year = academicYear?.trim()
  if (!year) return { ok: false, error: 'Missing academic year.' }

  const supabase = await createClient()
  const clear = await supabase
    .from('program_schedule')
    .update({ is_current: false })
    .eq('is_current', true)
  if (clear.error) return { ok: false, error: `Could not update: ${clear.error.message}` }

  const set = await supabase
    .from('program_schedule')
    .update({ is_current: true })
    .eq('academic_year', year)
    .select('academic_year')
  if (set.error) return { ok: false, error: `Could not update: ${set.error.message}` }
  if (!set.data || set.data.length === 0) {
    return { ok: false, error: 'That academic year no longer exists. Refresh and try again.' }
  }

  revalidatePath('/schedule')
  return { ok: true }
}

// Publish ONE view of a year's schedule — the yearly block grid ('blocks') or the
// monthly didactic calendar ('months'). Staff only (matches setCurrentYear).
// Stamps published_at = now and published_by = me on the matching academic_year
// row, then revalidates the schedule page AND the whole app, because the
// app-wide "schedule published" banner is rendered from the root layout.
// Re-publishing simply refreshes the timestamp — which re-surfaces the banner
// for anyone who had dismissed the previous announcement. (Email notification is
// 4b and is intentionally NOT wired here yet.)
export async function publishSchedule(
  academicYear: string,
  scope: ScheduleScope
): Promise<ActionResult> {
  const me = await getMe()
  if (!me) return { ok: false, error: 'Your session has expired. Please sign in again.' }
  if (!STAFF_ROLES.includes(me.role)) {
    return { ok: false, error: 'Only program staff can publish the schedule.' }
  }
  if (scope !== 'blocks' && scope !== 'months') {
    return { ok: false, error: 'Unknown schedule section.' }
  }
  const year = academicYear?.trim()
  if (!year) return { ok: false, error: 'Missing academic year.' }

  const now = new Date().toISOString()
  const patch =
    scope === 'blocks'
      ? { blocks_published_at: now, blocks_published_by: me.userId }
      : { months_published_at: now, months_published_by: me.userId }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('program_schedule')
    .update(patch)
    .eq('academic_year', year)
    .select('academic_year')

  if (error) return { ok: false, error: `Could not publish: ${error.message}` }
  if (!data || data.length === 0) {
    return { ok: false, error: 'That academic year no longer exists. Refresh and try again.' }
  }

  revalidatePath('/schedule')
  revalidatePath('/', 'layout') // refresh the app-wide published banner everywhere
  return { ok: true }
}
