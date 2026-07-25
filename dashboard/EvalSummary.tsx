// dashboard/EvalSummary.tsx
// Read-only mid-year / end-of-year evaluation MATRIX for PD / APD / Chief.
// Fellows (rows) × checkpoints (columns) with status-pill cells. The official
// evaluation lives in New Innovations; this is the program's internal summary.
// Server component (no interactivity).
//
// v2 STRUCTURAL redesign: opens with the shared overview band ("X of Y
// complete for the period", with the new-year "aren't due yet" note folded
// into the takeaway), then a real matrix with a sticky first column, zebra
// rows, generous padding, and StatusPill status cells that match the legend
// exactly. Color is ALWAYS paired with an icon + text label (never color
// alone) per DESIGN.md / WCAG. De-identified educational records — NO PHI.
import type { ReactNode } from 'react'
import type { EvalCell, EvalSummaryData } from '@/dashboard/evaluationSummary'
import StatusPill, { type StatusTone } from '@/components/ui/StatusPill'
import OverviewBand from '@/components/ui/OverviewBand'

/* ------------------------------------------------------------- icons -- */
const iconCheck = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconProgress = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconPending = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
)

type CellMeta = { label: string; tone: StatusTone; icon: ReactNode }

function metaFor(cell: EvalCell): CellMeta {
  if (cell?.status === 'completed') {
    return { label: 'Completed', tone: 'success', icon: iconCheck }
  }
  if (cell?.status === 'in_progress') {
    return { label: 'In progress', tone: 'warning', icon: iconProgress }
  }
  return { label: 'Not started', tone: 'neutral', icon: iconPending }
}

function StatusCell({ cell }: { cell: EvalCell }) {
  const m = metaFor(cell)
  const when =
    cell?.status === 'completed' && cell.completedAt
      ? new Date(cell.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : null
  return (
    <td className="border-b border-gray-100 px-4 py-4 text-center align-middle">
      <StatusPill tone={m.tone} variant="soft" icon={m.icon}>
        {m.label}
      </StatusPill>
      {when ? <span className="mt-1 block text-xs text-green-700">{when}</span> : null}
    </td>
  )
}

export default function EvalSummary({ summary }: { summary: EvalSummaryData }) {
  const total = summary.fellows.length
  const midDone = summary.fellows.filter((f) => f.midYear?.status === 'completed').length
  const eoyDone = summary.fellows.filter((f) => f.endOfYear?.status === 'completed').length
  const possible = total * 2
  const done = midDone + eoyDone

  return (
    <section className="space-y-6">
      <OverviewBand
        eyebrow="Evaluations"
        title="Evaluation summary"
        takeaway={
          total === 0
            ? 'No active fellows yet — the matrix fills in once fellows are enrolled.'
            : summary.hasAnyEvaluations
              ? `${done} of ${possible} evaluations complete for the ${summary.academicYear} academic year.`
              : 'New academic year — evaluations aren’t due yet.'
        }
        aside={`Academic year ${summary.academicYear}`}
        stats={[
          { label: 'Mid-year complete', value: total > 0 ? `${midDone}/${total}` : '—', tone: midDone === total && total > 0 ? 'success' : 'default' },
          { label: 'End-of-year complete', value: total > 0 ? `${eoyDone}/${total}` : '—', tone: eoyDone === total && total > 0 ? 'success' : 'default' },
          { label: 'Overall complete', value: possible > 0 ? `${done}/${possible}` : '—', tone: done === possible && possible > 0 ? 'success' : 'default' },
        ]}
      />

      <p className="text-sm text-muted">
        The official evaluation is completed in New Innovations; this is the program&apos;s summary.
      </p>

      {summary.fellows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm">
          <p className="font-semibold text-gray-800">No active fellows yet</p>
          <p className="mt-1 text-sm text-muted">Once fellows are enrolled, mid-year and end-of-year status will show here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">
                Mid-year and end-of-year evaluation status for each active fellow, academic year {summary.academicYear}.
              </caption>
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50 text-left text-gray-600">
                  <th scope="col" className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-semibold">
                    Fellow
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-semibold">Mid-year</th>
                  <th scope="col" className="px-4 py-3 text-center font-semibold">End-of-year</th>
                </tr>
              </thead>
              <tbody>
                {summary.fellows.map((f, i) => (
                  <tr key={f.id} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    {/* Sticky identity column: same SOLID background value as
                        the row so no seam shows while scrolling horizontally;
                        long names truncate instead of crushing the matrix. */}
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 max-w-[10rem] border-b border-gray-100 px-4 py-4 text-left align-middle sm:max-w-none ${
                        i % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                      }`}
                    >
                      <span className="block truncate font-semibold text-primary leading-snug">{f.name}</span>
                      {f.pgyLevel ? (
                        <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                          {f.pgyLevel}
                        </span>
                      ) : null}
                    </th>
                    <StatusCell cell={f.midYear} />
                    <StatusCell cell={f.endOfYear} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend uses the same shared pills as the cells so the three
              states read identically everywhere. */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="success" variant="soft" icon={iconCheck}>Completed</StatusPill>
            <StatusPill tone="warning" variant="soft" icon={iconProgress}>In progress (draft saved)</StatusPill>
            <StatusPill tone="neutral" variant="soft" icon={iconPending}>Not started</StatusPill>
          </div>
        </div>
      )}
    </section>
  )
}
