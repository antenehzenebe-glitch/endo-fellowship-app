'use client'

// app/schedule/ScheduleEditor.tsx
// Staff-only editor for the program schedule. Body-only — the route owns the
// page header and auth gate. Save calls the staff-only `saveSchedule` action,
// which upserts program_schedule (id='current'); RLS blocks non-staff writes at
// the database. De-identified PROGRAM data only — NO PHI.
//
// Three editable layers, mirroring the program's paper sheets:
//   1. Weekly skeleton + Fellows + Rotation vocabulary
//   2. Annual block grid — attending-of-the-month + each fellow's rotation/vacation
//   3. Monthly didactic calendars — dated sessions + coverage footer

import { useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveSchedule } from './actions'
import {
  KIND_COLOR,
  WEEKDAYS,
  WEEKLY_KINDS,
  emptyCoverage,
  ymToLabel,
  type CalendarSession,
  type MonthCoverage,
  type ScheduleBlock,
  type ScheduleConfig,
  type ScheduleFellow,
  type ScheduleMonth,
  type ScheduleWeekly,
  type SchedulePayload,
  type WeekendCoverage,
  type WeeklyKind,
} from '@/lib/schedule'

const NAVY = '#003a63'
const CRIMSON = '#c8102e'
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 7)}`
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o))
const lastDayOfMonth = (y: number, mIdx0: number) => new Date(y, mIdx0 + 1, 0).getDate()

type SaveState = 'idle' | 'saved' | 'error'

export default function ScheduleEditor({ initial }: { initial: SchedulePayload }) {
  const router = useRouter()
  const [academicYear, setAcademicYear] = useState(initial.academic_year)
  const [config, setConfig] = useState<ScheduleConfig>(() => clone(initial.config))
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(initial))
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [newRotation, setNewRotation] = useState('')
  const [newMonthYm, setNewMonthYm] = useState('')
  const [selectedMonthId, setSelectedMonthId] = useState<string>(
    () => initial.config.months?.[0]?.id ?? ''
  )
  const [isPending, startTransition] = useTransition()

  const payload = useMemo<SchedulePayload>(
    () => ({ academic_year: academicYear, config }),
    [academicYear, config]
  )
  const payloadJson = useMemo(() => JSON.stringify(payload), [payload])
  const isDirty = payloadJson !== savedSnapshot

  const handleSave = useCallback(() => {
    const json = payloadJson
    setErrorMsg(null)
    startTransition(async () => {
      const r = await saveSchedule(payload)
      if (r.ok) {
        setSavedSnapshot(json)
        setSaveState('saved')
        router.refresh()
      } else {
        setSaveState('error')
        setErrorMsg(r.error)
      }
    })
  }, [payload, payloadJson, router])

  const revertChanges = useCallback(() => {
    try {
      const parsed = JSON.parse(savedSnapshot) as SchedulePayload
      setConfig(clone(parsed.config))
      setAcademicYear(parsed.academic_year)
      setSelectedMonthId(parsed.config.months?.[0]?.id ?? '')
      setSaveState('idle')
      setErrorMsg(null)
    } catch {
      /* keep current state if the snapshot can't be parsed */
    }
  }, [savedSnapshot])

  // ---- weekly skeleton ----
  const setWeekly = (next: ScheduleWeekly[]) => setConfig((c) => ({ ...c, weekly: next }))
  const updateRow = (id: string, patch: Partial<ScheduleWeekly>) =>
    setConfig((c) => ({
      ...c,
      weekly: c.weekly.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  const toggleDay = (id: string, day: string) =>
    setConfig((c) => ({
      ...c,
      weekly: c.weekly.map((r) => {
        if (r.id !== id) return r
        const has = r.days.includes(day)
        const days = has ? r.days.filter((d) => d !== day) : [...r.days, day]
        days.sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b))
        return { ...r, days }
      }),
    }))
  const addRow = () =>
    setWeekly([
      ...config.weekly,
      { id: uid('w'), activity: '', days: [], start: '08:00', end: '09:00', kind: 'other', note: '' },
    ])
  const removeRow = (id: string) => setWeekly(config.weekly.filter((r) => r.id !== id))

  // ---- fellows ----
  const addFellow = () =>
    setConfig((c) => ({
      ...c,
      fellows: [...c.fellows, { id: uid('f'), name: '', pgy: 'PGY-4' }],
    }))
  const updateFellow = (id: string, patch: Partial<ScheduleFellow>) =>
    setConfig((c) => ({
      ...c,
      fellows: c.fellows.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }))
  const removeFellow = (id: string) =>
    setConfig((c) => ({
      ...c,
      fellows: c.fellows.filter((f) => f.id !== id),
      blocks: c.blocks.map((b) => {
        const a = { ...b.assignments }
        delete a[id]
        return { ...b, assignments: a }
      }),
    }))

  // ---- rotation vocabulary ----
  const addRotation = () => {
    const v = newRotation.trim()
    if (!v || config.rotations.includes(v)) return
    setConfig((c) => ({ ...c, rotations: [...c.rotations, v] }))
    setNewRotation('')
  }
  const removeRotation = (name: string) =>
    setConfig((c) => ({ ...c, rotations: c.rotations.filter((r) => r !== name) }))

  // ---- block grid ----
  const setBlocks = (next: ScheduleBlock[]) => setConfig((c) => ({ ...c, blocks: next }))
  const blankAssignments = (): Record<string, string> =>
    Object.fromEntries(config.fellows.map((f) => [f.id, '']))
  const generateYear = () => {
    const [startYear] = academicYear.split('-').map(Number)
    if (!startYear || Number.isNaN(startYear)) return
    const blocks: ScheduleBlock[] = MONTHS.map((m, i) => {
      const y = i <= 5 ? startYear : startYear + 1 // Jul–Dec year1, Jan–Jun year2
      const mIdx0 = (6 + i) % 12 // Jul = month index 6
      const mm = String(mIdx0 + 1).padStart(2, '0')
      const end = lastDayOfMonth(y, mIdx0)
      const fullName = new Date(Date.UTC(y, mIdx0, 1)).toLocaleString('en-US', {
        month: 'long',
        timeZone: 'UTC',
      })
      return {
        id: uid('b'),
        label: fullName,
        start: `${y}-${mm}-01`,
        end: `${y}-${mm}-${String(end).padStart(2, '0')}`,
        attending: '',
        assignments: blankAssignments(),
      }
    })
    setBlocks(blocks)
  }
  const addBlock = () =>
    setBlocks([
      ...config.blocks,
      {
        id: uid('b'),
        label: `Block ${config.blocks.length + 1}`,
        start: '',
        end: '',
        attending: '',
        assignments: blankAssignments(),
      },
    ])
  const updateBlock = (id: string, patch: Partial<ScheduleBlock>) =>
    setBlocks(config.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const setAssignment = (blockId: string, fellowId: string, value: string) =>
    setBlocks(
      config.blocks.map((b) =>
        b.id === blockId ? { ...b, assignments: { ...b.assignments, [fellowId]: value } } : b
      )
    )
  const removeBlock = (id: string) => setBlocks(config.blocks.filter((b) => b.id !== id))

  // ---- monthly calendars ----
  const setMonths = (next: ScheduleMonth[]) => setConfig((c) => ({ ...c, months: next }))
  const addMonth = () => {
    const ym = newMonthYm.trim()
    if (!/^\d{4}-\d{2}$/.test(ym)) return
    if (config.months.some((mo) => mo.ym === ym)) {
      setSelectedMonthId(config.months.find((mo) => mo.ym === ym)?.id ?? '')
      setNewMonthYm('')
      return
    }
    const id = uid('m')
    const next = [...config.months, { id, ym, label: ymToLabel(ym), sessions: [], coverage: emptyCoverage() }]
    next.sort((a, b) => a.ym.localeCompare(b.ym))
    setMonths(next)
    setSelectedMonthId(id)
    setNewMonthYm('')
  }
  const updateMonth = (id: string, patch: Partial<ScheduleMonth>) =>
    setMonths(config.months.map((mo) => (mo.id === id ? { ...mo, ...patch } : mo)))
  const removeMonth = (id: string) => {
    const next = config.months.filter((mo) => mo.id !== id)
    setMonths(next)
    if (selectedMonthId === id) setSelectedMonthId(next[0]?.id ?? '')
  }
  const updateCoverage = (id: string, patch: Partial<MonthCoverage>) =>
    setMonths(
      config.months.map((mo) => (mo.id === id ? { ...mo, coverage: { ...mo.coverage, ...patch } } : mo))
    )
  const addSession = (monthId: string) =>
    setMonths(
      config.months.map((mo) =>
        mo.id === monthId
          ? { ...mo, sessions: [...mo.sessions, { id: uid('s'), date: '', title: '' }] }
          : mo
      )
    )
  const updateSession = (monthId: string, sid: string, patch: Partial<CalendarSession>) =>
    setMonths(
      config.months.map((mo) =>
        mo.id === monthId
          ? { ...mo, sessions: mo.sessions.map((s) => (s.id === sid ? { ...s, ...patch } : s)) }
          : mo
      )
    )
  const removeSession = (monthId: string, sid: string) =>
    setMonths(
      config.months.map((mo) =>
        mo.id === monthId ? { ...mo, sessions: mo.sessions.filter((s) => s.id !== sid) } : mo
      )
    )
  const addWeekend = (monthId: string) =>
    setMonths(
      config.months.map((mo) =>
        mo.id === monthId
          ? {
              ...mo,
              coverage: {
                ...mo.coverage,
                weekend: [...mo.coverage.weekend, { id: uid('wk'), who: '', dates: '' }],
              },
            }
          : mo
      )
    )
  const updateWeekend = (monthId: string, wid: string, patch: Partial<WeekendCoverage>) =>
    setMonths(
      config.months.map((mo) =>
        mo.id === monthId
          ? {
              ...mo,
              coverage: {
                ...mo.coverage,
                weekend: mo.coverage.weekend.map((w) => (w.id === wid ? { ...w, ...patch } : w)),
              },
            }
          : mo
      )
    )
  const removeWeekend = (monthId: string, wid: string) =>
    setMonths(
      config.months.map((mo) =>
        mo.id === monthId
          ? {
              ...mo,
              coverage: { ...mo.coverage, weekend: mo.coverage.weekend.filter((w) => w.id !== wid) },
            }
          : mo
      )
    )

  const selectedMonth = config.months.find((mo) => mo.id === selectedMonthId) ?? null

  const saveLabel = isPending
    ? 'Saving…'
    : isDirty
      ? 'Save changes'
      : saveState === 'saved'
        ? 'Saved ✓'
        : 'Save'

  return (
    <div className="space-y-6">
      {/* body header */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-slate-900">Schedule editor</h2>
        <span
          style={{ background: CRIMSON }}
          className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-white"
        >
          Staff
        </span>
      </div>

      {/* sticky save bar */}
      <div className="sticky top-0 z-30 border border-slate-200 rounded-lg bg-white/95 backdrop-blur">
        <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium text-slate-600">Academic year</label>
          <span className="text-sm font-semibold text-slate-900 bg-slate-100 rounded px-2 py-1">
            {academicYear}
          </span>
          <span className="text-xs text-slate-400">(switch years above)</span>
          <div className="flex-1" />
          {isDirty && <span className="text-xs font-medium text-amber-600">Unsaved changes</span>}
          {isDirty && (
            <button
              onClick={revertChanges}
              className="text-sm font-medium px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Revert
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="text-sm font-semibold px-4 py-1.5 rounded text-white disabled:opacity-50"
            style={{ background: isDirty ? CRIMSON : NAVY }}
          >
            {saveLabel}
          </button>
        </div>
        {errorMsg && (
          <div className="px-4 pb-2.5 -mt-1">
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* shared rotation suggestions for the block grid */}
      <datalist id="rotation-suggestions">
        {config.rotations.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {/* ============ 1. WEEKLY SKELETON ============ */}
      <section>
        <SectionHead
          n="1"
          title="Weekly Skeleton"
          hint="Recurring weekly activities (clinic, didactics). The specific Wed/Fri didactic sessions live in the monthly calendar below."
        />
        <div className="space-y-3">
          {config.weekly.map((row) => (
            <div key={row.id} className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4">
              <div className="flex gap-3 items-start">
                <span
                  className="mt-2 w-1.5 h-8 rounded shrink-0"
                  style={{ background: KIND_COLOR[row.kind] || '#475569' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      value={row.activity}
                      onChange={(e) => updateRow(row.id, { activity: e.target.value })}
                      placeholder="Activity name"
                      className="flex-1 min-w-[180px] font-semibold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
                    />
                    <select
                      value={row.kind}
                      onChange={(e) => updateRow(row.id, { kind: e.target.value as WeeklyKind })}
                      className="text-xs font-medium border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white"
                    >
                      {WEEKLY_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-slate-400 hover:text-red-600 text-sm px-1"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {WEEKDAYS.map((d) => {
                      const on = row.days.includes(d)
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDay(row.id, d)}
                          className="text-xs font-medium rounded px-2.5 py-1 border transition-colors"
                          style={
                            on
                              ? { background: NAVY, color: 'white', borderColor: NAVY }
                              : { background: 'white', color: '#64748b', borderColor: '#cbd5e1' }
                          }
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-3 mt-2.5 items-center flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={row.start}
                        onChange={(e) => updateRow(row.id, { start: e.target.value })}
                        className="text-sm border border-slate-300 rounded px-2 py-1"
                      />
                      <span className="text-slate-400 text-sm">–</span>
                      <input
                        type="time"
                        value={row.end}
                        onChange={(e) => updateRow(row.id, { end: e.target.value })}
                        className="text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                    <input
                      value={row.note || ''}
                      onChange={(e) => updateRow(row.id, { note: e.target.value })}
                      placeholder="Note (optional)"
                      className="flex-1 min-w-[160px] text-sm text-slate-600 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="mt-3 text-sm font-medium" style={{ color: NAVY }}>
          + Add weekly activity
        </button>
      </section>

      {/* ============ 2. FELLOWS ============ */}
      <section>
        <SectionHead
          n="2"
          title="Fellows"
          hint="The fellows shown as columns in the block grid. Update names/PGY here to roll the grid forward to a new class."
        />
        <div className="space-y-2">
          {config.fellows.map((f) => (
            <div key={f.id} className="flex items-center gap-2 flex-wrap bg-white border border-slate-200 rounded-lg p-2.5">
              <input
                value={f.name}
                onChange={(e) => updateFellow(f.id, { name: e.target.value })}
                placeholder="Dr. Name"
                className="flex-1 min-w-[160px] text-sm font-medium border border-slate-300 rounded px-2 py-1.5"
              />
              <input
                value={f.pgy}
                onChange={(e) => updateFellow(f.id, { pgy: e.target.value })}
                placeholder="PGY-4"
                className="w-24 text-sm border border-slate-300 rounded px-2 py-1.5"
              />
              <button
                onClick={() => removeFellow(f.id)}
                className="text-slate-400 hover:text-red-600 px-1"
                title="Remove fellow"
              >
                ✕
              </button>
            </div>
          ))}
          {config.fellows.length === 0 && (
            <p className="text-sm text-slate-400">No fellows yet — add one below.</p>
          )}
        </div>
        <button onClick={addFellow} className="mt-3 text-sm font-medium" style={{ color: NAVY }}>
          + Add fellow
        </button>
      </section>

      {/* ============ 3. ROTATION VOCABULARY ============ */}
      <section>
        <SectionHead
          n="3"
          title="Rotation Suggestions"
          hint="Quick-pick values offered while typing block-grid cells. Cells accept free text too (e.g. “Vacation (19-30)”)."
        />
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            {config.rotations.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 text-sm rounded-full pl-3 pr-2 py-1 border"
                style={{ borderColor: '#cbd5e1', background: '#f8fafc' }}
              >
                {r}
                <button
                  onClick={() => removeRotation(r)}
                  className="text-slate-400 hover:text-red-600"
                  title="Remove"
                >
                  ✕
                </button>
              </span>
            ))}
            {config.rotations.length === 0 && (
              <span className="text-sm text-slate-400">No suggestions yet.</span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={newRotation}
              onChange={(e) => setNewRotation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addRotation()
                }
              }}
              placeholder="Add a rotation…"
              className="flex-1 text-sm border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2"
            />
            <button
              onClick={addRotation}
              className="text-sm font-medium px-3 py-1.5 rounded text-white"
              style={{ background: NAVY }}
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* ============ 4. BLOCK GRID ============ */}
      <section>
        <SectionHead
          n="4"
          title="Annual Block Grid"
          hint="Attending-of-the-month plus each fellow's rotation per month. Generate a standard Jul–Jun set, or add blocks manually."
        />
        <div className="flex gap-2 flex-wrap mb-3">
          <button
            onClick={generateYear}
            className="text-sm font-medium px-3 py-1.5 rounded text-white"
            style={{ background: CRIMSON }}
          >
            Generate monthly blocks ({academicYear})
          </button>
          <button
            onClick={addBlock}
            className="text-sm font-medium px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            + Add block
          </button>
          {config.blocks.length > 0 && (
            <button
              onClick={() => setBlocks([])}
              className="text-sm font-medium px-3 py-1.5 rounded text-slate-500 hover:text-red-600"
            >
              Clear all
            </button>
          )}
        </div>

        {config.blocks.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-sm text-slate-500">
            No blocks yet. Generate a standard year or add one manually.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ background: NAVY }} className="text-white text-left">
                  <th
                    className="px-3 py-2.5 font-semibold sticky left-0 z-10"
                    style={{ background: NAVY, minWidth: 140 }}
                  >
                    Block
                  </th>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ minWidth: 150 }}>
                    Attending
                  </th>
                  {config.fellows.map((f) => (
                    <th
                      key={f.id}
                      className="px-3 py-2.5 font-semibold whitespace-nowrap"
                      style={{ minWidth: 150 }}
                    >
                      {f.name || 'Fellow'}
                      <span className="block text-[11px] font-normal text-blue-200">{f.pgy}</span>
                    </th>
                  ))}
                  <th className="px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {config.blocks.map((b, i) => (
                  <tr key={b.id} className={i % 2 ? 'bg-slate-50/60' : 'bg-white'}>
                    <td
                      className="px-3 py-2 align-top sticky left-0 z-10"
                      style={{ background: i % 2 ? '#f8fafc' : 'white', minWidth: 140 }}
                    >
                      <input
                        value={b.label}
                        onChange={(e) => updateBlock(b.id, { label: e.target.value })}
                        className="font-semibold text-slate-900 w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none"
                      />
                      <div className="flex gap-1 mt-1">
                        <input
                          type="date"
                          value={b.start}
                          onChange={(e) => updateBlock(b.id, { start: e.target.value })}
                          className="text-[11px] border border-slate-200 rounded px-1 py-0.5 text-slate-600 w-[112px]"
                        />
                        <input
                          type="date"
                          value={b.end}
                          onChange={(e) => updateBlock(b.id, { end: e.target.value })}
                          className="text-[11px] border border-slate-200 rounded px-1 py-0.5 text-slate-600 w-[112px]"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        value={b.attending}
                        onChange={(e) => updateBlock(b.id, { attending: e.target.value })}
                        placeholder="—"
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                      />
                    </td>
                    {config.fellows.map((f) => (
                      <td key={f.id} className="px-3 py-2 align-top">
                        <input
                          list="rotation-suggestions"
                          value={b.assignments[f.id] || ''}
                          onChange={(e) => setAssignment(b.id, f.id, e.target.value)}
                          placeholder="—"
                          className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                          style={b.assignments[f.id] ? { borderLeft: `3px solid ${NAVY}` } : undefined}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 align-top text-center">
                      <button
                        onClick={() => removeBlock(b.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Remove block"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ============ 5. MONTHLY CALENDARS ============ */}
      <section>
        <SectionHead
          n="5"
          title="Monthly Calendars"
          hint="The dated didactic sessions and coverage footer for a given month. Add a month, drop in sessions by date, and fill the coverage block."
        />

        <div className="flex gap-2 flex-wrap items-center mb-3">
          {config.months.map((mo) => (
            <button
              key={mo.id}
              onClick={() => setSelectedMonthId(mo.id)}
              className="text-sm font-medium px-3 py-1.5 rounded border"
              style={
                mo.id === selectedMonthId
                  ? { background: NAVY, color: 'white', borderColor: NAVY }
                  : { background: 'white', color: '#334155', borderColor: '#cbd5e1' }
              }
            >
              {mo.label || mo.ym || 'Untitled'}
            </button>
          ))}
          <span className="flex items-center gap-1.5">
            <input
              type="month"
              value={newMonthYm}
              onChange={(e) => setNewMonthYm(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1.5"
            />
            <button
              onClick={addMonth}
              className="text-sm font-medium px-3 py-1.5 rounded text-white"
              style={{ background: CRIMSON }}
            >
              + Add month
            </button>
          </span>
        </div>

        {selectedMonth ? (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-5">
            {/* month meta */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={selectedMonth.label}
                onChange={(e) => updateMonth(selectedMonth.id, { label: e.target.value })}
                placeholder="June 2026"
                className="text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
              />
              <span className="text-xs text-slate-400">({selectedMonth.ym})</span>
              <div className="flex-1" />
              <button
                onClick={() => removeMonth(selectedMonth.id)}
                className="text-xs font-medium text-slate-400 hover:text-red-600"
              >
                Remove month
              </button>
            </div>
            <input
              value={selectedMonth.subtitle || ''}
              onChange={(e) => updateMonth(selectedMonth.id, { subtitle: e.target.value })}
              placeholder="Subtitle (optional) — e.g. Images, Genetics and Transplant Medicine"
              className="w-full text-sm text-slate-600 border border-slate-200 rounded px-2 py-1.5"
            />

            {/* sessions */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Dated sessions</h4>
              <div className="space-y-2">
                {selectedMonth.sessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 flex-wrap">
                    <input
                      type="date"
                      value={s.date}
                      min={`${selectedMonth.ym}-01`}
                      max={`${selectedMonth.ym}-31`}
                      onChange={(e) => updateSession(selectedMonth.id, s.id, { date: e.target.value })}
                      className="text-sm border border-slate-300 rounded px-2 py-1.5 w-[150px]"
                    />
                    <input
                      value={s.title}
                      onChange={(e) => updateSession(selectedMonth.id, s.id, { title: e.target.value })}
                      placeholder="Session title (e.g. Grand Rounds)"
                      className="flex-1 min-w-[180px] text-sm border border-slate-300 rounded px-2 py-1.5"
                    />
                    <input
                      value={s.badge || ''}
                      onChange={(e) => updateSession(selectedMonth.id, s.id, { badge: e.target.value })}
                      placeholder="🎓"
                      className="w-16 text-sm border border-slate-300 rounded px-2 py-1.5 text-center"
                    />
                    <button
                      onClick={() => removeSession(selectedMonth.id, s.id)}
                      className="text-slate-400 hover:text-red-600 px-1"
                      title="Remove session"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {selectedMonth.sessions.length === 0 && (
                  <p className="text-sm text-slate-400">No sessions yet.</p>
                )}
              </div>
              <button
                onClick={() => addSession(selectedMonth.id)}
                className="mt-2 text-sm font-medium"
                style={{ color: NAVY }}
              >
                + Add session
              </button>
            </div>

            {/* coverage */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Coverage footer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1">Consult service attending</span>
                  <input
                    value={selectedMonth.coverage.consultAttending}
                    onChange={(e) => updateCoverage(selectedMonth.id, { consultAttending: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1">Consult fellows</span>
                  <input
                    value={selectedMonth.coverage.consultFellows}
                    onChange={(e) => updateCoverage(selectedMonth.id, { consultFellows: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="block text-xs font-medium text-slate-500 mb-1">Procedure fellow</span>
                  <input
                    value={selectedMonth.coverage.procedureFellow}
                    onChange={(e) => updateCoverage(selectedMonth.id, { procedureFellow: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                  />
                </label>
              </div>

              <div className="mt-3">
                <span className="block text-xs font-medium text-slate-500 mb-1">Weekend coverage</span>
                <div className="space-y-2">
                  {selectedMonth.coverage.weekend.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 flex-wrap">
                      <input
                        value={w.who}
                        onChange={(e) => updateWeekend(selectedMonth.id, w.id, { who: e.target.value })}
                        placeholder="Dr. Name"
                        className="w-[160px] text-sm border border-slate-300 rounded px-2 py-1.5"
                      />
                      <input
                        value={w.dates}
                        onChange={(e) => updateWeekend(selectedMonth.id, w.id, { dates: e.target.value })}
                        placeholder="June 13-14, 27-28"
                        className="flex-1 min-w-[160px] text-sm border border-slate-300 rounded px-2 py-1.5"
                      />
                      <button
                        onClick={() => removeWeekend(selectedMonth.id, w.id)}
                        className="text-slate-400 hover:text-red-600 px-1"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {selectedMonth.coverage.weekend.length === 0 && (
                    <p className="text-sm text-slate-400">No weekend coverage rows.</p>
                  )}
                </div>
                <button
                  onClick={() => addWeekend(selectedMonth.id)}
                  className="mt-2 text-sm font-medium"
                  style={{ color: NAVY }}
                >
                  + Add weekend row
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-sm text-slate-500">
            No month selected. Pick a month above (type a month and “Add month”).
          </div>
        )}
      </section>

      {/* ============ FOOTER ============ */}
      <section className="border-t border-slate-200 pt-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-400">
            maps to <code className="bg-slate-100 px-1 rounded">program_schedule</code> ({academicYear})
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          Save writes this exact payload via a staff-only server action; row-level security blocks
          non-staff writes at the database. Educational schedule only — not duty hours, not time-off.
        </p>
      </section>
    </div>
  )
}

function SectionHead({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0"
          style={{ background: NAVY }}
        >
          {n}
        </span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {hint && (
        <p className="text-sm text-slate-500 mt-1 leading-relaxed" style={{ marginLeft: '2.125rem' }}>
          {hint}
        </p>
      )}
    </div>
  )
}
