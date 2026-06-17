// procedures/RecentProcedures.tsx
// Two read views for the fellow: progress toward program minimums, and a recent
// list. Delete uses the server action with a small inline confirm. Dates are
// formatted deterministically (no locale calls) to avoid hydration drift.
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProcedure, type ProcedureOutcome } from '@/procedures/actions'

export type Progress = { code: string; label: string; done: number; min: number }
export type RecentLog = {
  id: string
  label: string
  date_performed: string // 'YYYY-MM-DD'
  outcome: ProcedureOutcome
  attendingName: string | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

const OUTCOME_BADGE: Record<ProcedureOutcome, { label: string; cls: string; dot: string }> = {
  successful: { label: 'Successful', cls: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
  learning: { label: 'Learning', cls: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' },
  incomplete: { label: 'Incomplete', cls: 'bg-orange-100 text-orange-800', dot: 'bg-orange-600' },
}

function ProgressRow({ p }: { p: Progress }) {
  const met = p.min > 0 && p.done >= p.min
  const pct = p.min > 0 ? Math.min(100, Math.round((p.done / p.min) * 100)) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-medium text-gray-800">{p.label}</span>
        <span className="text-sm text-gray-600">
          {p.min > 0 ? (
            <>
              {p.done}/{p.min}{' '}
              {met ? (
                <span className="text-green-700 font-semibold">✓ met</span>
              ) : (
                <span className="text-gray-500">to go</span>
              )}
            </>
          ) : (
            <>{p.done} logged</>
          )}
        </span>
      </div>
      {p.min > 0 && (
        <div
          className="h-2 w-full rounded-full bg-gray-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={p.done}
          aria-valuemin={0}
          aria-valuemax={p.min}
          aria-label={`${p.label}: ${p.done} of ${p.min}`}
        >
          <div
            className={`h-full rounded-full ${met ? 'bg-green-500' : 'bg-[#003a63]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function RecentProcedures({
  progress,
  logs,
}: {
  progress: Progress[]
  logs: RecentLog[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteProcedure(id)
      if (result.ok) {
        setConfirmId(null)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Progress toward minimums</h2>
        <div className="space-y-4">
          {progress.map((p) => (
            <ProgressRow key={p.code} p={p} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Recent procedures</h2>

        {error && (
          <div role="alert" className="mb-3 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <p className="text-sm text-gray-600">
            No procedures logged yet. Use the form above to add your first.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => {
              const badge = OUTCOME_BADGE[log.outcome]
              const confirming = confirmId === log.id
              return (
                <li key={log.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{log.label}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(log.date_performed)}
                        {log.attendingName ? ` • ${log.attendingName}` : ''}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} aria-hidden="true" />
                        {badge.label}
                      </span>
                    </div>

                    {confirming ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onDelete(log.id)}
                          disabled={pending}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-60"
                        >
                          {pending ? 'Deleting…' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          disabled={pending}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(log.id)}
                        className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900"
                        aria-label={`Delete ${log.label} on ${formatDate(log.date_performed)}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
