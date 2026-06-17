// dashboard/CommandCenter.tsx
// Presentational APD Command Center. Pure render from a ReadinessOverview —
// no data fetching, no client state. Follows DESIGN.md: Howard blue, system
// fonts, status conveyed by icon + text + color (never color alone), and a
// layout that holds up from 320px to desktop.
import {
  type FellowReadiness,
  type ProcedureProgress,
  type ReadinessOverview,
  type ReadinessStatus,
} from '@/dashboard/queries'

const STATUS_META: Record<
  ReadinessStatus,
  { label: string; pill: string; glyph: 'check' | 'alert' | 'cross' }
> = {
  on_track: {
    label: 'On Track',
    pill: 'bg-green-100 text-green-800',
    glyph: 'check',
  },
  at_risk: {
    label: 'At Risk',
    pill: 'bg-orange-100 text-orange-800',
    glyph: 'alert',
  },
  behind: { label: 'Behind', pill: 'bg-red-100 text-red-800', glyph: 'cross' },
}

function StatusGlyph({ glyph }: { glyph: 'check' | 'alert' | 'cross' }) {
  const common = { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': true }
  if (glyph === 'check') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (glyph === 'cross') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg {...common} fill="currentColor">
      <path d="M8 1l7 13H1L8 1zm0 5v4m0 2v.5" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="8" cy="11.5" r="0.9" />
    </svg>
  )
}

function ReadinessPill({ status }: { status: ReadinessStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.pill}`}
    >
      <StatusGlyph glyph={meta.glyph} />
      {meta.label}
    </span>
  )
}

function ProcedureBar({ p }: { p: ProcedureProgress }) {
  const hasTarget = p.min > 0
  const pct = hasTarget
    ? Math.min(100, Math.round((p.done / p.min) * 100))
    : p.done > 0
      ? 100
      : 0
  const met = hasTarget && p.done >= p.min
  const barColor = !hasTarget
    ? 'bg-gray-300'
    : met
      ? 'bg-green-500'
      : 'bg-orange-500'

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm text-gray-700">{p.label}</span>
        <span className="text-xs font-medium text-gray-600 tabular-nums">
          {hasTarget ? (
            <>
              {p.done}
              <span className="text-gray-400">/{p.min}</span>
              {met ? (
                <span className="ml-1 text-green-700">✓ met</span>
              ) : (
                <span className="ml-1 text-orange-700">
                  {p.min - p.done} to go
                </span>
              )}
            </>
          ) : (
            <>
              {p.done} <span className="text-gray-400">· no minimum set</span>
            </>
          )}
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full bg-gray-100 overflow-hidden"
        role="progressbar"
        aria-label={`${p.label}: ${p.done} logged${hasTarget ? ` of ${p.min} minimum` : ''}`}
        aria-valuenow={p.done}
        aria-valuemin={0}
        aria-valuemax={hasTarget ? p.min : Math.max(p.done, 1)}
      >
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function StatChip({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900 leading-tight">
        {value}
      </p>
      {sub ? <p className="text-xs text-gray-500">{sub}</p> : null}
    </div>
  )
}

export function FellowCard({ fellow }: { fellow: FellowReadiness }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 p-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 leading-tight">
            {fellow.name}
          </h3>
          <p className="text-sm text-gray-500">{fellow.pgyLevel ?? 'Fellow'}</p>
        </div>
        <ReadinessPill status={fellow.status} />
      </header>

      <div className="p-4 space-y-4">
        <section aria-label="Procedure progress" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Procedures</h4>
            <span className="text-xs text-gray-500 tabular-nums">
              {fellow.proceduresMet}/{fellow.proceduresWithTarget} minimums met
            </span>
          </div>
          {fellow.procedures.map((p) => (
            <ProcedureBar key={p.code} p={p} />
          ))}
        </section>

        <section aria-label="Other readiness metrics">
          <div className="grid grid-cols-2 gap-2">
            <StatChip
              label="Latest ITE"
              value={
                fellow.latestIte && fellow.latestIte.percentile !== null
                  ? `${fellow.latestIte.percentile}%ile`
                  : '—'
              }
              sub={fellow.latestIte ? `${fellow.latestIte.examYear}` : 'no score'}
            />
            <StatChip
              label="Scholarly"
              value={`${fellow.scholarlyCompleted} done`}
              sub={`${fellow.scholarlyActive} active`}
            />
            <StatChip
              label="Onboarding"
              value={
                fellow.onboardingTotal > 0
                  ? `${fellow.onboardingDone}/${fellow.onboardingTotal}`
                  : '—'
              }
              sub={fellow.onboardingTotal > 0 ? 'tasks done' : 'none assigned'}
            />
            <StatChip
              label="Open evals"
              value={String(fellow.openEvaluations)}
              sub={fellow.openEvaluations === 0 ? 'all current' : 'outstanding'}
            />
          </div>
        </section>

        {fellow.blockers.length > 0 ? (
          <section
            aria-label="Readiness blockers"
            className="rounded-lg bg-orange-50 border border-orange-200 p-3"
          >
            <p className="text-xs font-semibold text-orange-900 mb-1">
              Needs attention
            </p>
            <ul className="list-disc list-inside text-sm text-orange-800 space-y-0.5">
              {fellow.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-sm text-green-700">No outstanding blockers.</p>
        )}
      </div>
    </article>
  )
}

export function ProgramSummary({ overview }: { overview: ReadinessOverview }) {
  const total = overview.fellows.length
  const onTrack = overview.fellows.filter((f) => f.status === 'on_track').length
  const atRisk = overview.fellows.filter((f) => f.status === 'at_risk').length
  const behind = overview.fellows.filter((f) => f.status === 'behind').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatChip label="Active fellows" value={String(total)} />
      <StatChip label="On track" value={String(onTrack)} sub={`${atRisk} at risk · ${behind} behind`} />
      <StatChip
        label="Procedure types"
        value={String(overview.procedureTypes.length)}
        sub="tracked"
      />
      <StatChip
        label="Open evaluations"
        value={String(overview.programOpenEvaluations)}
        sub="program-wide"
      />
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-gray-300 bg-white">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003a63] flex items-center justify-center mb-4">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">No fellows enrolled yet</h3>
      <p className="text-sm text-gray-600 max-w-sm">
        Once you provision fellow accounts, each fellow&apos;s procedure progress,
        ITE scores, scholarly work, evaluations, and onboarding will roll up here.
      </p>
    </div>
  )
}

export default function CommandCenter({
  overview,
}: {
  overview: ReadinessOverview
}) {
  return (
    <section aria-label="Graduation readiness">
      <ProgramSummary overview={overview} />
      {overview.fellows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {overview.fellows.map((fellow) => (
            <FellowCard key={fellow.id} fellow={fellow} />
          ))}
        </div>
      )}
    </section>
  )
}
