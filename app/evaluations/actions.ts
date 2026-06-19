// app/evaluations/actions.ts
// Server actions for fellow evaluations. Authorization is enforced both here
// (role check) and at the database (RLS): authors = attendings + PD/APD/admin.
// De-identified educational records only — NO PHI. No service-role key.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  canAuthorEval,
  type EvalPeriod,
  type EvalRating,
  type EvalStatus,
} from '@/lib/evaluations'

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

type SaveInput = {
  fellowId: string
  period: EvalPeriod
  academicYear: string
  overallRating: EvalRating
  narrative: string
  status: EvalStatus
}

export async function saveEvaluation(input: SaveInput): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Your session has expired. Please sign in again.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile || !canAuthorEval(profile.role)) {
    return { ok: false, error: 'You do not have permission to write evaluations.' }
  }

  const academic_year = input.academicYear?.trim()
  const narrative = input.narrative?.trim()
  if (!input.fellowId) return { ok: false, error: 'Choose a fellow to evaluate.' }
  if (!academic_year) return { ok: false, error: 'Enter an academic year (e.g. 2025-2026).' }
  if (!input.period) return { ok: false, error: 'Choose the evaluation period.' }
  if (!input.overallRating) return { ok: false, error: 'Choose an overall rating.' }
  if (!narrative) return { ok: false, error: 'Write the evaluation narrative before saving.' }

  const now = new Date().toISOString()
  const row = {
    fellow_id: input.fellowId,
    evaluator_id: user.id,
    period: input.period,
    academic_year,
    overall_rating: input.overallRating,
    narrative,
    status: input.status,
    finalized_at: input.status === 'final' ? now : null,
    updated_at: now,
  }

  const { data, error } = await supabase
    .from('fellow_evaluations')
    .upsert(row, { onConflict: 'fellow_id,evaluator_id,period,academic_year' })
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: `Could not save the evaluation: ${error.message}` }
  revalidatePath('/evaluations')
  return { ok: true, id: data?.id }
}

export async function setEvaluationStatus(
  id: string,
  status: EvalStatus
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Your session has expired. Please sign in again.' }

  const { data, error } = await supabase
    .from('fellow_evaluations')
    .update({
      status,
      finalized_at: status === 'final' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')
  if (error) return { ok: false, error: `Could not update the evaluation: ${error.message}` }
  if (!data || data.length === 0) {
    return { ok: false, error: 'You can only change evaluations you wrote.' }
  }
  revalidatePath('/evaluations')
  return { ok: true }
}

export async function deleteEvaluation(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Your session has expired. Please sign in again.' }

  const { error } = await supabase.from('fellow_evaluations').delete().eq('id', id)
  if (error) return { ok: false, error: `Could not delete the evaluation: ${error.message}` }
  revalidatePath('/evaluations')
  return { ok: true }
}
