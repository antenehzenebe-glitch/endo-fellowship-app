// dashboard/EvalSummary.tsx
// Read-only mid-year / end-of-year evaluation MATRIX for PD / APD / Chief.
// Fellows (rows) × checkpoints (columns) with colored status cells. The official
// evaluation lives in New Innovations; this is the program's internal summary.
// Server component (no interactivity). Mobile-first: real <table> with row/col
// headers; color is ALWAYS paired with an icon + text label (never color alone)
// per DESIGN.md / WCAG. De-identified educational records — NO PHI.
import type { ReactNode } from 'react'
import type { EvalCell, EvalSummaryData } from '@/dashboard/evaluationSummary'

/* ------------------------------------------------------------- icons -- */
const iconCheck = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconProgress = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconPending = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
)

type CellMeta = { label: string; cellClass: string; icon: ReactNode }

function metaFor(cell: EvalCell): CellMeta {
  if (cell?.status === 'completed') {
    return { label: 'Completed', cellClass: 'bg-green-50 text-green-800', icon: iconCheck }
  }
  if (cell?.status === 'in_progress') {
    return { label: 'In progress', cellClass: 'bg-amber-50 text-amber-800', icon: iconProgress }
  }
  return { label: 'Not started', cellClass: 'bg-gray-50 text-gray-500', icon: iconPending }
}

function StatusCell({ cell }: { cell: EvalCell }) {
  const m = metaFor(cell)
  const when =
    cell?.status === 'completed' && cell.completedAt
      ? new Date(cell.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : null
  return (
    <td className={`border border-gray-200 px-3 py-3 text-center align-middle ${m.cellClass}`}>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
        <span aria-hidden="true">{m.icon}</span>
        {m.label}
      </span>
      {when ? <span className="mt-0.5 block text-xs font-normal text-green-700">{when}</span> : null}
    </td>
  )
}

export default function EvalSummary({ summary }: { summary: EvalSummaryData }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-[#003a63]">Evaluation Summary</h2>
        <span className="text-sm text-gray-500">Academic year {summary.academicYear}</span>
      </div>
      <p className="text-sm text-gray-600">
        The official evaluation is completed in New Innovations; this is the program&apos;s summary.
      </p>

      {summary.fellows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="font-semibold text-gray-800">No active fellows yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Mid-year and end-of-year evaluation status for each active fellow, academic year {summary.academicYear}.
              </caption>
              <thead>
                <tr className="bg-[#003a63] text-white">
                  <th scope="col" className="px-3 py-2.5 text-left font-semibold">Fellow</th>
                  <th scope="col" className="px-3 py-2.5 text-center font-semibold">Mid-year</th>
                  <th scope="col" className="px-3 py-2.5 text-center font-semibold">End-of-year</th>
                </tr>
              </thead>
              <tbody>
                {summary.fellows.map((f) => (
                  <tr key={f.id}>
                    <th scope="row" className="border border-gray-200 bg-white px-3 py-3 text-left align-middle">
                      <span className="block font-semibold text-[#003a63] leading-snug">{f.name}</span>
                      {f.pgyLevel ? (
                        <span className="mt-0.5 inline-block rounded bg-[#003a63]/10 px-1.5 py-0.5 text-xs font-semibold text-[#003a63]">
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><span className="text-green-700" aria-hidden="true">{iconCheck}</span>Completed</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-amber-700" aria-hidden="true">{iconProgress}</span>In progress (draft saved)</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-gray-400" aria-hidden="true">{iconPending}</span>Not started</span>
          </div>
        </>
      )}
    </section>
  )
}
