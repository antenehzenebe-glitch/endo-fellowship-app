'use client'

import { useActionState } from 'react'
import { logProcedure, type LogProcedureState } from '@/procedures/actions'

interface AttendingOption {
  id: string
  full_name: string
}

interface ProcedureOption {
  code: string
  label: string
}

interface ProcedureLogFormProps {
  attendings: AttendingOption[]
  procedureTypes: ProcedureOption[] // active catalog rows, APD-managed
  today: string // YYYY-MM-DD, computed server-side
}

const OUTCOME_OPTIONS = [
  { value: 'successful', label: 'Successful' },
  { value: 'learning', label: 'Learning' },
  { value: 'incomplete', label: 'Incomplete' },
] as const

const INITIAL_STATE: LogProcedureState = { error: null, success: false }

// Rapid mobile entry between patients: five fields, native inputs, one screen.
export default function ProcedureLogForm({ attendings, procedureTypes, today }: ProcedureLogFormProps) {
  const [state, formAction, pending] = useActionState(logProcedure, INITIAL_STATE)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="procedure_type" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Procedure
        </label>
        <select
          id="procedure_type"
          name="procedure_type"
          required
          defaultValue=""
          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="" disabled>
            Choose a procedure…
          </option>
          {procedureTypes.map((p) => (
            <option key={p.code} value={p.code}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date_performed" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Date performed
        </label>
        <input
          id="date_performed"
          name="date_performed"
          type="date"
          required
          defaultValue={today}
          max={today}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-gray-700 mb-1.5">Outcome</legend>
        <div className="grid grid-cols-3 gap-2">
          {OUTCOME_OPTIONS.map((o, i) => (
            <label
              key={o.value}
              className="flex items-center justify-center gap-2 px-2 py-3 border border-gray-300 rounded-lg cursor-pointer text-sm font-medium has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800"
            >
              <input
                type="radio"
                name="outcome"
                value={o.value}
                defaultChecked={i === 0}
                className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-primary-600"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="supervising_attending_id"
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          Supervising attending <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <select
          id="supervising_attending_id"
          name="supervising_attending_id"
          defaultValue=""
          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="">None / not supervised</option>
          {attendings.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Teaching notes <span className="font-normal text-gray-500">(optional — never patient details)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="e.g. ultrasound-guided, diagnostic sample on first pass"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <p className="mt-1 text-xs text-gray-500">
          No PHI: no patient names, MRNs, or dates of birth.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60 transition-colors"
      >
        {pending ? 'Saving…' : 'Log procedure'}
      </button>

      {state.error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && !state.error && (
        <div role="status" className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Procedure logged. It now counts toward your minimums below.
        </div>
      )}
    </form>
  )
}
