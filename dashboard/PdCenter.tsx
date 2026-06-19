// dashboard/PdCenter.tsx
// Program Director view: program scorecard + fellow roster.
// Readiness signal only — procedures vs minimums, onboarding, ITE, scholarly.
// The formal ACGME milestone evaluation lives in New Innovations; the program's
// mid/end-year summary lives in the Evaluation Summary tab. No legacy evaluations
// are read here (the readiness layer dropped that dependency).
// Mobile-first: gauges 2-up (4-up on lg); roster as a scroll-safe table.
// Color is paired with text labels (never color alone) per DESIGN.md / WCAG.
import { ProgramSummary } from '@/dashboard/CommandCenter'
import type { FellowReadiness, ReadinessOverview, ReadinessStatus } from '@/dashboard/queries'

const STATUS_META: Record<ReadinessStatus, { label: string; pill: string }> = {
  on_track: { label: 'On track', pill: 'bg-green-100 text-green-800' },
  at_risk: { label: 'At risk', pill: 'bg-amber-100 text-amber-900' },
  behind: { label: 'Behind', pill: 'bg-red-100 text-red-800' },
}

function Gauge({
  label,
  value,
  sub,
  tone = 'navy',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'navy' | 'good'
}) {
  const valueColor = tone === 'good' ? 'text-green-700' : 'text-[#003a63]'
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <p className={`text-3xl font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
      <p className="mt-1.5 text-xs font-semibold text-gray-700">{label}</p>
      {sub ? <p className="text-xs text-gray-400">{sub}</p> : null}
    </div>
  )
}

function StatusPill({ status }: { status: ReadinessStatus }) {
  const m = STATUS_META[status]
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.pill}`}>{m.label}</span>
}

function FellowRow({ f }: { f: FellowReadiness }) {
  const ite =
    f.latestIte && f.latestIte.percentile !== null
      ? `${f.latestIte.percentile}%ile`
      : f.latestIte
        ? 'recorded'
        : 'none'
  return (
    <tr className="align-top">
      <th scope="row" className="px-3 py-3 text-left font-normal">
        <span className="block font-semibold text-[#003a63] leading-snug">{f.name}</span>
        {f.pgyLevel ? <span className="text-xs text-gray-500">{f.pgyLevel}</span> : null}
      </th>
      <td className="px-3 py-3">
        <StatusPill status={f.status} />
      </td>
      <td className="px-3 py-3 tabular-nums whitespace-nowrap">
        <span className="font-semibold text-gray-900">{f.proceduresMet}</span>
        <span className="text-gray-400">/{f.proceduresWithTarget} mins</span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-gray-700">
        {ite}
        {f.latestIte ? <span className="text-gray-400"> · {f.latestIte.examYear}</span> : null}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-gray-700">
        {f.scholarlyCompleted} done<span className="text-gray-400"> · {f.scholarlyActive} active</span>
      </td>
      <td className="px-3 py-3 tabular-nums whitespace-nowrap text-gray-700">
        {f.onboardingTotal > 0 ? `${f.onboardingDone}/${f.onboardingTotal}` : '—'}
      </td>
    </tr>
  )
}

export default function PdCenter({ overview }: { overview: ReadinessOverview }) {
  const fellows = overview.fellows

  const totalWithTarget = fellows.reduce((s, f) => s + f.proceduresWithTarget, 0)
  const totalMet = fellows.reduce((s, f) => s + f.proceduresMet, 0)
  const procPct = totalWithTarget > 0 ? Math.round((totalMet / totalWithTarget) * 100) : 0

  const onbDone = fellows.reduce((s, f) => s + f.onboardingDone, 0)
  const onbTotal = fellows.reduce((s, f) => s + f.onboardingTotal, 0)
  const onbPct = onbTotal > 0 ? Math.round((onbDone / onbTotal) * 100) : 0

  const iteCount = fellows.filter((f) => f.latestIte !== null).length
  const scholarlyActive = fellows.reduce((s, f) => s + f.scholarlyActive, 0)

  return (
    <section aria-label="Program oversight" className="space-y-6">
      <ProgramSummary overview={overview} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Gauge
          label="Procedure minimums met"
          value={`${procPct}%`}
          sub={`${totalMet} of ${totalWithTarget}`}
          tone={procPct >= 100 && totalWithTarget > 0 ? 'good' : 'navy'}
        />
        <Gauge
          label="Onboarding complete"
          value={onbTotal > 0 ? `${onbPct}%` : '—'}
          sub={onbTotal > 0 ? `${onbDone} of ${onbTotal} tasks` : 'none assigned'}
          tone={onbPct >= 100 && onbTotal > 0 ? 'good' : 'navy'}
        />
        <Gauge label="ITE on record" value={`${iteCount}/${fellows.length}`} sub="fellows" />
        <Gauge label="Scholarly active" value={String(scholarlyActive)} sub="projects in progress" />
      </div>

      <section aria-label="Fellow roster" className="space-y-3">
        <h2 className="font-semibold text-gray-900">Fellow roster</h2>
        {fellows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <p className="font-semibold text-gray-800">No active fellows yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Per-fellow readiness roster: status, procedures, ITE, scholarly, onboarding.</caption>
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th scope="col" className="px-3 py-2.5 font-semibold">Fellow</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap">Procedures</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap">Latest ITE</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap">Scholarly</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap">Onboarding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fellows.map((f) => (
                  <FellowRow key={f.id} f={f} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
