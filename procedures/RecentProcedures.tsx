import type { ProcedureLog, ProcedureTarget } from '@/lib/supabase/database.types'

interface RecentProceduresProps {
  logs: ProcedureLog[]
  targets: ProcedureTarget[]
  countsByType: Record<string, number>
  procedureLabels: Record<string, string> // code -> label, from the catalog
  attendingNames: Record<string, string>
}

const OUTCOME_BADGES: Record<ProcedureLog['outcome'], { label: string; className: string }> = {
  successful: { label: '✓ Successful', className: 'bg-green-100 text-green-800' },
  learning: { label: '◐ Learning', className: 'bg-orange-100 text-orange-800' },
  incomplete: { label: '✕ Incomplete', className: 'bg-gray-100 text-gray-800' },
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Progress toward program minimums (ACGME graduation readiness: counts here
// are compared against APD-set `procedure_targets`), plus the fellow's most
// recent entries. Status uses text + symbol, never color alone (DESIGN.md).
export default function RecentProcedures({
  logs,
  targets,
  countsByType,
  procedureLabels,
  attendingNames,
}: RecentProceduresProps) {
  const labelFor = (code: string) => procedureLabels[code] ?? code
  return (
    <div className="space-y-8">
      {targets.length > 0 && (
        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="text-xl font-bold text-gray-900 mb-3">
            Progress vs. minimums
          </h2>
          <ul className="space-y-3">
            {targets.map((t) => {
              const count = countsByType[t.procedure_type] ?? 0
              const met = t.min_total > 0 ? count >= t.min_total : true
              const pct = t.min_total > 0 ? Math.min(100, Math.round((count / t.min_total) * 100)) : 100
              return (
                <li key={t.procedure_type} className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex justify-between items-baseline mb-2 gap-2">
                    <span className="font-semibold text-sm">
                      {labelFor(t.procedure_type)}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        met ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {count} / {t.min_total} {met ? '✓ met' : 'to go'}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={t.min_total}
                    aria-label={`${labelFor(t.procedure_type)}: ${count} of ${t.min_total} minimum`}
                    className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full rounded-full ${met ? 'bg-green-500' : 'bg-primary-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="text-xl font-bold text-gray-900 mb-3">
          Recent entries
        </h2>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">No procedures logged yet</h3>
            <p className="text-sm text-gray-600">
              Your first entry above starts your count toward the program minimums.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => {
              const badge = OUTCOME_BADGES[log.outcome]
              const attending = log.supervising_attending_id
                ? attendingNames[log.supervising_attending_id]
                : null
              return (
                <li key={log.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-base">
                      {labelFor(log.procedure_type)}
                    </h3>
                    <span className={`shrink-0 px-2 py-1 text-xs rounded font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(log.date_performed)}
                    {attending ? ` • ${attending}` : ''}
                  </p>
                  {log.notes && <p className="mt-2 text-sm text-gray-700">{log.notes}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
