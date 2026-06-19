// app/schedule/actions.ts
// Server action for the program schedule.
//
// Write access (small-program model):
//   • Staff (pd/apd/coordinator/admin) AND fellows — full edit of the entire
//     schedule: block grid, weekly skeleton, fellows, rotations, and the
//     monthly didactic calendars.
//   • Attendings / anyone else — no write (read-only view).
//
// Evaluations are a SEPARATE feature and remain closed to fellows.
//
// The schedule is a singleton row (id = 'current') that always exists (seeded by
// migration), so a plain UPDATE is sufficient and matches the row-level policy
// `program_schedule_update USING/CHECK (is_staff() OR is_fellow())` from 0007.
//
// De-identified PROGRAM data only — NO PHI. No service-role key, no raw SQL.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'
import type { SchedulePayload } from '@/lib/schedule'

export type ActionResult = { ok: true } | { ok: false; error: string }

// Everyone permitted to edit the schedule.
const EDITOR_ROLES = ['pd', 'apd', 'coordinator', 'admin', 'fellow']

export async function saveSchedule(
  payload: SchedulePayload
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'Your session has expired. Please sign in again.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const role = profile?.role ?? ''

  if (!EDITOR_ROLES.includes(role)) {
    return { ok: false, error: 'You do not have permission to edit the schedule.' }
  }

  if (!payload?.config || typeof payload.config !== 'object') {
    return { ok: false, error: 'Schedule data is missing or malformed.' }
  }
  const academic_year = payload.academic_year?.trim()
  if (!academic_year) {
    return { ok: false, error: 'Enter an academic year (e.g. 2026-2027).' }
  }

  const { data, error } = await supabase
    .from('program_schedule')
    .update({
      academic_year,
      config: payload.config as unknown as Json,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'current')
    .select('id')

  if (error) {
    return { ok: false, error: `Could not save the schedule: ${error.message}` }
  }
  if (!data || data.length === 0) {
    return {
      ok: false,
      error: 'The schedule has not been set up yet. Ask program leadership to initialize it.',
    }
  }

  revalidatePath('/schedule')
  return { ok: true }
}
