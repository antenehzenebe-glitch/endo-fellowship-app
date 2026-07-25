// dashboard/CoordinatorCenter.tsx
// Program coordinator view: the operations worklist — what still needs
// chasing (Onboarding · Acknowledgments · ITE). Evaluations are intentionally
// absent: the coordinator is excluded from the evaluation summary (it lives
// with PD/APD under the New Innovations model), so this view never reads
// evaluation data.
//
// v2 STRUCTURAL redesign: not a kanban of generic cards — an overview band
// with counts by urgency, then the worklist stacked under clear headers as
// ACTION ROWS: what's missing + who + a direct link to where it's fixed.
// Color is paired with text labels (never color alone) per DESIGN.md / WCAG.
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CoordinatorWorklist } from '@/dashboard/queries'
import OverviewBand from '@/components/ui/OverviewBand'
import { NEW_INNOVATIONS_URL } from '@/lib/links'

function ArrowGlyph() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="shrink-0">
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LaunchGlyph() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="shrink-0">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* -------------------------------------------------- worklist grouping -- */
function Group({
  eyebrow,
  title,
  count,
  action,
  children,
}: {
  eyebrow: string
  title: string
  count: number
  /** Where this whole category gets resolved. */
  action: { kind: 'internal' | 'external'; href: string; label: string }
  children: ReactNode
}) {
  return (
    <section aria-label={title} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-gray-100 px-5 py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{eyebrow}</span>
          <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
          <span
            className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
              count > 0 ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800'
            }`}
          >
            {count}
          </span>
        </div>
        {action.kind === 'internal' ? (
          <Link
            href={action.href}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md text-sm font-semibold text-primary transition-colors hover:text-primary-700 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {action.label}
            <ArrowGlyph />
          </Link>
        ) : (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${action.label} (opens in a new tab)`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md text-sm font-semibold text-primary transition-colors hover:text-primary-700 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {action.label}
            <LaunchGlyph />
          </a>
        )}
      </header>
      <div className="px-5 py-2">{children}</div>
    </section>
  )
}

// One action row: what's missing + who, with the count that needs chasing.
function ActionRow({ title, detail, count }: { title: string; detail: string; count?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{detail}</p>
      </div>
      {count ? (
        <span className="shrink-0 text-sm font-bold tabular-nums text-amber-800">{count}</span>
      ) : null}
    </div>
  )
}

function AllClear({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 py-3 text-sm text-green-700">
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </p>
  )
}

export default function CoordinatorCenter({ worklist }: { worklist: CoordinatorWorklist }) {
  const onboardingBehind = worklist.onboarding.filter((f) => f.pending > 0)
  const acksOutstanding = worklist.requiredAcks.filter((r) => r.missingNames.length > 0)
  const iteMissing = worklist.missingIteNames.length
  const noFellows = worklist.totalFellows === 0
  const outstanding = onboardingBehind.length + acksOutstanding.length + iteMissing

  return (
    <section aria-label="Operations worklist" className="space-y-6">
      <OverviewBand
        eyebrow="Operations"
        title="Operations worklist"
        takeaway={
          noFellows
            ? 'No fellows are enrolled yet — there is nothing to chase.'
            : outstanding > 0
              ? `${outstanding} ${outstanding === 1 ? 'item needs' : 'items need'} chasing this week.`
              : 'Nothing outstanding — the worklist is clear.'
        }
        stats={[
          { label: 'Onboarding behind', value: onboardingBehind.length, tone: 'warning' },
          { label: 'Acknowledgments outstanding', value: acksOutstanding.length, tone: 'warning' },
          { label: 'ITE scores missing', value: iteMissing, tone: 'danger' },
        ]}
      />

      <div className="space-y-5">
        {/* Onboarding */}
        <Group
          eyebrow="Chase first"
          title="Onboarding checklists"
          count={onboardingBehind.length}
          action={{ kind: 'internal', href: '/onboarding', label: 'Open onboarding' }}
        >
          {noFellows ? (
            <p className="py-3 text-sm text-muted">No active fellows enrolled yet.</p>
          ) : onboardingBehind.length === 0 ? (
            <AllClear message="Every fellow's checklist is complete." />
          ) : (
            onboardingBehind.map((f) => (
              <ActionRow
                key={f.fellowId}
                title={f.fellowName}
                detail={`${f.pgyLevel ?? 'Fellow'} · ${f.pending} ${f.pending === 1 ? 'task' : 'tasks'} still open`}
                count={`${f.pending}/${f.total}`}
              />
            ))
          )}
        </Group>

        {/* Acknowledgments */}
        <Group
          eyebrow="Then confirm"
          title="Policy acknowledgments"
          count={acksOutstanding.length}
          action={{ kind: 'internal', href: '/resources', label: 'Open materials' }}
        >
          {worklist.requiredAcks.length === 0 ? (
            <p className="py-3 text-sm text-muted">No resources require acknowledgment.</p>
          ) : acksOutstanding.length === 0 ? (
            <AllClear message="All required acknowledgments are in." />
          ) : (
            acksOutstanding.map((r) => (
              <ActionRow
                key={r.id}
                title={r.title}
                detail={`Awaiting: ${r.missingNames.join(', ')}`}
                count={`${r.acknowledged}/${r.totalFellows}`}
              />
            ))
          )}
        </Group>

        {/* ITE */}
        <Group
          eyebrow="Finally record"
          title="ITE scores"
          count={iteMissing}
          action={{ kind: 'external', href: NEW_INNOVATIONS_URL, label: 'New Innovations' }}
        >
          {noFellows ? (
            <p className="py-3 text-sm text-muted">No active fellows enrolled yet.</p>
          ) : iteMissing === 0 ? (
            <AllClear message="Every fellow has a score for the current academic year." />
          ) : (
            worklist.missingIteNames.map((name) => (
              <ActionRow key={name} title={name} detail="No ITE score for the current academic year" />
            ))
          )}
        </Group>
      </div>
    </section>
  )
}
