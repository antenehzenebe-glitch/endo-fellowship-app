// dashboard/PdCenter.tsx
// Program Director view: program scorecard + fellow roster.
// Readiness signal only — procedures vs minimums, onboarding, ITE, scholarly.
// The formal ACGME milestone evaluation lives in New Innovations; the program's
// mid/end-year summary lives in the Evaluation Summary tab. No legacy evaluations
// are read here (the readiness layer dropped that dependency).
//
// v2 STRUCTURAL redesign: the same card language as the command center —
// overview band on top, a quiet program-wide stat strip, then the roster as
// status-first fellow cards (shared FellowCard) instead of a data table.
// Color is paired with text labels (never color alone) per DESIGN.md / WCAG.
import { FellowCard, ReadinessBand } from '@/dashboard/CommandCenter'
import type { ReadinessOverview } from '@/dashboard/queries'

// Program rollup stat — the SAME numeral/label language as the OverviewBand
// stat cells (one numeral system per screen), so the band and this strip read
// as one system instead of two competing stat styles.
function ProgramStat({
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
  const valueColor = tone === 'good' ? 'text-green-700' : 'text-primary'
  return (
    <div className="flex items-baseline gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-col sm:items-start sm:gap-1.5">
      <p className={`order-first text-3xl font-bold tabular-nums leading-none sm:text-4xl ${valueColor}`}>{value}</p>
      <p className="text-sm font-medium text-gray-600">
        {label}
        {sub ? <span className="block text-xs font-normal text-muted">{sub}</span> : null}
      </p>
    </div>
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
      <ReadinessBand overview={overview} />

      {/* Program-wide rollup: the four numbers a PD quotes in a CCC meeting. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ProgramStat
          label="Procedure minimums met"
          value={`${procPct}%`}
          sub={`${totalMet} of ${totalWithTarget}`}
          tone={procPct >= 100 && totalWithTarget > 0 ? 'good' : 'navy'}
        />
        <ProgramStat
          label="Onboarding complete"
          value={onbTotal > 0 ? `${onbPct}%` : '—'}
          sub={onbTotal > 0 ? `${onbDone} of ${onbTotal} tasks` : 'none assigned'}
          tone={onbPct >= 100 && onbTotal > 0 ? 'good' : 'navy'}
        />
        <ProgramStat label="ITE on record" value={`${iteCount}/${fellows.length}`} sub="fellows" />
        <ProgramStat label="Scholarly active" value={String(scholarlyActive)} sub="projects in progress" />
      </div>

      <section aria-label="Fellow roster" className="space-y-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Roster</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Fellow by fellow</h2>
        </div>
        {fellows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm">
            <p className="font-semibold text-gray-800">No active fellows yet</p>
            <p className="mt-1 text-sm text-muted">Provision fellow accounts and their readiness will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fellows.map((f) => (
              <FellowCard key={f.id} fellow={f} />
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
