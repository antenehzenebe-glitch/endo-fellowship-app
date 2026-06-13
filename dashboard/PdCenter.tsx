// dashboard/PdCenter.tsx
// Program Director view: program-level oversight. The formal ACGME milestone
// evaluation is owned by New Innovations and is intentionally not shown here.
// This view focuses on program-wide evaluation completion plus per-fellow
// readiness.
import {
  EmptyState,
  FellowCard,
  ProgramSummary,
  StatChip,
} from '@/dashboard/CommandCenter'
import type { ReadinessOverview } from '@/dashboard/queries'

export default function PdCenter({ overview }: { overview: ReadinessOverview }) {
  const evalPct =
    overview.evaluationsTotal > 0
      ? Math.round((overview.evaluationsCompleted / overview.evaluationsTotal) * 100)
      : 0

  return (
    <section aria-label="Program oversight" className="space-y-6">
      <ProgramSummary overview={overview} />

      <section
        aria-label="Program evaluation status"
        className="rounded-xl border border-gray-200 bg-white shadow-sm p-4"
      >
        <h2 className="font-semibold text-gray-900 mb-3">Evaluation completion</h2>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900 tabular-nums">
            {evalPct}%
          </span>
          <span className="text-sm text-gray-500">
            {overview.evaluationsCompleted} of {overview.evaluationsTotal} complete
          </span>
        </div>
        <div
          className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-label={`Evaluations: ${overview.evaluationsCompleted} of ${overview.evaluationsTotal} complete`}
          aria-valuenow={overview.evaluationsCompleted}
          aria-valuemin={0}
          aria-valuemax={Math.max(overview.evaluationsTotal, 1)}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-[width] duration-300"
            style={{ width: `${evalPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <StatChip
            label="Outstanding"
            value={String(overview.programOpenEvaluations)}
            sub="not yet complete"
          />
          <StatChip label="Active fellows" value={String(overview.fellows.length)} />
          <StatChip
            label="Procedure types"
            value={String(overview.procedureTypes.length)}
            sub="tracked"
          />
        </div>

        {overview.evaluationsTotal === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No evaluations have been assigned yet. Once forms are assigned, completion
            tracks here.
          </p>
        ) : null}
      </section>

      <section aria-label="Per-fellow readiness" className="space-y-3">
        <h2 className="font-semibold text-gray-900">Fellows</h2>
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
    </section>
  )
}
