'use client'

// app/schedule/YearSwitcher.tsx
// Academic-year picker for the program schedule. Sits above the editor/view and
// drives which year is shown via the ?ay=YYYY-YYYY search param (so the server
// loads the right program_schedule row). Staff + fellows can create a new year;
// staff alone can mark the shown year as the program's current year.
//
// Switching years remounts ScheduleEditor (key={academicYear} in page.tsx),
// which would silently discard unsaved edits — so we listen for the editor's
// 'schedule-editor-dirty' broadcast and confirm before any navigation while
// dirty (native confirm, mirroring the browser's beforeunload dialog).
//
// Educational schedule only — NO PHI.

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { createYear, setCurrentYear } from './actions'
import { NAVY, CRIMSON } from '@/lib/tokens'


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

  // Latest dirty flag broadcast by ScheduleEditor (it remounts on year change,
  // so state can't be shared via props/context across the switch).
  const editorDirtyRef = useRef(false)
  useEffect(() => {
    const onDirty = (e: Event) => {
      editorDirtyRef.current = Boolean((e as CustomEvent<boolean>).detail)
    }
    window.addEventListener('schedule-editor-dirty', onDirty)
    return () => window.removeEventListener('schedule-editor-dirty', onDirty)
  }, [])

  const confirmDiscardIfDirty = () =>
    !editorDirtyRef.current ||
    window.confirm('You have unsaved schedule edits. Leave without saving?')

  const go = (ay: string) => {
    if (ay === selected) return
    if (!confirmDiscardIfDirty()) return
    router.push(`${pathname}?ay=${encodeURIComponent(ay)}`)
  }

  const onCreate = () => {
    if (!confirmDiscardIfDirty()) return
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
    if (!confirmDiscardIfDirty()) return
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
