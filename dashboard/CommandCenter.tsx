// dashboard/CommandCenter.tsx
// APD command center — graduation readiness. Pure render from a ReadinessOverview
// (no fetching, no client state). DESIGN.md: Howard navy (#003a63) + crimson,
// status conveyed by icon + text + color (never color alone), 320px → desktop.
import { type ReactNode } from 'react'
import {
  type FellowReadiness,
  type ProcedureProgress,
  type ReadinessOverview,
  type ReadinessStatus,
} from '@/dashboard/queries'

const NAVY = '#003a63'

/* ----------------------------------------------------------------- icons -- */
const iconUsers = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconCheck = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconAlert = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M10.3 3.9 1.8 18A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconList = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconClipboard = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1zM9 13l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* -------------------------------------------------------------- status -- */
const STATUS_META: Record<
  ReadinessStatus,
  { label: string; pill: string; glyph: 'check' | 'alert' | 'cross' }
> = {
  // Severity-coded: red = most urgent (behind), amber = caution (at risk).
  on_track: { label: 'On Track', pill: 'bg-green-600 text-white', glyph: 'check' },
  at_risk: { label: 'At Risk', pill: 'bg-amber-400 text-amber-950', glyph: 'alert' },
  behind: { label: 'Behind', pill: 'bg-red-600 text-white', glyph: 'cross' },
}

function StatusGlyph({ glyph }: { glyph: 'check' | 'alert' | 'cross' }) {
  const common = { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': true } as const
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
      <path d="M8 1l7 13H1L8 1z" fillOpacity={0.15} />
      <path d="M8 5v4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.9" />
    </svg>
  )
}

function ReadinessPill({ status }: { status: ReadinessStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${meta.pill}`}>
      <StatusGlyph glyph={meta.glyph} />
      {meta.label}
    </span>
  )
}

/* ---------------------------------------------------------- procedures -- */
function ProcedureBar({ p }: { p: ProcedureProgress }) {
  const hasTarget = p.min > 0
  const pct = hasTarget ? Math.min(100, Math.round((p.done / p.min) * 100)) : p.done > 0 ? 100 : 0
  const met = hasTarget && p.done >= p.min

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-gray-700 truncate">{p.label}</span>
        <span className="text-xs tabular-nums shrink-0">
          {hasTarget ? (
            <>
              <span className="font-semibold text-gray-800">{p.done}</span>
              <span className="text-gray-400">/{p.min}</span>
              {met ? <span className="ml-1 font-semibold text-green-600" aria-label="minimum met">✓</span> : null}
            </>
          ) : (
            <>
              <span className="font-semibold text-gray-800">{p.done}</span>
              <span className="text-gray-400"> logged</span>
            </>
          )}
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full bg-gray-200 overflow-hidden"
        role="progressbar"
        aria-label={`${p.label}: ${p.done} logged${hasTarget ? ` of ${p.min} minimum` : ''}`}
        aria-valuenow={p.done}
        aria-valuemin={0}
        aria-valuemax={hasTarget ? p.min : Math.max(p.done, 1)}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: NAVY }}
        />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- chips -- */
// Kept for backwards-compatibility with any other importers.
export function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900 leading-tight">{value}</p>
      {sub ? <p className="text-xs text-gray-500">{sub}</p> : null}
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-medium text-gray-500 leading-tight">{label}</p>
      <p className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">{value}</p>
      {sub ? <p className="text-[11px] text-gray-500 leading-tight">{sub}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------- summary cards -- */
type Tone = 'default' | 'good' | 'warn' | 'alert'

const TONE: Record<Tone, { card: string; chip: string; value: string }> = {
  default: { card: 'bg-white ring-gray-900/5', chip: 'bg-gray-100 text-gray-500', value: 'text-gray-900' },
  good: { card: 'bg-white ring-gray-900/5', chip: 'bg-green-100 text-green-700', value: 'text-gray-900' },
  warn: { card: 'bg-amber-50 ring-amber-200', chip: 'bg-amber-100 text-amber-700', value: 'text-amber-900' },
  alert: { card: 'bg-red-50 ring-red-200', chip: 'bg-red-100 text-red-700', value: 'text-red-900' },
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  tone?: Tone
}) {
  const t = TONE[tone]
  return (
    <div className={`rounded-xl shadow-sm ring-1 ${t.card} p-4 flex items-start justify-between gap-3`}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className={`text-2xl font-bold leading-tight mt-0.5 ${t.value}`}>{value}</p>
        {sub ? <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p> : null}
      </div>
      <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${t.chip}`}>{icon}</span>
    </div>
  )
}

export function ProgramSummary({ overview }: { overview: ReadinessOverview }) {
  const total = overview.fellows.length
  const onTrack = overview.fellows.filter((f) => f.status === 'on_track').length
  const atRisk = overview.fellows.filter((f) => f.status === 'at_risk').length
  const behind = overview.fellows.filter((f) => f.status === 'behind').length
  const openEvals = overview.programOpenEvaluations

  const healthTone: Tone = behind > 0 ? 'alert' : atRisk > 0 ? 'warn' : 'good'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard label="Active fellows" value={String(total)} sub="enrolled" icon={iconUsers} />
      <SummaryCard
        label="On track"
        value={String(onTrack)}
        sub={`${atRisk} at risk · ${behind} behind`}
        icon={healthTone === 'good' ? iconCheck : iconAlert}
        tone={healthTone}
      />
      <SummaryCard
        label="Procedure types"
        value={String(overview.procedureTypes.length)}
        sub="tracked"
        icon={iconList}
      />
      <SummaryCard
        label="Open evaluations"
        value={String(openEvals)}
        sub={openEvals === 0 ? 'all current' : 'program-wide'}
        icon={iconClipboard}
        tone={openEvals > 0 ? 'warn' : 'default'}
      />
    </div>
  )
}

/* --------------------------------------------------------- fellow card -- */
export function FellowCard({ fellow }: { fellow: FellowReadiness }) {
  const severe = fellow.status === 'behind'
  const alertBox = severe
    ? 'bg-red-50 border-red-200'
    : 'bg-orange-50 border-orange-200'
  const alertHead = severe ? 'text-red-900' : 'text-orange-900'
  const alertBody = severe ? 'text-red-800' : 'text-orange-800'

  return (
    <article className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
      {/* Top: profile + status badge */}
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight truncate">{fellow.name}</h3>
          <p className="text-sm text-gray-500">{fellow.pgyLevel ?? 'Fellow'}</p>
        </div>
        <ReadinessPill status={fellow.status} />
      </header>

      {/* Body: procedures (left) | 2x2 mini-metrics (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5 p-5">
        <section aria-label="Procedure progress" className="space-y-2.5">
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

        <section aria-label="Other readiness metrics" className="grid grid-cols-2 gap-2 content-start">
          <MiniStat
            label="Latest ITE"
            value={fellow.latestIte && fellow.latestIte.percentile !== null ? `${fellow.latestIte.percentile}%ile` : '—'}
            sub={fellow.latestIte ? `${fellow.latestIte.examYear}` : 'no score'}
          />
          <MiniStat label="Scholarly" value={`${fellow.scholarlyCompleted} done`} sub={`${fellow.scholarlyActive} active`} />
          <MiniStat
            label="Onboarding"
            value={fellow.onboardingTotal > 0 ? `${fellow.onboardingDone}/${fellow.onboardingTotal}` : '—'}
            sub={fellow.onboardingTotal > 0 ? 'tasks done' : 'none assigned'}
          />
          <MiniStat
            label="Open evals"
            value={String(fellow.openEvaluations)}
            sub={fellow.openEvaluations === 0 ? 'all current' : 'outstanding'}
          />
        </section>
      </div>

      {/* Bottom: needs-attention alert */}
      {fellow.blockers.length > 0 ? (
        <div className="px-5 pb-5">
          <section aria-label="Readiness blockers" className={`rounded-lg border p-3 ${alertBox}`}>
            <p className={`text-xs font-semibold mb-1 ${alertHead}`}>Needs attention</p>
            <ul className={`list-disc list-inside text-sm space-y-0.5 ${alertBody}`}>
              {fellow.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="px-5 pb-4">
          <p className="inline-flex items-center gap-1.5 text-sm text-green-700">
            <span className="text-green-600">{/* check */}✓</span> No outstanding blockers.
          </p>
        </div>
      )}
    </article>
  )
}

/* --------------------------------------------------------- empty state -- */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003a63] flex items-center justify-center mb-4">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">No fellows enrolled yet</h3>
      <p className="text-sm text-gray-600 max-w-sm">
        Once you provision fellow accounts, each fellow&apos;s procedure progress, ITE scores, scholarly work,
        evaluations, and onboarding will roll up here.
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- root -- */
export default function CommandCenter({ overview }: { overview: ReadinessOverview }) {
  return (
    <section aria-label="Graduation readiness">
      <ProgramSummary overview={overview} />
      {overview.fellows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {overview.fellows.map((fellow) => (
            <FellowCard key={fellow.id} fellow={fellow} />
          ))}
        </div>
      )}
    </section>
  )
}