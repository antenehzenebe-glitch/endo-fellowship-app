// app/schedule/actions.ts
// Server action for the staff-editable program schedule.
//
// RLS is the enforcer: program_schedule INSERT/UPDATE require public.is_staff(),
// so a non-staff caller is rejected by the database even if they reach this
// action. We attempt the upsert and surface any error. No service-role key, no
// raw SQL. (See CLAUDE.md.)
//
// De-identified PROGRAM data only (rotation names, dates, times) — NO PHI.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'
import type { SchedulePayload } from '@/lib/schedule'

export type ActionResult = { ok: true } | { ok: false; error: string }

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

  const academic_year = payload?.academic_year?.trim()
  if (!academic_year) {
    return { ok: false, error: 'Enter an academic year (e.g. 2026-2027).' }
  }
  if (!payload?.config || typeof payload.config !== 'object') {
    return { ok: false, error: 'Schedule data is missing or malformed.' }
  }

  // Singleton row: id is always 'current'. RLS restricts writes to is_staff();
  // a non-staff session that reaches here is rejected by the database.
  const { error } = await supabase.from('program_schedule').upsert(
    {
      id: 'current',
      academic_year,
      // `config` is a JSONB column (typed Json); our structured ScheduleConfig
      // is a valid JSON value at runtime, so cast through unknown for the types.
      config: payload.config as unknown as Json,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (error) {
    return { ok: false, error: `Could not save the schedule: ${error.message}` }
  }

  revalidatePath('/schedule')
  return { ok: true }
}
