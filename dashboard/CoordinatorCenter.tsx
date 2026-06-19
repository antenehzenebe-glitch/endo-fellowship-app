// dashboard/CoordinatorCenter.tsx
// Program coordinator view: an operational kanban — three side-by-side columns
// of what still needs chasing (Onboarding · Acknowledgments · ITE). Evaluations
// are intentionally absent: the coordinator is excluded from the evaluation
// summary (it lives with PD/APD under the New Innovations model), so this view
// never reads evaluation data.
// Mobile-first: columns stack on phones, sit side-by-side from md up.
// Color is paired with text labels (never color alone) per DESIGN.md / WCAG.
import type { ReactNode } from 'react'
import type { CoordinatorWorklist } from '@/dashboard/queries'

function Column({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/60">
      <header className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold text-[#003a63]">{title}</h2>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#003a63] px-2 py-0.5 text-xs font-bold text-white tabular-nums">
          {count}
        </span>
      </header>
      <div className="flex-1 space-y-2 p-3">{children}</div>
    </section>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">{children}</div>
}

function AllClear({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 px-1 py-2 text-sm text-green-700">
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
  const noFellows = worklist.totalFellows === 0

  return (
    <section aria-label="Operations worklist" className="space-y-4">
      <p className="text-sm text-gray-600">
        What needs chasing this week — onboarding to finish, policies to acknowledge, ITE scores to enter.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
        {/* Onboarding */}
        <Column title="Onboarding" count={onboardingBehind.length}>
          {noFellows ? (
            <p className="px-1 py-2 text-sm text-gray-500">No active fellows enrolled yet.</p>
          ) : onboardingBehind.length === 0 ? (
            <AllClear message="Every fellow's checklist is complete." />
          ) : (
            onboardingBehind.map((f) => (
              <Card key={f.fellowId}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{f.fellowName}</p>
                    <p className="text-xs text-gray-500">{f.pgyLevel ?? 'Fellow'}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-orange-700 tabular-nums">
                    {f.pending}/{f.total}
                  </span>
                </div>
              </Card>
            ))
          )}
        </Column>

        {/* Acknowledgments */}
        <Column title="Acknowledgments" count={acksOutstanding.length}>
          {worklist.requiredAcks.length === 0 ? (
            <p className="px-1 py-2 text-sm text-gray-500">No resources require acknowledgment.</p>
          ) : acksOutstanding.length === 0 ? (
            <AllClear message="All required acknowledgments are in." />
          ) : (
            acksOutstanding.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-gray-900">{r.title}</p>
                  <span className="shrink-0 text-sm font-semibold text-orange-700 tabular-nums">
                    {r.acknowledged}/{r.totalFellows}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Awaiting: {r.missingNames.join(', ')}</p>
              </Card>
            ))
          )}
        </Column>

        {/* ITE */}
        <Column title="ITE scores" count={worklist.missingIteNames.length}>
          {noFellows ? (
            <p className="px-1 py-2 text-sm text-gray-500">No active fellows enrolled yet.</p>
          ) : worklist.missingIteNames.length === 0 ? (
            <AllClear message="Every fellow has a score on file." />
          ) : (
            worklist.missingIteNames.map((name) => (
              <Card key={name}>
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">No ITE score on file</p>
              </Card>
            ))
          )}
        </Column>
      </div>
    </section>
  )
}
