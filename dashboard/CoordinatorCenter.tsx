// dashboard/CoordinatorCenter.tsx
// Program coordinator view: an operational worklist. Not analytics — a punch
// list of what's outstanding and needs chasing (evaluations to collect,
// onboarding to finish, required policies to acknowledge, ITE scores to enter).
import type { ReactNode } from 'react'
import { StatChip } from '@/dashboard/CommandCenter'
import type {
  CoordinatorWorklist,
  OutstandingEvaluation,
} from '@/dashboard/queries'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Deterministic date formatting (no locale/timezone drift): 'YYYY-MM-DD' → 'Jun 5, 2026'.
function formatDate(d: string | null): string {
  if (!d) return 'No due date'
  const [y, m, day] = d.split('-').map((n) => parseInt(n, 10))
  if (!y || !m || !day) return d
  return `${MONTHS[m - 1]} ${day}, ${y}`
}

const TODAY = new Date().toISOString().slice(0, 10)

function EvalStatusBadge({ status }: { status: OutstandingEvaluation['status'] }) {
  const isInProgress = status === 'in_progress'
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        isInProgress ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {isInProgress ? 'In progress' : 'Not started'}
    </span>
  )
}

function SectionCard({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className="text-xs font-medium text-gray-500 tabular-nums">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

function AllClear({ message }: { message: string }) {
  return (
    <p className="text-sm text-green-700 flex items-center gap-1.5">
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </p>
  )
}

export default function CoordinatorCenter({
  worklist,
}: {
  worklist: CoordinatorWorklist
}) {
  const onboardingOpen = worklist.onboarding.reduce((sum, f) => sum + f.pending, 0)
  const policiesAwaiting = worklist.requiredAcks.filter(
    (r) => r.missingNames.length > 0,
  ).length
  const fellowsBehindOnboarding = worklist.onboarding.filter((f) => f.pending > 0)

  return (
    <section aria-label="Operations worklist" className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip
          label="Open evaluations"
          value={String(worklist.outstandingEvaluations.length)}
          sub="to collect"
        />
        <StatChip
          label="Onboarding tasks"
          value={String(onboardingOpen)}
          sub="still pending"
        />
        <StatChip
          label="Policies awaiting"
          value={String(policiesAwaiting)}
          sub="not fully acknowledged"
        />
        <StatChip
          label="ITE gaps"
          value={String(worklist.missingIteNames.length)}
          sub="no score on file"
        />
      </div>

      {/* Outstanding evaluations */}
      <SectionCard
        title="Outstanding evaluations"
        count={worklist.outstandingEvaluations.length}
      >
        {worklist.outstandingEvaluations.length === 0 ? (
          <AllClear message="All assigned evaluations are complete." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {worklist.outstandingEvaluations.map((e) => {
              const overdue = e.dueDate !== null && e.dueDate < TODAY
              return (
                <li key={e.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {e.formName}
                      {e.periodLabel ? (
                        <span className="font-normal text-gray-500"> · {e.periodLabel}</span>
                      ) : null}
                    </p>
                    <p className="text-sm text-gray-600">
                      {e.evaluatorName}
                      <span className="text-gray-400"> evaluating </span>
                      {e.subjectName ?? 'the program'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <EvalStatusBadge status={e.status} />
                    <p
                      className={`text-xs mt-1 ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}
                    >
                      {overdue ? 'Overdue · ' : ''}
                      {formatDate(e.dueDate)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      {/* Onboarding */}
      <SectionCard title="Onboarding in progress" count={fellowsBehindOnboarding.length}>
        {worklist.totalFellows === 0 ? (
          <p className="text-sm text-gray-500">No active fellows enrolled yet.</p>
        ) : fellowsBehindOnboarding.length === 0 ? (
          <AllClear message="Every fellow's onboarding checklist is complete." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {fellowsBehindOnboarding.map((f) => (
              <li key={f.fellowId} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.fellowName}</p>
                  <p className="text-sm text-gray-500">{f.pgyLevel ?? 'Fellow'}</p>
                </div>
                <span className="text-sm text-orange-700 font-medium tabular-nums">
                  {f.pending} of {f.total} open
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Required acknowledgments */}
      <SectionCard title="Required acknowledgments" count={worklist.requiredAcks.length}>
        {worklist.requiredAcks.length === 0 ? (
          <p className="text-sm text-gray-500">
            No resources currently require acknowledgment.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {worklist.requiredAcks.map((r) => {
              const complete = r.missingNames.length === 0
              return (
                <li key={r.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900 min-w-0 truncate">
                      {r.title}
                    </p>
                    <span
                      className={`text-sm font-medium tabular-nums shrink-0 ${
                        complete ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
                      {r.acknowledged}/{r.totalFellows} acknowledged
                    </span>
                  </div>
                  {!complete ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Awaiting: {r.missingNames.join(', ')}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      {/* ITE gaps */}
      <SectionCard title="ITE score gaps" count={worklist.missingIteNames.length}>
        {worklist.totalFellows === 0 ? (
          <p className="text-sm text-gray-500">No active fellows enrolled yet.</p>
        ) : worklist.missingIteNames.length === 0 ? (
          <AllClear message="Every active fellow has at least one ITE score on file." />
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {worklist.missingIteNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </SectionCard>
    </section>
  )
}
