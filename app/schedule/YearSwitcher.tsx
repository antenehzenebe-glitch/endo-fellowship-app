'use client'

// app/schedule/YearSwitcher.tsx
// Academic-year picker for the program schedule. Sits above the editor/view and
// drives which year is shown via the ?ay=YYYY-YYYY search param (so the server
// loads the right program_schedule row). Staff + fellows can create a new year;
// staff alone can mark the shown year as the program's current year.
//
// Educational schedule only — NO PHI.

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createYear, setCurrentYear } from './actions'

const NAVY = '#003a63'
const CRIMSON = '#c8102e'

type YearOption = { academic_year: string; is_current: boolean }

export default function YearSwitcher({
  years,
  selected,
  canCreate,
  canSetCurrent,
}: {
  years: YearOption[]
  selected: string
  canCreate: boolean
  canSetCurrent: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const go = (ay: string) => router.push(`${pathname}?ay=${encodeURIComponent(ay)}`)

  const onCreate = () => {
    setError(null)
    const input = window.prompt(
      'New academic year (YYYY-YYYY), e.g. 2026-2027.\nIt starts from this year\u2019s fellows & rotations with an empty block grid you can generate.'
    )
    if (!input) return
    startTransition(async () => {
      const r = await createYear(input.trim(), selected || undefined)
      if (r.ok) {
        router.push(`${pathname}?ay=${encodeURIComponent(r.academic_year)}`)
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  const onSetCurrent = () => {
    setError(null)
    startTransition(async () => {
      const r = await setCurrentYear(selected)
      if (r.ok) router.refresh()
      else setError(r.error)
    })
  }

  const selectedIsCurrent =
    years.find((y) => y.academic_year === selected)?.is_current ?? false

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="ay-select" className="text-sm font-semibold text-slate-700">
          Academic year
        </label>
        <select
          id="ay-select"
          value={selected}
          onChange={(e) => go(e.target.value)}
          className="text-sm font-medium border border-slate-300 rounded-md px-3 bg-white focus:outline-none focus:ring-2"
          style={{ caretColor: NAVY, minHeight: 44 }}
        >
          {years.length === 0 && <option value={selected}>{selected}</option>}
          {years.map((y) => (
            <option key={y.academic_year} value={y.academic_year}>
              {y.academic_year}
              {y.is_current ? '  \u2022 current' : ''}
            </option>
          ))}
        </select>

        {selectedIsCurrent && (
          <span
            className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded text-white"
            style={{ background: NAVY }}
          >
            Current year
          </span>
        )}

        <div className="flex-1" />

        {canSetCurrent && !selectedIsCurrent && (
          <button
            onClick={onSetCurrent}
            disabled={isPending}
            className="text-sm font-medium px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            style={{ minHeight: 44 }}
          >
            Set as current
          </button>
        )}
        {canCreate && (
          <button
            onClick={onCreate}
            disabled={isPending}
            className="text-sm font-semibold px-4 rounded-md text-white disabled:opacity-50"
            style={{ background: CRIMSON, minHeight: 44 }}
          >
            + New academic year
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
