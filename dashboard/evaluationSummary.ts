// dashboard/evaluationSummary.ts
// Mid-year / end-of-year evaluation summary for the staff dashboard
// (PD / APD / Chief). Read-only: for each active fellow, whether the two
// semiannual reviews are done. RLS does the filtering (staff see all via the
// is_staff() branch in the evaluations SELECT policy). Never bypass RLS.
//
// Period bucketing keys off the evaluation's period_label by convention:
//   "Mid-Year 2026-2027"    -> mid-year
//   "End-of-Year 2026-2027" -> end-of-year
// (A structured `period` enum column also exists on evaluations for future use.)
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

function bucketOf(label: string | null): 'mid' | 'end' | null {
  const l = (label ?? '').toLowerCase()
  if (l.includes('mid')) return 'mid'
  if (l.includes('end') || l.includes('annual') || l.includes('final')) return 'end'
  return null
}

export async function getEvalSummary(): Promise<EvalSummaryData> {
  const supabase = await createClient()

  const [fellowsRes, evalsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, pgy_level')
      .eq('role', 'fellow')
      .eq('is_active', true)
      .order('pgy_level', { ascending: true })
      .order('full_name', { ascending: true }),
    supabase
      .from('evaluations')
      .select('subject_id, status, period_label, completed_at'),
  ])

  const firstError = fellowsRes.error || evalsRes.error
  if (firstError) {
    throw new Error(`Could not load the evaluation summary: ${firstError.message}`)
  }

  const fellows = fellowsRes.data ?? []
  const evals = evalsRes.data ?? []

  function cellFor(subjectId: string, which: 'mid' | 'end'): EvalCell {
    const rows = evals.filter(
      (e) => e.subject_id === subjectId && bucketOf(e.period_label) === which,
    )
    if (rows.length === 0) return null
    const completed = rows.find((r) => r.status === 'completed')
    const chosen = completed ?? rows[0]
    const status: EvalCellStatus =
      chosen.status === 'completed'
        ? 'completed'
        : chosen.status === 'in_progress'
          ? 'in_progress'
          : 'pending'
    return { status, completedAt: completed?.completed_at ?? null }
  }

  const rows: FellowEvalRow[] = fellows.map((f) => ({
    id: f.id,
    name: f.full_name,
    pgyLevel: f.pgy_level,
    midYear: cellFor(f.id, 'mid'),
    endOfYear: cellFor(f.id, 'end'),
  }))

  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return { fellows: rows, academicYear: `${startYear}-${startYear + 1}` }
}
