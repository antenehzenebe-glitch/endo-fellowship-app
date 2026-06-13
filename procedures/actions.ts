'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProcedureOutcome, ProcedureType } from '@/lib/supabase/database.types'

const PROCEDURE_TYPES: readonly ProcedureType[] = ['FNA', 'THYROID_US', 'CGM_INTERP']
const OUTCOMES: readonly ProcedureOutcome[] = ['successful', 'learning', 'incomplete']

export type LogProcedureState = {
  error: string | null
  success: boolean
}

/**
 * Logs one de-identified procedure for the signed-in fellow.
 *
 * ACGME context: entries here count toward the program's procedural minimums
 * (`procedure_targets`) on the graduation-readiness dashboard. Notes are
 * teaching context only — NO PHI (no patient names, MRNs, or DOBs), by design.
 *
 * Security: fellow_id always comes from the authenticated session, never from
 * the form, and the insert runs under RLS (policy `proc_insert` requires
 * fellow_id = auth.uid()).
 */
export async function logProcedure(
  _prev: LogProcedureState,
  formData: FormData
): Promise<LogProcedureState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Your session expired. Sign in again to log this procedure.', success: false }
  }

  const procedureType = formData.get('procedure_type')
  if (typeof procedureType !== 'string' || !PROCEDURE_TYPES.includes(procedureType as ProcedureType)) {
    return { error: 'Choose a procedure type.', success: false }
  }

  const datePerformed = formData.get('date_performed')
  if (typeof datePerformed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(datePerformed)) {
    return { error: 'Enter the date the procedure was performed.', success: false }
  }
  // DB also enforces this (procedure_date_not_future); checking here gives a
  // friendlier message.
  const today = new Date().toISOString().slice(0, 10)
  if (datePerformed > today) {
    return { error: 'The procedure date cannot be in the future.', success: false }
  }

  const outcome = formData.get('outcome')
  if (typeof outcome !== 'string' || !OUTCOMES.includes(outcome as ProcedureOutcome)) {
    return { error: 'Choose an outcome.', success: false }
  }

  const attendingRaw = formData.get('supervising_attending_id')
  const supervisingAttendingId =
    typeof attendingRaw === 'string' && attendingRaw !== '' ? attendingRaw : null

  const notesRaw = formData.get('notes')
  const notes = typeof notesRaw === 'string' && notesRaw.trim() !== '' ? notesRaw.trim() : null
  if (notes !== null && notes.length > 2000) {
    return { error: 'Notes are limited to 2,000 characters.', success: false }
  }

  const { error } = await supabase.from('procedure_logs').insert({
    fellow_id: user.id,
    procedure_type: procedureType as ProcedureType,
    date_performed: datePerformed,
    outcome: outcome as ProcedureOutcome,
    supervising_attending_id: supervisingAttendingId,
    notes,
  })

  if (error) {
    return {
      error: 'Could not save the procedure. Check your connection and try again.',
      success: false,
    }
  }

  revalidatePath('/log')
  return { error: null, success: true }
}
