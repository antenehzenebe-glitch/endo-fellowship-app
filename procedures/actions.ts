// procedures/actions.ts
// Server actions for the Mobile Procedure Logger.
//
// RLS is the enforcer: procedure_logs INSERT requires fellow_id = auth.uid(),
// so we set fellow_id from the session — never from client input. DELETE is
// allowed for the owning fellow or staff by policy; we just attempt it and let
// the database decide. No service-role key, no raw SQL. (See CLAUDE.md.)
//
// No PHI: notes are teaching context only. We trim/normalize but do not, and
// must not, capture patient identifiers.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type ProcedureOutcome = Database['public']['Enums']['procedure_outcome']

const OUTCOMES: ProcedureOutcome[] = ['successful', 'learning', 'incomplete']

export type LogProcedureInput = {
  procedure_type: string
  date_performed: string // 'YYYY-MM-DD'
  outcome: ProcedureOutcome
  supervising_attending_id: string | null
  notes: string | null
}

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function logProcedure(input: LogProcedureInput): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'Your session has expired. Please sign in again.' }
  }

  // Validate (the DB has matching constraints; this gives a friendly message first).
  if (!input.procedure_type) {
    return { ok: false, error: 'Choose a procedure type.' }
  }
  if (!input.date_performed) {
    return { ok: false, error: 'Choose the date the procedure was performed.' }
  }
  const today = new Date().toISOString().slice(0, 10)
  if (input.date_performed > today) {
    return { ok: false, error: 'The date performed can’t be in the future.' }
  }
  const outcome: ProcedureOutcome = OUTCOMES.includes(input.outcome)
    ? input.outcome
    : 'successful'

  const notes = input.notes?.trim() ? input.notes.trim() : null

  const { error } = await supabase.from('procedure_logs').insert({
    fellow_id: user.id, // RLS requires this to equal auth.uid()
    procedure_type: input.procedure_type,
    date_performed: input.date_performed,
    outcome,
    supervising_attending_id: input.supervising_attending_id || null,
    notes,
  })

  if (error) {
    return { ok: false, error: `Could not save the procedure: ${error.message}` }
  }

  revalidatePath('/log')
  return { ok: true }
}

export async function deleteProcedure(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: 'Missing procedure id.' }

  const supabase = await createClient()
  const { error } = await supabase.from('procedure_logs').delete().eq('id', id)

  if (error) {
    return { ok: false, error: `Could not delete the procedure: ${error.message}` }
  }

  revalidatePath('/log')
  return { ok: true }
}
