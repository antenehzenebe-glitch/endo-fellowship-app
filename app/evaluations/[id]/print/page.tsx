// app/evaluations/[id]/print/page.tsx
// Board-ready / file-ready printable evaluation. Any signed-in user may open it,
// but RLS decides whether the row is returned — so a fellow can only print their
// own finalized evals, an attending their own, leadership all.
import Link from 'next/link'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { periodLabel, ratingLabel, formatPgy } from '@/lib/evaluations'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

function pretty(d: string | null): string {
  return d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
}

export default async function EvalPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireProfile()
  const { id } = await params
  const supabase = await createClient()

  const { data: ev } = await supabase
    .from('fellow_evaluations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!ev) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6 text-center">
        <div>
          <p className="text-slate-700 font-medium">This evaluation is not available.</p>
          <p className="text-sm text-slate-500 mt-1">
            It may not exist, or you may not have access to it.
          </p>
          <Link
            href="/evaluations"
            className="text-sm text-[#003a63] hover:underline mt-3 inline-block"
          >
            ← Back to evaluations
          </Link>
        </div>
      </div>
    )
  }

  const { data: people } = await supabase
    .from('profiles')
    .select('id, full_name, pgy_level')
    .in('id', [ev.fellow_id, ev.evaluator_id])
  const byId = new Map((people ?? []).map((p) => [p.id, p]))
  const fellow = byId.get(ev.fellow_id)
  const evaluator = byId.get(ev.evaluator_id)

  return (
    <div className="min-h-screen bg-slate-100">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .sheet { box-shadow: none !important; margin: 0 !important; border: none !important; }
          @page { size: portrait; margin: 18mm; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `,
        }}
      />

      <div className="no-print sticky top-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <Link href="/evaluations" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back
        </Link>
        <PrintButton />
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <article className="sheet bg-white rounded-lg shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="border-b-4 pb-4 mb-6" style={{ borderColor: '#c8102e' }}>
            <h1 className="text-xl font-bold" style={{ color: '#003a63' }}>
              Howard University Hospital
            </h1>
            <p className="text-sm text-slate-600">
              Endocrinology, Diabetes &amp; Metabolism Fellowship
            </p>
            <p className="text-base font-semibold text-slate-900 mt-3">Fellow Evaluation</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
            <div>
              <dt className="text-slate-500">Fellow</dt>
              <dd className="font-semibold text-slate-900">
                {fellow?.full_name ?? '—'}
                {fellow?.pgy_level ? ` (${formatPgy(fellow.pgy_level)})` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Period</dt>
              <dd className="font-semibold text-slate-900">
                {periodLabel(ev.period)} · {ev.academic_year}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Evaluator</dt>
              <dd className="font-semibold text-slate-900">{evaluator?.full_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Overall rating</dt>
              <dd className="font-semibold text-slate-900">{ratingLabel(ev.overall_rating)}</dd>
            </div>
          </dl>

          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Narrative
            </h2>
            <p className="text-[15px] leading-7 text-slate-800 whitespace-pre-wrap">
              {ev.narrative}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-slate-200 text-sm">
            <div>
              <div className="h-10 border-b border-slate-400" />
              <p className="text-slate-600 mt-1">
                {evaluator?.full_name ?? 'Evaluator'} — Evaluator signature
              </p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400" />
              <p className="text-slate-600 mt-1">Fellow signature / date reviewed</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            {ev.status === 'final' && ev.finalized_at
              ? `Finalized ${pretty(ev.finalized_at)}.`
              : `Draft — last updated ${pretty(ev.updated_at)}.`}
          </p>
        </article>
      </div>
    </div>
  )
}
