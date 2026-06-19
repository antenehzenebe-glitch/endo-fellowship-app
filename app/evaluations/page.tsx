// app/evaluations/page.tsx
// Role-aware landing for fellow evaluations.
//   • Authors (attending/pd/apd/admin) -> full workspace (write + manage).
//   • Coordinator (leadership, non-author) -> read-only view of ALL evaluations.
//   • Fellow -> read-only view of their OWN finalized evaluations.
// Row visibility is enforced by RLS; this page only chooses the presentation.
import Link from 'next/link'
import { requireProfile, isStaff, roleHome } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import EvaluationWorkspace from './EvaluationWorkspace'
import {
  canAuthorEval,
  currentAcademicYear,
  periodLabel,
  ratingLabel,
  ratingTone,
  type EvalRow,
} from '@/lib/evaluations'

export const dynamic = 'force-dynamic'

export default async function EvaluationsPage() {
  const profile = await requireProfile()
  const role = profile.role
  const author = canAuthorEval(role)
  const leadership = isStaff(role) // pd/apd/coordinator/admin -> sees all rows
  const fellow = role === 'fellow'

  const supabase = await createClient()

  const { data: people } = await supabase
    .from('profiles')
    .select('id, full_name, role, pgy_level, is_active')
    .order('full_name')
  const byId = new Map((people ?? []).map((p) => [p.id, p]))
  const fellows = (people ?? []).filter((p) => p.role === 'fellow' && p.is_active)

  const { data: evals } = await supabase
    .from('fellow_evaluations')
    .select('*')
    .order('updated_at', { ascending: false })

  const rows: EvalRow[] = (evals ?? []).map((e) => ({
    ...e,
    fellowName: byId.get(e.fellow_id)?.full_name ?? 'Unknown fellow',
    evaluatorName: byId.get(e.evaluator_id)?.full_name ?? 'Unknown evaluator',
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">Fellow Evaluations</h1>
            <p className="text-xs text-white/70">
              Endocrinology, Diabetes &amp; Metabolism Fellowship
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={roleHome(role)} className="text-sm text-white/90 hover:text-white">
              ← Back
            </Link>
            <SignOutButton variant="onDark" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {author ? (
          <EvaluationWorkspace
            fellows={fellows.map((f) => ({ id: f.id, name: f.full_name, pgy: f.pgy_level }))}
            rows={rows}
            currentUserId={profile.id}
            seesAll={leadership}
            defaultAcademicYear={currentAcademicYear()}
          />
        ) : (
          <ReadOnlyList rows={rows} fellow={fellow} />
        )}
      </main>
    </div>
  )
}

function ReadOnlyList({ rows, fellow }: { rows: EvalRow[]; fellow: boolean }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {fellow ? 'Your evaluations' : 'All evaluations'}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {fellow
            ? 'Finalized mid-year and end-of-year evaluations from your faculty.'
            : 'Read-only view of fellow evaluations across the program.'}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {fellow ? 'No finalized evaluations yet.' : 'No evaluations recorded yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <article key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-slate-900">{r.fellowName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {periodLabel(r.period)} · {r.academic_year} · by {r.evaluatorName}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-white"
                    style={{ background: ratingTone(r.overall_rating) }}
                  >
                    {ratingLabel(r.overall_rating)}
                  </span>
                  {!fellow && r.status !== 'final' && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                      Draft
                    </span>
                  )}
                  <Link
                    href={`/evaluations/${r.id}/print`}
                    className="text-sm font-medium text-[#003a63] hover:underline"
                  >
                    Print
                  </Link>
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                {r.narrative}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
