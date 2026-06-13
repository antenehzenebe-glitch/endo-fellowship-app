// procedures/ProcedureLogForm.tsx
// Mobile-first rapid-entry form. Controlled inputs + a server action; on success
// we reset and refresh so the recent list / progress below update. Accessible:
// real <label>s, 44px targets, focus rings, aria-busy on submit.
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logProcedure, type ProcedureOutcome } from '@/procedures/actions'

type TypeOption = { code: string; label: string }
type AttendingOption = { id: string; full_name: string }

const OUTCOME_OPTIONS: { value: ProcedureOutcome; label: string }[] = [
  { value: 'successful', label: 'Successful' },
  { value: 'learning', label: 'Learning experience' },
  { value: 'incomplete', label: 'Incomplete' },
]

export function ProcedureLogForm({
  types,
  attendings,
  todayStr,
}: {
  types: TypeOption[]
  attendings: AttendingOption[]
  todayStr: string // server-computed 'YYYY-MM-DD'; keeps SSR/client initial value identical
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [procedureType, setProcedureType] = useState('')
  const [datePerformed, setDatePerformed] = useState(todayStr)
  const [outcome, setOutcome] = useState<ProcedureOutcome>('successful')
  const [attendingId, setAttendingId] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const result = await logProcedure({
        procedure_type: procedureType,
        date_performed: datePerformed,
        outcome,
        supervising_attending_id: attendingId || null,
        notes: notes || null,
      })
      if (result.ok) {
        setMessage({ kind: 'ok', text: 'Procedure logged.' })
        setProcedureType('')
        setDatePerformed(todayStr)
        setOutcome('successful')
        setAttendingId('')
        setNotes('')
        router.refresh()
      } else {
        setMessage({ kind: 'error', text: result.error })
      }
    })
  }

  const field = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0066CC]'
  const labelCls = 'block text-sm font-semibold text-gray-800 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="procedure-type" className={labelCls}>
          Procedure
        </label>
        <select
          id="procedure-type"
          value={procedureType}
          onChange={(e) => setProcedureType(e.target.value)}
          className={field}
          required
        >
          <option value="">Choose a procedure…</option>
          {types.map((t) => (
            <option key={t.code} value={t.code}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date-performed" className={labelCls}>
          Date performed
        </label>
        <input
          id="date-performed"
          type="date"
          value={datePerformed}
          max={todayStr}
          onChange={(e) => setDatePerformed(e.target.value)}
          className={field}
          required
        />
      </div>

      <div>
        <label htmlFor="outcome" className={labelCls}>
          Outcome
        </label>
        <select
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as ProcedureOutcome)}
          className={field}
        >
          {OUTCOME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="attending" className={labelCls}>
          Supervising attending <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <select
          id="attending"
          value={attendingId}
          onChange={(e) => setAttendingId(e.target.value)}
          className={field}
        >
          <option value="">— None / unsupervised —</option>
          {attendings.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>
          Teaching notes <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={field}
          placeholder="Technique, learning points…"
          aria-describedby="notes-help"
        />
        <p id="notes-help" className="mt-1 text-xs text-gray-500">
          No patient identifiers (no names, MRNs, or dates of birth).
        </p>
      </div>

      {message && (
        <div
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={
            message.kind === 'ok'
              ? 'p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800'
              : 'p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700'
          }
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full py-3 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] active:bg-[#003D7A] disabled:opacity-60 transition-colors"
      >
        {pending ? 'Saving…' : 'Log procedure'}
      </button>
    </form>
  )
}
