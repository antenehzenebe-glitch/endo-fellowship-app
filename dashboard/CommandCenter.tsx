// dashboard/CommandCenter.tsx
// APD command center — graduation readiness. Pure render from a ReadinessOverview
// (no fetching, no client state).
//
// Redesign: a readiness BOARD, not a vertical scroll.
//   - Top: navy health banner with colored On-track / At-risk / Behind counts.
//   - Below: fellow cards in a 2-up grid, each led by a status-colored left rail
//     and a procedure completion ring (summary), with the per-procedure bars kept
//     as the detail beneath.
// Evaluations are intentionally NOT shown here anymore — they live in their own
// Evaluation Summary tab under the New-Innovations-communication model.
// Color is meaning-bearing only: navy = structure, crimson = identity (PGY),
// green/amber/red = readiness state. Status by icon + text + color (never color alone).
import {
  type FellowReadiness,
  type ProcedureProgress,
  type ReadinessOverview,
  type ReadinessStatus,
} from '@/dashboard/queries'

const NAVY = '#003a63'

/* -------------------------------------------------------------- status -- */
const STATUS_META: Record<
  ReadinessStatus,
  { label: string; pill: string; glyph: 'check' | 'alert' | 'cross'; rail: string }
> = {
  on_track: { label: 'On Track', pill: 'bg-green-600 text-white', glyph: 'check', rail: '#16a34a' },
  at_risk: { label: 'At Risk', pill: 'bg-amber-400 text-amber-950', glyph: 'alert', rail: '#f59e0b' },
  behind: { label: 'Behind', pill: 'bg-red-600 text-white', glyph: 'cross', rail: '#dc2626' },
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

/* ----------------------------------------------------------- proc ring -- */
function ProcedureRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  const r = 24
  const circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  const complete = pct >= 100 && total > 0
  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={complete ? '#16a34a' : NAVY}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold tabular-nums text-gray-900">{pct}%</span>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- proc bars -- */
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
          style={{ width: `${pct}%`, backgroundColor: met ? '#16a34a' : NAVY }}
        />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- chips -- */
// Kept (and exported) for the PD and Coordinator centers that import it.
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

/* ------------------------------------------------------- health banner -- */
function BannerStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'good' | 'warn' | 'alert'
}) {
  // Color appears only where the bucket is non-empty; "0 behind" stays calm.
  const color =
    value === 0
      ? 'text-gray-300'
      : tone === 'good'
        ? 'text-green-600'
        : tone === 'warn'
          ? 'text-amber-500'
          : 'text-red-600'
  return (
    <div className="px-4 py-4 text-center">
      <p className={`text-3xl font-bold tabular-nums leading-none ${color}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1.5">{label}</p>
    </div>
  )
}

export function ProgramSummary({ overview }: { overview: ReadinessOverview }) {
  const total = overview.fellows.length
  const onTrack = overview.fellows.filter((f) => f.status === 'on_track').length
  const atRisk = overview.fellows.filter((f) => f.status === 'at_risk').length
  const behind = overview.fellows.filter((f) => f.status === 'behind').length

  return (
    <div className="mb-6 overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-900/5">
      <div className="bg-gradient-to-r from-[#003a63] to-[#00598f] px-5 py-4">
        <h2 className="text-white font-semibold text-lg leading-tight">Graduation readiness</h2>
        <p className="text-white/70 text-sm mt-0.5">
          {total} active {total === 1 ? 'fellow' : 'fellows'} ·{' '}
          {overview.procedureTypes.length} procedure types tracked
        </p>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white">
        <BannerStat label="On track" value={onTrack} tone="good" />
        <BannerStat label="At risk" value={atRisk} tone="warn" />
        <BannerStat label="Behind" value={behind} tone="alert" />
      </div>
    </div>
  )
}

/* --------------------------------------------------------- fellow card -- */
export function FellowCard({ fellow }: { fellow: FellowReadiness }) {
  const meta = STATUS_META[fellow.status]
  const severe = fellow.status === 'behind'

  // Aggregate procedure progress toward minimums (rewards partial progress).
  const withTarget = fellow.procedures.filter((p) => p.min > 0)
  const totalMin = withTarget.reduce((s, p) => s + p.min, 0)
  const totalDone = withTarget.reduce((s, p) => s + Math.min(p.done, p.min), 0)

  return (
    <article
      className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 border-l-4 overflow-hidden"
      style={{ borderLeftColor: meta.rail }}
    >
      {/* Header: identity + status */}
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight truncate">{fellow.name}</h3>
          {fellow.pgyLevel ? (
            <span className="mt-1 inline-block rounded-md bg-[#c8102e]/10 px-2 py-0.5 text-xs font-semibold text-[#c8102e]">
              {fellow.pgyLevel}
            </span>
          ) : (
            <p className="text-sm text-gray-500">Fellow</p>
          )}
        </div>
        <ReadinessPill status={fellow.status} />
      </header>

      {/* Ring (summary) + mini-metrics */}
      <div className="flex gap-4 px-5 pb-4">
        <div className="flex flex-col items-center shrink-0">
          <ProcedureRing done={totalDone} total={totalMin} />
          <span className="mt-1.5 text-[11px] text-gray-500 tabular-nums">
            {fellow.proceduresMet}/{fellow.proceduresWithTarget} mins met
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 content-start">
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
        </div>
      </div>

      {/* Procedure breakdown (detail) */}
      <div className="px-5 pb-4">
        <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Procedures</h4>
        <div className="grid grid-cols-1 gap-y-2">
          {fellow.procedures.map((p) => (
            <ProcedureBar key={p.code} p={p} />
          ))}
        </div>
      </div>

      {/* Needs-attention */}
      {fellow.blockers.length > 0 ? (
        <div className="px-5 pb-5">
          <section
            aria-label="Readiness blockers"
            className={`rounded-lg border p-3 ${severe ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
          >
            <p className={`text-xs font-semibold mb-1 ${severe ? 'text-red-900' : 'text-amber-900'}`}>Needs attention</p>
            <ul className={`list-disc list-inside text-sm space-y-0.5 ${severe ? 'text-red-800' : 'text-amber-800'}`}>
              {fellow.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="px-5 pb-4 pt-2 border-t border-gray-50">
          <p className="inline-flex items-center gap-1.5 text-sm text-green-700">
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            On track — no blockers
          </p>
        </div>
      )}
    </article>
  )
}

/* --------------------------------------------------------- empty state -- */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003a63] flex items-center justify-center mb-4">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">No fellows enrolled yet</h3>
      <p className="text-sm text-gray-600 max-w-sm">
        Once you provision fellow accounts, each fellow&apos;s procedure progress, ITE scores, scholarly work,
        and onboarding will roll up here.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {overview.fellows.map((fellow) => (
            <FellowCard key={fellow.id} fellow={fellow} />
          ))}
        </div>
      )}
    </section>
  )
}
