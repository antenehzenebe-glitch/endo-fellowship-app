'use client'

// app/onboarding/OnboardingChecklist.tsx
// A tappable checklist for one group of a fellow's tasks (Institutional
// Onboarding or Training & Development). Each row toggles pending<->completed
// against public.onboarding_tasks (RLS lets a fellow update own rows).
// Optimistic UI; reverts on error.
//
// CHANGE (this revision): the progress bar now sits at the END of the checklist
// (after the items) and shows a numeric "X% complete" label, with proper
// progressbar semantics. The header keeps the count + tap hint only.
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OnboardingTask = {
  id: string
  task_name: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
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
  const supabase = createClient()
  const [tasks, setTasks] = useState<OnboardingTask[]>(initialTasks)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const done = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks])
  const total = tasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  const toggle = async (task: OnboardingTask) => {
    setError('')
    const completing = task.status !== 'completed'
    const nextStatus: OnboardingTask['status'] = completing ? 'completed' : 'pending'
    const nextCompletedAt = completing ? new Date().toISOString() : null

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, completed_at: nextCompletedAt } : t)),
    )
    setSavingId(task.id)

    const { error: updErr } = await supabase
      .from('onboarding_tasks')
      .update({ status: nextStatus, completed_at: nextCompletedAt })
      .eq('id', task.id)

    setSavingId(null)

    if (updErr) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status, completed_at: task.completed_at } : t)),
      )
      setError('Could not save that change. Check your connection and try again.')
    }
  }

  if (total === 0) return null

  return (
    <div className="space-y-3">
      {/* Header: title + count + tap hint (no bar here anymore) */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <span className="text-sm font-medium text-gray-700">{done}/{total}</span>
        </div>
        {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        <p className="text-xs text-gray-400 mt-1">
          Tap an item to mark it complete. {done === total ? 'All done!' : `${total - done} left.`}
        </p>
      </section>

      {/* Tasks */}
      <ul className="space-y-2">
        {tasks.map((task) => {
          const completed = task.status === 'completed'
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => toggle(task)}
                disabled={savingId === task.id}
                aria-pressed={completed}
                className={`w-full text-left flex items-start gap-3 rounded-xl border p-4 transition-colors disabled:opacity-60 ${
                  completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                    completed ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className="min-w-0">
                  <span className={`block font-medium ${completed ? 'text-green-900' : 'text-gray-900'}`}>
                    {task.task_name}
                  </span>
                  {task.description ? (
                    <span className={`block text-sm ${completed ? 'text-green-800/80' : 'text-gray-500'}`}>
                      {task.description}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs">
                    {completed ? (
                      <span className="text-green-700">
                        Completed{task.completed_at ? ` · ${new Date(task.completed_at).toLocaleDateString()}` : ''} — tap to undo
                      </span>
                    ) : (
                      <span className="text-gray-400">Not done — tap to mark complete</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Progress bar at the END — fills by percentage, with a numeric label. */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold tabular-nums text-[#003a63]">
            {pct}% complete
            <span className="ml-1 font-normal text-gray-400">({done}/{total})</span>
          </span>
        </div>
        <div
          className="h-3 w-full rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#003a63] transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {done === total ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-green-700">
            <span aria-hidden="true">✓</span> All items complete.
          </p>
        ) : null}
      </section>

      {error ? (
        <div role="alert" className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  )
}