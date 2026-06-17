// dashboard/EvalSummary.tsx
// Read-only mid-year / end-of-year evaluation overview for PD / APD / Chief.
// Mobile-first: one card per fellow with two labeled checkpoints.
import type { EvalCell, EvalSummaryData } from '@/dashboard/evaluationSummary'

function StatusBadge({ cell }: { cell: EvalCell }) {
  if (!cell) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        Not started
      </span>
    )
  }
  if (cell.status === 'completed') {
    const when = cell.completedAt
      ? new Date(cell.completedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        Completed{when ? ` · ${when}` : ''}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      {cell.status === 'in_progress' ? 'In progress' : 'Pending'}
    </span>
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
        Mid-year and end-of-year reviews for each fellow. Completed reviews appear
        here automatically.
      </p>

      {summary.fellows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="font-semibold text-gray-800">No active fellows yet</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.fellows.map((f) => (
            <li key={f.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-[#003a63] leading-snug">{f.name}</h3>
                {f.pgyLevel ? (
                  <span className="shrink-0 rounded-md bg-[#003a63]/10 px-2 py-0.5 text-xs font-semibold text-[#003a63]">
                    {f.pgyLevel}
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-medium text-gray-700">Mid-year</dt>
                  <dd>
                    <StatusBadge cell={f.midYear} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-medium text-gray-700">End-of-year</dt>
                  <dd>
                    <StatusBadge cell={f.endOfYear} />
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
