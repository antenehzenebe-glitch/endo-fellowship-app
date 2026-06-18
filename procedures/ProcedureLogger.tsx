// procedures/ProcedureLogger.tsx
// Mobile Procedure Logger — redesigned. Tap a procedure card (which shows your
// count toward the program minimum) to open a quick-entry sheet; date/outcome/
// attending are taps, not dropdowns; the note stays collapsed until needed.
// "Log" and "History" are two views so nothing stacks into a long scroll.
//
// Drop-in replacement for ProcedureLogForm + RecentProcedures. Same server
// actions (logProcedure / deleteProcedure) — fellow_id is set server-side from
// the session, so RLS is the enforcer. No PHI: notes are teaching context only.
'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logProcedure, deleteProcedure, type ProcedureOutcome } from '@/procedures/actions'

const NAVY = '#003a63'
const CRIMSON = '#c8102e'

// Same shapes the page already builds — re-exported here so app/log/page.tsx
// imports its types from this module instead of the old RecentProcedures.
export type Progress = { code: string; label: string; done: number; min: number }
export type RecentLog = {
  id: string
  label: string
  date_performed: string // 'YYYY-MM-DD'
  outcome: ProcedureOutcome
  attendingName: string | null
}

type Attending = { id: string; full_name: string }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
function addDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + delta)
  return dt.toISOString().slice(0, 10)
}

const OUTCOMES: { value: ProcedureOutcome; label: string; cls: string; dot: string }[] = [
  { value: 'successful', label: 'Successful', cls: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
  { value: 'learning', label: 'Learning', cls: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' },
  { value: 'incomplete', label: 'Incomplete', cls: 'bg-orange-100 text-orange-800', dot: 'bg-orange-600' },
]
const outcomeMeta = (v: ProcedureOutcome) => OUTCOMES.find((o) => o.value === v) ?? OUTCOMES[0]

export function ProcedureLogger({
  progress,
  attendings,
  logs,
  todayStr,
}: {
  progress: Progress[]
  attendings: Attending[]
  logs: RecentLog[]
  todayStr: string
}) {
  const router = useRouter()
  const [view, setView] = useState<'log' | 'history'>('log')
  const [active, setActive] = useState<Progress | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  function openCard(p: Progress) {
    setError(null)
    setActive(p)
  }

  function submitLog(entry: {
    date_performed: string
    outcome: ProcedureOutcome
    supervising_attending_id: string | null
    notes: string | null
  }) {
    if (!active) return
    const label = active.label
    setError(null)
    startTransition(async () => {
      const result = await logProcedure({
        procedure_type: active.code,
        date_performed: entry.date_performed,
        outcome: entry.outcome,
        supervising_attending_id: entry.supervising_attending_id,
        notes: entry.notes,
      })
      if (result.ok) {
        setActive(null)
        setToast(`${label} logged ✓`)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      {/* Log / History toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg mb-5">
        {(['log', 'history'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setView(k)}
            className="py-2 text-sm font-semibold rounded-md transition-colors"
            style={view === k ? { background: 'white', color: NAVY, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } : { color: '#6b7280' }}
            aria-pressed={view === k}
          >
            {k === 'log' ? 'Log' : 'History'}
          </button>
        ))}
      </div>

      {view === 'log' ? (
        <>
          <p className="text-sm text-gray-500 mb-3">Tap a procedure to log it.</p>
          <div className="grid grid-cols-2 gap-3">
            {progress.map((p) => {
              const met = p.min > 0 && p.done >= p.min
              const pct = p.min > 0 ? Math.min(100, Math.round((p.done / p.min) * 100)) : 0
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => openCard(p)}
                  className="text-left rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  style={{ borderColor: met ? '#86efac' : '#e5e7eb' }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-gray-900 text-sm leading-snug">{p.label}</span>
                    {met ? <span className="text-green-600 text-xs font-bold shrink-0">✓</span> : null}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: NAVY }}>{p.done}</span>
                    <span className="text-sm text-gray-400">{p.min > 0 ? `/ ${p.min}` : 'logged'}</span>
                  </div>
                  {p.min > 0 ? (
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden mt-2">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: met ? '#22c55e' : NAVY }} />
                    </div>
                  ) : (
                    <div className="h-1.5 mt-2" />
                  )}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: CRIMSON }}>
                    + Log one
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-5 text-center">
            No patient identifiers anywhere — counts and dates only.
          </p>
        </>
      ) : (
        <HistoryView logs={logs} onDeleted={() => router.refresh()} />
      )}

      {active ? (
        <QuickEntrySheet
          procedure={active}
          attendings={attendings}
          todayStr={todayStr}
          pending={pending}
          error={error}
          onClose={() => setActive(null)}
          onSubmit={submitLog}
        />
      ) : null}

      {toast ? (
        <div className="fixed inset-x-0 bottom-5 flex justify-center px-4 pointer-events-none z-50">
          <div className="text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg" style={{ background: NAVY }}>
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function QuickEntrySheet({
  procedure,
  attendings,
  todayStr,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  procedure: Progress
  attendings: Attending[]
  todayStr: string
  pending: boolean
  error: string | null
  onClose: () => void
  onSubmit: (entry: {
    date_performed: string
    outcome: ProcedureOutcome
    supervising_attending_id: string | null
    notes: string | null
  }) => void
}) {
  const yesterday = useMemo(() => addDays(todayStr, -1), [todayStr])
  const [date, setDate] = useState(todayStr)
  const [showDatePick, setShowDatePick] = useState(false)
  const [outcome, setOutcome] = useState<ProcedureOutcome>('successful')
  const [attendingId, setAttendingId] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(r)
  }, [])

  function close() {
    setShown(false)
    setTimeout(onClose, 180)
  }

  const dateChips = [
    { key: 'today', lbl: 'Today', val: todayStr },
    { key: 'yest', lbl: 'Yesterday', val: yesterday },
  ]
  const isPreset = dateChips.some((c) => c.val === date) && !showDatePick

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-200"
        style={{ opacity: shown ? 1 : 0 }}
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Log ${procedure.label}`}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-200 ease-out"
        style={{ transform: shown ? 'translateY(0)' : 'translateY(100%)', maxHeight: '88vh', overflowY: 'auto' }}
      >
        <div className="max-w-md mx-auto px-5 pt-3 pb-6">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: CRIMSON }}>Log procedure</p>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{procedure.label}</h2>
            </div>
            <button onClick={close} className="w-9 h-9 grid place-items-center rounded-full text-gray-400 hover:bg-gray-100" aria-label="Close">✕</button>
          </div>

          {/* When */}
          <p className="text-sm font-semibold text-gray-800 mb-1.5">When?</p>
          <div className="flex gap-2 flex-wrap">
            {dateChips.map((c) => (
              <Chip key={c.key} active={date === c.val && !showDatePick} onClick={() => { setDate(c.val); setShowDatePick(false) }}>
                {c.lbl}
              </Chip>
            ))}
            <Chip active={showDatePick} onClick={() => setShowDatePick(true)}>Pick a date</Chip>
          </div>
          {showDatePick ? (
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]"
            />
          ) : null}
          {!isPreset && !showDatePick ? <p className="text-xs text-gray-500 mt-1">{formatDate(date)}</p> : null}

          {/* Outcome */}
          <p className="text-sm font-semibold text-gray-800 mb-1.5 mt-4">How did it go?</p>
          <div className="grid grid-cols-3 gap-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOutcome(o.value)}
                className="py-2.5 text-sm font-medium rounded-lg border transition-colors"
                style={outcome === o.value
                  ? { background: NAVY, color: 'white', borderColor: NAVY }
                  : { background: 'white', color: '#374151', borderColor: '#d1d5db' }}
                aria-pressed={outcome === o.value}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Attending */}
          <p className="text-sm font-semibold text-gray-800 mb-1.5 mt-4">
            Supervising attending <span className="font-normal text-gray-400">(optional)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            <Chip active={attendingId === ''} onClick={() => setAttendingId('')}>None</Chip>
            {attendings.map((a) => (
              <Chip key={a.id} active={attendingId === a.id} onClick={() => setAttendingId(a.id)}>
                {a.full_name}
              </Chip>
            ))}
          </div>

          {/* Note (collapsed) */}
          <div className="mt-4">
            {!showNote ? (
              <button type="button" onClick={() => setShowNote(true)} className="text-sm font-medium" style={{ color: NAVY }}>
                + Add teaching note
              </button>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800 mb-1.5">Teaching note</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Technique, learning points…"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]"
                />
                <p className="mt-1 text-xs text-gray-500">No patient identifiers (no names, MRNs, or dates of birth).</p>
              </>
            )}
          </div>

          {error ? (
            <div role="alert" className="mt-4 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          ) : null}

          {/* Submit */}
          <button
            type="button"
            disabled={pending}
            aria-busy={pending}
            onClick={() => onSubmit({ date_performed: date, outcome, supervising_attending_id: attendingId || null, notes: note || null })}
            className="w-full mt-5 py-3.5 text-white font-semibold rounded-xl active:scale-[0.99] transition-transform disabled:opacity-60"
            style={{ background: CRIMSON }}
          >
            {pending ? 'Saving…' : `Log ${procedure.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-2 text-sm font-medium rounded-full border transition-colors"
      style={active
        ? { background: NAVY, color: 'white', borderColor: NAVY }
        : { background: 'white', color: '#374151', borderColor: '#d1d5db' }}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function HistoryView({ logs, onDeleted }: { logs: RecentLog[]; onDeleted: () => void }) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function remove(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteProcedure(id)
      if (result.ok) {
        setConfirmId(null)
        onDeleted()
      } else {
        setError(result.error)
      }
    })
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-600 text-center py-8">
        No procedures logged yet. Switch to <span className="font-medium">Log</span> to add your first.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div role="alert" className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{error}</div>
      ) : null}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {logs.map((log) => {
          const m = outcomeMeta(log.outcome)
          const confirming = confirmId === log.id
          return (
            <div key={log.id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{log.label}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(log.date_performed)}
                  {log.attendingName ? ` • ${log.attendingName}` : ''}
                </p>
                <span className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} aria-hidden="true" />
                  {m.label}
                </span>
              </div>
              {confirming ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => remove(log.id)}
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
          )
        })}
      </div>
    </div>
  )
}