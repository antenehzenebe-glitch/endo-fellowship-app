// dashboard/evaluationSummary.ts
// Mid-year / end-of-year evaluation summary for the staff dashboard
// (PD / APD / Chief). Read-only: for each active fellow, whether the two
// semiannual program summaries have been finalized for the current academic
// year. RLS does the filtering — PD / APD / Chief see every row via the
// can_author_eval() branch of the fellow_evaluations SELECT policy; nobody
// else can read this table. Never bypass RLS.
//
// Source of truth: public.fellow_evaluations — the narrative summary the
// PD / APD / Chief writes alongside the official New Innovations review.
// A period counts as "completed" once at least one finalized (status = 'final')
// summary exists for that fellow and period in the current academic year; a
// saved draft with no finalized summary shows as in-progress; no row at all
// shows as pending (rendered as null).
import { createClient } from '@/lib/supabase/server'

export type EvalCellStatus = 'completed' | 'in_progress' | 'pending'

export type EvalCell = {
  status: EvalCellStatus
  completedAt: string | null
} | null

export type FellowEvalRow = {
  id: string
  name: string
  pgyLevel: 'PGY-4' | 'PGY-5' | null
  midYear: EvalCell
  endOfYear: EvalCell
}

export type EvalSummaryData = {
  fellows: FellowEvalRow[]
  academicYear: string
}

// Academic year runs July 1 → June 30, written as "YYYY-YYYY" (e.g. 2025-2026).
// Must match the academic_year string the evaluation workspace writes.
function currentAcademicYear(now = new Date()): string {
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return `${startYear}-${startYear + 1}`
}

export async function getEvalSummary(): Promise<EvalSummaryData> {
  const supabase = await createClient()
  const academicYear = currentAcademicYear()

  const [fellowsRes, evalsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, pgy_level')
      .eq('role', 'fellow')
      .eq('is_active', true)
      .order('pgy_level', { ascending: true })
      .order('full_name', { ascending: true }),
    supabase
      .from('fellow_evaluations')
      .select('fellow_id, period, status, finalized_at, academic_year')
      .eq('academic_year', academicYear),
  ])

  const firstError = fellowsRes.error || evalsRes.error
  if (firstError) {
    throw new Error(`Could not load the evaluation summary: ${firstError.message}`)
  }

  const fellows = fellowsRes.data ?? []
  const evals = evalsRes.data ?? []

  // A period is "completed" if any finalized summary exists for it; otherwise
  // "in_progress" if a draft exists; otherwise null (nothing written yet).
  function cellFor(fellowId: string, which: 'mid_year' | 'end_of_year'): EvalCell {
    const rows = evals.filter((e) => e.fellow_id === fellowId && e.period === which)
    if (rows.length === 0) return null
    const finalized = rows.find((r) => r.status === 'final')
    if (finalized) {
      return { status: 'completed', completedAt: finalized.finalized_at ?? null }
    }
    return { status: 'in_progress', completedAt: null }
  }

  const rows: FellowEvalRow[] = fellows.map((f) => ({
    id: f.id,
    name: f.full_name,
    pgyLevel: f.pgy_level,
    midYear: cellFor(f.id, 'mid_year'),
    endOfYear: cellFor(f.id, 'end_of_year'),
  }))

  return { fellows: rows, academicYear }
}
