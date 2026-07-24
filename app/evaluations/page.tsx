'use client'

// app/evaluations/page.tsx
// Evaluations hub — role-shaped:
//   staff (pd/apd/admin): write + manage evaluations for all fellows
//   attending:            write + manage ONLY their own evaluations
//   fellow:               read-only list of their finalized evaluations
// The official ACGME evaluation lives in New Innovations; this is the program's
// internal mid/end-of-year summary.
import Link from 'next/link'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import FellowNav from '@/components/FellowNav'
import EvaluationWorkspace from './EvaluationWorkspace'
import { periodLabel, ratingLabel, ratingTone, formatPgy, type EvalRow } from '@/lib/evaluations'
import { NEW_INNOVATIONS_URL } from '@/lib/links'

export const dynamic = 'force-dynamic'

export default async function EvaluationsPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const seesAll = profile.role === 'pd' || profile.role === 'apd' || profile.role === 'admin'
  const canWrite = seesAll || profile.role === 'attending'
  const isFellow = profile.role === 'fellow'

  // Fellows evaluated: staff see all active fellows; attendings too (they
  // evaluate any fellow they supervised). Fellows get an empty list (no form).
  let fellows: { id: string; name: string; pgy: string | null }[] = []
  if (canWrite) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, pgy_level')
      .eq('role', 'fellow')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
    fellows = (data ?? []).map((f) => ({ id: f.id, name: f.full_name, pgy: f.pgy_level }))
  }

  // Rows: RLS scopes visibility (fellow → own finalized; attending → own;
  // pd/apd/admin → all).
  const { data: rowsRaw } = await supabase
    .from('fellow_evaluations')
    .select('id, fellow_id, evaluator_id, period, academic_year, overall_rating, narrative, status, finalized_at')
    .order('finalized_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })

  const rows0 = rowsRaw ?? []
  const peopleIds = [...new Set(rows0.flatMap((r) => [r.fellow_id, r.evaluator_id]))]
  const nameById = new Map<string, string>()
  if (peopleIds.length) {
    const { data: people } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', peopleIds)
    for (const p of people ?? []) nameById.set(p.id, p.full_name)
  }

  const rows: EvalRow[] = rows0.map((r) => ({
    ...r,
    fellowName: nameById.get(r.fellow_id) ?? '—',
    evaluatorName: nameById.get(r.evaluator_id) ?? '—',
  }))

  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {isFellow ? 'My Evaluations' : 'Fellow Evaluations'}
              </h1>
              <p className="text-sm text-gray-500">Hi, {firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isFellow && (
              <a
                href={NEW_INNOVATIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="New Innovations (opens in a new tab)"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors inline-flex items-center gap-1"
              >
                New Innovations
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
            <Link
              href={isFellow ? '/log' : '/dashboard'}
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isFellow ? 'Logger' : 'Dashboard'}
            </Link>
            <SignOutButton />
          </div>
        </div>
        {isFellow && <FellowNav />}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {isFellow ? (
          rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold text-slate-800">No evaluations yet</p>
              <p className="text-sm text-slate-500 mt-1">
                When a faculty evaluation is finalized it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                The official ACGME evaluation is completed in New Innovations; this is the program&rsquo;s summary.
              </p>
              {rows.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  style={{ borderLeft: `4px solid ${ratingTone(r.overall_rating)}` }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {periodLabel(r.period)} · {r.academic_year}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">by {r.evaluatorName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-white"
                        style={{ background: ratingTone(r.overall_rating) }}
                      >
                        {ratingLabel(r.overall_rating)}
                      </span>
                      <Link
                        href={`/evaluations/${r.id}/print`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Print
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed">
                    {r.narrative}
                  </p>
                </article>
              ))}
            </div>
          )
        ) : (
          <EvaluationWorkspace
            fellows={fellows}
            rows={rows}
            currentUserId={profile.id}
            seesAll={seesAll}
            defaultAcademicYear={defaultAcademicYear()}
          />
        )}
      </main>
    </div>
  )
}

// Academic year runs July–June: Jul 2025 → "2025-2026".
function defaultAcademicYear(): string {
  const now = new Date()
  const y = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return `${y}-${y + 1}`
}

// Re-export for the workspace's select (avoids a second lib import in the page).
export { formatPgy }
