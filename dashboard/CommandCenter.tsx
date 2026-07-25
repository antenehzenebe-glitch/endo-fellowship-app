// dashboard/CommandCenter.tsx
// APD command center — graduation readiness. Pure render from a ReadinessOverview
// (no fetching, no client state).
//
// v2 STRUCTURAL redesign: a status-first readiness board.
//   - Top: a full-width overview band (shared OverviewBand) with large
//     tone-coded numerals and a one-line plain-language takeaway.
//   - Below: fellow cards led by identity + status, then ONE aggregate
//     procedure-minimums meter, then a labeled stat row (ITE · scholarly ·
//     procedure minimums · onboarding), then the per-procedure detail bars,
//     then a tidy "Needs attention" list when blockers exist.
// Evaluations are intentionally NOT shown here anymore — they live in their own
// Evaluation Summary tab under the New-Innovations-communication model.
// Color is meaning-bearing only: navy = structure, crimson = identity (PGY),
// green/amber/red = readiness state, gray = provisioning (PGY not set yet).
// Status by icon + text + color (never color alone).
import {
  type FellowReadiness,
  type ProcedureProgress,
  type ReadinessOverview,
  type ReadinessStatus,
} from '@/dashboard/queries'
import StatusPill, { type StatusTone } from '@/components/ui/StatusPill'
import Meter from '@/components/ui/Meter'
import OverviewBand from '@/components/ui/OverviewBand'
import { SUCCESS, AMBER, RED, GRAY_400 } from '@/lib/tokens'


/* -------------------------------------------------------------- status -- */
const STATUS_META: Record<
  ReadinessStatus,
  { label: string; tone: StatusTone; glyph: 'check' | 'alert' | 'cross' | 'pending'; rail: string }
> = {
  on_track: { label: 'On Track', tone: 'success', glyph: 'check', rail: SUCCESS },
  at_risk: { label: 'At Risk', tone: 'warning', glyph: 'alert', rail: AMBER },
  behind: { label: 'Behind', tone: 'danger', glyph: 'cross', rail: RED },
  provisioning: { label: 'Provisioning', tone: 'neutral', glyph: 'pending', rail: GRAY_400 },
}

function StatusGlyph({ glyph }: { glyph: 'check' | 'alert' | 'cross' | 'pending' }) {
  const common = { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': true } as const
  if (glyph === 'check') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (glyph === 'pending') {
    return (
      <svg {...common} fill="currentColor">
        <circle cx={3} cy={8} r={1.3} />
        <circle cx={8} cy={8} r={1.3} />
        <circle cx={13} cy={8} r={1.3} />
      </svg>
    )
  }
  if (glyph === 'cross') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
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
    <StatusPill tone={meta.tone} icon={<StatusGlyph glyph={meta.glyph} />}>
      {meta.label}
    </StatusPill>
  )
}

/* ----------------------------------------------------------- proc bars -- */
function ProcedureBar({ p }: { p: ProcedureProgress }) {
  const hasTarget = p.min > 0
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
      <Meter
        value={p.done}
        max={hasTarget ? p.min : 0}
        label={`${p.label}: ${p.done} logged${hasTarget ? ` of ${p.min} minimum` : ''}`}
        tone={met ? 'success' : 'primary'}
      />
    </div>
  )
}

/* --------------------------------------------------------------- chips -- */
// Kept (and exported) for compatibility with any center that imports it.
export function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900 leading-tight">{value}</p>
      {sub ? <p className="text-xs text-gray-500">{sub}</p> : null}
    </div>
  )
}

// Compact stat with a REAL, plain-language label — one line of value + a
// quiet sub-line of context.
function LabeledStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-t border-gray-100 px-1 pt-2.5 first:border-t-0 sm:border-t-0 sm:px-0 sm:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">{value}</p>
      {sub ? <p className="text-xs text-muted">{sub}</p> : null}
    </div>
  )
}

/* -------------------------------------------------------- overview band -- */
export function ReadinessBand({ overview }: { overview: ReadinessOverview }) {
  const total = overview.fellows.length
  const onTrack = overview.fellows.filter((f) => f.status === 'on_track').length
  const atRisk = overview.fellows.filter((f) => f.status === 'at_risk').length
  const behind = overview.fellows.filter((f) => f.status === 'behind').length
  // Provisioning fellows (PGY not set) sit outside all three buckets — they are
  // neither on track nor at risk until their year is known.
  const provisioning = overview.fellows.filter((f) => f.status === 'provisioning').length
  const needAttention = atRisk + behind

  return (
    <OverviewBand
      eyebrow="Readiness"
      title="Graduation readiness"
      takeaway={
        total === 0
          ? 'No fellows are enrolled yet — readiness rolls up here once they are.'
          : needAttention > 0
            ? `${needAttention} ${needAttention === 1 ? 'fellow needs' : 'fellows need'} attention this block.`
            : 'Everyone is on track this block.'
      }
      aside={`${total} active ${total === 1 ? 'fellow' : 'fellows'} · ${overview.procedureTypes.length} procedure types tracked`}
      stats={[
        { label: 'On track', value: onTrack, tone: 'success' },
        { label: 'At risk', value: atRisk, tone: 'warning' },
        { label: 'Behind', value: behind, tone: 'danger' },
        ...(provisioning > 0 ? [{ label: 'Provisioning', value: provisioning }] : []),
      ]}
    />
  )
}

/* --------------------------------------------------------- fellow card -- */
export function FellowCard({ fellow }: { fellow: FellowReadiness }) {
  const meta = STATUS_META[fellow.status]
  const severe = fellow.status === 'behind'
  const provisioning = fellow.status === 'provisioning'

  // Aggregate procedure progress toward minimums (rewards partial progress).
  const withTarget = fellow.procedures.filter((p) => p.min > 0)
  const totalMin = withTarget.reduce((s, p) => s + p.min, 0)
  const totalDone = withTarget.reduce((s, p) => s + Math.min(p.done, p.min), 0)
  const pct = totalMin > 0 ? Math.min(100, Math.round((totalDone / totalMin) * 100)) : 0
  const allMet = !provisioning && totalMin > 0 && totalDone >= totalMin

  const iteValue =
    fellow.latestIte && fellow.latestIte.percentile !== null
      ? `${fellow.latestIte.percentile}%ile`
      : '—'
  const iteSub = fellow.latestIte ? `${fellow.latestIte.examYear}` : 'no score on record'

  return (
    <article
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm border-l-4"
      style={{ borderLeftColor: meta.rail }}
    >
      {/* Header row: identity first, state immediately beside it. */}
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-lg font-semibold leading-tight text-gray-900">{fellow.name}</h3>
            {fellow.pgyLevel ? (
              <span className="inline-block rounded-md bg-crimson/10 px-2 py-0.5 text-xs font-semibold text-crimson">
                {fellow.pgyLevel}
              </span>
            ) : (
              <span className="text-xs text-muted">PGY not set</span>
            )}
          </div>
        </div>
        <ReadinessPill status={fellow.status} />
      </header>

      {/* Aggregate procedure-minimums progress: one meter, one % label. */}
      <div className="px-5 pt-4">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Procedure minimums
          </span>
          {provisioning ? (
            <span className="text-xs text-muted">starts once PGY is set</span>
          ) : (
            <span className="text-sm font-bold tabular-nums text-gray-900">{pct}%</span>
          )}
        </div>
        <Meter
          value={provisioning ? 0 : totalDone}
          max={totalMin}
          label={
            provisioning
              ? 'Procedure minimums: tracking starts once the PGY level is set'
              : `Procedure minimums: ${pct}% of the cumulative minimums reached`
          }
          tone={allMet ? 'success' : 'primary'}
        />
      </div>

      {/* Labeled stat row: the four signals a reviewer scans for. */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 px-5 pt-4 sm:grid-cols-2">
        <LabeledStat label="ITE percentile" value={iteValue} sub={iteSub} />
        <LabeledStat
          label="Scholarly work"
          value={`${fellow.scholarlyCompleted} completed`}
          sub={`${fellow.scholarlyActive} active`}
        />
        <LabeledStat
          label="Procedure minimums"
          value={provisioning ? '—' : `${fellow.proceduresMet} of ${fellow.proceduresWithTarget} met`}
          sub={provisioning ? 'PGY not set' : 'with targets set'}
        />
        <LabeledStat
          label="Onboarding"
          value={fellow.onboardingTotal > 0 ? `${fellow.onboardingDone} of ${fellow.onboardingTotal} tasks` : '—'}
          sub={fellow.onboardingTotal > 0 ? 'completed' : 'none assigned'}
        />
      </div>

      {/* Per-procedure breakdown (detail). */}
      <div className="px-5 pt-5">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Procedures
        </h4>
        <div className="grid grid-cols-1 gap-y-2">
          {fellow.procedures.map((p) => (
            <ProcedureBar key={p.code} p={p} />
          ))}
        </div>
      </div>

      {/* Needs-attention: a tidy flagged list, distinct from the calm footer. */}
      {fellow.blockers.length > 0 ? (
        <div className="px-5 pb-5 pt-4">
          <section
            aria-label="Readiness blockers"
            className={`rounded-lg border-l-4 p-3 ${
              severe ? 'border border-red-200 border-l-red-400 bg-red-50' : 'border border-amber-200 border-l-amber-400 bg-amber-50'
            }`}
          >
            <p className={`mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${severe ? 'text-red-900' : 'text-amber-900'}`}>
              <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path d="M8 5v4" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
                <path d="M8 1.5 15 14H1L8 1.5Z" strokeLinejoin="round" />
              </svg>
              Needs attention
            </p>
            <ul className={`list-disc list-inside space-y-0.5 text-sm ${severe ? 'text-red-800' : 'text-amber-800'}`}>
              {fellow.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : provisioning ? (
        <div className="mt-4 border-t border-gray-100 px-5 py-3.5">
          <p className="text-sm text-muted">
            Provisioning — readiness tracking starts once the PGY level is set.
          </p>
        </div>
      ) : (
        <div className="mt-4 border-t border-gray-100 px-5 py-3.5">
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">No fellows enrolled yet</h3>
      <p className="max-w-sm text-sm text-muted">
        Once you provision fellow accounts, each fellow&apos;s procedure progress, ITE scores, scholarly work,
        and onboarding will roll up here.
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- root -- */
export default function CommandCenter({ overview }: { overview: ReadinessOverview }) {
  return (
    <section aria-label="Graduation readiness" className="space-y-6">
      <ReadinessBand overview={overview} />
      {overview.fellows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {overview.fellows.map((fellow) => (
            <FellowCard key={fellow.id} fellow={fellow} />
          ))}
        </div>
      )}
    </section>
  )
}
