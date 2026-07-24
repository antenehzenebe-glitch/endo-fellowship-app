'use client'

// app/onboarding/OnboardingChecklist.tsx
// The fellow's interactive checklist for ONE group (Institutional Onboarding or
// Training & Development). Status cycling with immediate server persistence and
// a progress header; completed items move to the bottom with a strikethrough.
//
// CHANGE (this revision): two-column layout on ≥sm screens — header/progress spans
// the full width; task rows flow into a 2-col grid (1-col on phones) so the
// checklist no longer reads as one long column on the newly widened page.
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOnboardingStatus, type OnboardingStatus } from './actions'

export type OnboardingTask = {
  id: string
  task_name: string
  description: string | null
  status: OnboardingStatus
  completed_at: string | null
}

const STATUS_LABEL: Record<OnboardingStatus, string> = {
  pending: 'To do',
  in_progress: 'In progress',
  completed: 'Done',
}

const NEXT: Record<OnboardingStatus, OnboardingStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

function StatusChip({ status, onClick, disabled }: { status: OnboardingStatus; onClick: () => void; disabled: boolean }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors min-h-[36px]'
  if (status === 'completed')
    return (
      <button onClick={onClick} disabled={disabled} aria-label="Mark as to do" className={`${base} bg-green-600 border-green-600 text-white`}>
        ✓ Done
      </button>
    )
  if (status === 'in_progress')
    return (
      <button onClick={onClick} disabled={disabled} aria-label="Mark as done" className={`${base} bg-amber-400 border-amber-400 text-amber-950`}>
        ◐ In progress
      </button>
    )
  return (
    <button onClick={onClick} disabled={disabled} aria-label="Mark as in progress" className={`${base} bg-white border-gray-300 text-gray-600 hover:border-gray-400`}>
      ○ To do
    </button>
  )
}

export default function OnboardingChecklist({
  title,
  subtitle,
  initialTasks,
}: {
  title: string
  subtitle?: string
  initialTasks: OnboardingTask[]
}) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const done = tasks.filter((t) => t.status === 'completed').length
  const total = tasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  function cycle(task: OnboardingTask) {
    const next = NEXT[task.status]
    // Optimistic update
    setTasks((ts) =>
      ts.map((t) =>
        t.id === task.id
          ? { ...t, status: next, completed_at: next === 'completed' ? new Date().toISOString() : null }
          : t
      )
    )
    setError(null)
    startTransition(async () => {
      const res = await updateOnboardingStatus(task.id, next)
      if (!res.ok) {
        // Roll back on failure
        setTasks((ts) => ts.map((t) => (t.id === task.id ? task : t)))
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  const active = tasks.filter((t) => t.status !== 'completed')
  const complete = tasks.filter((t) => t.status === 'completed')

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 sm:px-5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-sm font-semibold text-gray-700 tabular-nums">
            {done} / {total}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
          <div className="h-full rounded-full bg-green-600 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {error && (
        <div role="alert" className="mx-4 mt-3 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700 sm:mx-5">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-100 sm:grid sm:grid-cols-2 sm:divide-y-0">
        {[...active, ...complete].map((t) => {
          const isDone = t.status === 'completed'
          return (
            <li key={t.id} className="px-4 py-3 flex items-start gap-3 sm:px-5 sm:border-b sm:border-gray-100">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium leading-snug ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {t.task_name}
                </p>
                {t.description && (
                  <p className={`text-xs mt-0.5 leading-relaxed ${isDone ? 'text-gray-300' : 'text-gray-500'}`}>
                    {t.description}
                  </p>
                )}
                {isDone && t.completed_at && (
                  <p className="text-xs text-green-700 mt-0.5">
                    Completed {new Date(t.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <StatusChip status={t.status} disabled={pending} onClick={() => cycle(t)} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
