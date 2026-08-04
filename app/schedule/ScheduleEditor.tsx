'use client'

// Staff-only editor for the program schedule. Body-only — the route owns the
// page header and auth gate. Save calls the staff-only `saveSchedule` action,
// which updates the program_schedule row for the selected academic_year (the
// schema is multi-year — one row per academic year); RLS blocks non-staff
// writes at the database. De-identified PROGRAM data only — NO PHI.
import { useState, useTransition, type CSSProperties } from 'react'
import { saveSchedule } from './actions'
import { NAVY, CRIMSON } from '@/lib/tokens'
import type {
  ScheduleConfig,
  SchedulePayload,
  WeeklyRow,
  WeeklyKind,
  ScheduleFellow,
  ScheduleBlock,
  ScheduleMonth,
  MonthSession,
  WeekendCoverage,
} from '@/lib/schedule'
import { WEEKLY_KINDS, WEEKDAYS, newId, monthLabelFromYm } from '@/lib/schedule'

const inputCls =
  'border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'

// Normalize a weekly row that may predate the `kind` field.
function normalizeRow(r: WeeklyRow): WeeklyRow {
  return { kind: 'Activity', ...r }
}

export default function ScheduleEditor({ initial }: { initial: SchedulePayload }) {
  const academicYear = initial.academic_year
  const [config, setConfig] = useState<ScheduleConfig>(() => ({
    ...initial.config,
    weekly: initial.config.weekly.map(normalizeRow),
  }))
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(
    initial.config.months[0]?.id ?? null
  )
  const [newMonthYm, setNewMonthYm] = useState('')
  const [monthError, setMonthError] = useState<string | null>(null)
  const [newRotation, setNewRotation] = useState('')
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pending, startTransition] = useTransition()

  function mutate(fn: (c: ScheduleConfig) => ScheduleConfig) {
    setStatus('idle')
    setConfig((c) => fn(c))
  }

  // ---------- weekly ----------
  function addRow(kind: WeeklyKind = 'Activity') {
    mutate((c) => ({
      ...c,
      weekly: [...c.weekly, { id: newId(), kind, activity: '', days: [], start: '', end: '' }],
    }))
  }
  function updateRow(id: string, patch: Partial<WeeklyRow>) {
    mutate((c) => ({
      ...c,
      weekly: c.weekly.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  }
  function removeRow(id: string) {
    mutate((c) => ({ ...c, weekly: c.weekly.filter((r) => r.id !== id) }))
  }
  function toggleDay(id: string, day: string) {
    mutate((c) => ({
      ...c,
      weekly: c.weekly.map((r) =>
        r.id === id
          ? { ...r, days: r.days.includes(day) ? r.days.filter((d) => d !== day) : [...r.days, day] }
          : r
      ),
    }))
  }

  // ---------- fellows ----------
  function addFellow() {
    mutate((c) => ({ ...c, fellows: [...c.fellows, { id: newId(), name: '', pgy: '' }] }))
  }
  function updateFellow(id: string, patch: Partial<ScheduleFellow>) {
    mutate((c) => ({
      ...c,
      fellows: c.fellows.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }))
  }
  function removeFellow(id: string) {
    mutate((c) => ({
      ...c,
      fellows: c.fellows.filter((f) => f.id !== id),
      blocks: c.blocks.map((b) => {
        const a = { ...b.assignments }
        delete a[id]
        return { ...b, assignments: a }
      }),
    }))
  }

  // ---------- rotation suggestions ----------
  function addRotation() {
    const v = newRotation.trim()
    if (!v) return
    mutate((c) =>
      c.rotations.includes(v) ? c : { ...c, rotations: [...c.rotations, v] }
    )
    setNewRotation('')
  }
  function removeRotation(name: string) {
    mutate((c) => ({ ...c, rotations: c.rotations.filter((r) => r !== name) }))
  }

  // ---------- blocks ----------
  function addBlock() {
    mutate((c) => ({
      ...c,
      blocks: [
        ...c.blocks,
        {
          id: newId(),
          label: `Block ${c.blocks.length + 1}`,
          start: '',
          end: '',
          attending: '',
          assignments: {},
        },
      ],
    }))
  }
  function updateBlock(id: string, patch: Partial<ScheduleBlock>) {
    mutate((c) => ({
      ...c,
      blocks: c.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
  }
  function removeBlock(id: string) {
    mutate((c) => ({ ...c, blocks: c.blocks.filter((b) => b.id !== id) }))
  }
  function setAssignment(blockId: string, fellowId: string, value: string) {
    mutate((c) => ({
      ...c,
      blocks: c.blocks.map((b) =>
        b.id === blockId
          ? { ...b, assignments: { ...b.assignments, [fellowId]: value } }
          : b
      ),
    }))
  }

  // ---------- months ----------
  const selectedMonth = config.months.find((m) => m.id === selectedMonthId) ?? null

  function addMonth() {
    const ym = newMonthYm.trim()
    if (!/^\d{4}-\d{2}$/.test(ym)) {
      setMonthError('Pick a month (format YYYY-MM).')
      return
    }
    if (config.months.some((m) => m.ym === ym)) {
      setMonthError('That month already exists.')
      return
    }
    const id = newId()
    mutate((c) => ({
      ...c,
      months: [
        ...c.months,
        {
          id,
          ym,
          label: monthLabelFromYm(ym),
          sessions: [],
          coverage: { consultAttending: '', consultFellows: '', procedureFellow: '', weekend: [] },
        },
      ].sort((a, b) => a.ym.localeCompare(b.ym)),
    }))
    setSelectedMonthId(id)
    setNewMonthYm('')
    setMonthError(null)
  }

  function updateMonth(id: string, patch: Partial<ScheduleMonth>) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }

  function removeMonth(id: string) {
    mutate((c) => ({ ...c, months: c.months.filter((m) => m.id !== id) }))
    if (selectedMonthId === id) setSelectedMonthId(null)
  }

  function addSession(monthId: string) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId
          ? { ...m, sessions: [...m.sessions, { id: newId(), date: '', title: '', badge: '' }] }
          : m
      ),
    }))
  }

  function updateSession(monthId: string, sessionId: string, patch: Partial<MonthSession>) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId
          ? {
              ...m,
              sessions: m.sessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s)),
            }
          : m
      ),
    }))
  }

  function removeSession(monthId: string, sessionId: string) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId
          ? { ...m, sessions: m.sessions.filter((s) => s.id !== sessionId) }
          : m
      ),
    }))
  }

  function updateCoverage(
    monthId: string,
    patch: Partial<ScheduleMonth['coverage']>
  ) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId ? { ...m, coverage: { ...m.coverage, ...patch } } : m
      ),
    }))
  }

  function addWeekend(monthId: string) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId
          ? {
              ...m,
              coverage: {
                ...m.coverage,
                weekend: [...m.coverage.weekend, { id: newId(), who: '', dates: '' }],
              },
            }
          : m
      ),
    }))
  }

  function updateWeekend(
    monthId: string,
    rowId: string,
    patch: Partial<WeekendCoverage>
  ) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId
          ? {
              ...m,
              coverage: {
                ...m.coverage,
                weekend: m.coverage.weekend.map((w) => (w.id === rowId ? { ...w, ...patch } : w)),
              },
            }
          : m
      ),
    }))
  }

  function removeWeekend(monthId: string, rowId: string) {
    mutate((c) => ({
      ...c,
      months: c.months.map((m) =>
        m.id === monthId
          ? {
              ...m,
              coverage: {
                ...m.coverage,
                weekend: m.coverage.weekend.filter((w) => w.id !== rowId),
              },
            }
          : m
      ),
    }))
  }

  // ---------- save ----------
  function save() {
    startTransition(async () => {
      const res = await saveSchedule({ academic_year: academicYear, config })
      if (res.ok) {
        setStatus('saved')
        setErrorMsg('')
      } else {
        setStatus('error')
        setErrorMsg(res.error ?? 'Save failed')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* save bar */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-gray-50/95 backdrop-blur border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white min-h-[44px] disabled:opacity-60"
          style={{ background: NAVY }}
        >
          {pending ? 'Saving…' : 'Save schedule'}
        </button>
        <span aria-live="polite" className="text-sm">
          {status === 'saved' && <span className="text-green-700 font-medium">Saved ✓</span>}
          {status === 'error' && <span className="text-red-600 font-medium">{errorMsg}</span>}
        </span>
        <span className="ml-auto text-xs text-slate-400">
          Academic year {academicYear}
        </span>
      </div>

      {/* ============ 1. WEEKLY ANCHORS ============ */}
      <section>
        <SectionHead
          n="1"
          title="Weekly Schedule"
          hint="Recurring weekly rhythm — continuity clinics, didactics, standing meetings."
        />
        <div className="space-y-3">
          {config.weekly.map((row) => (
            <div key={row.id} className="bg-white border border-slate-200 rounded-lg p-3.5">
              <div className="flex flex-wrap gap-2 items-center">
                <label className="flex-1 min-w-[180px] flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 shrink-0">Activity</span>
                  <input
                    value={row.activity}
                    onChange={(e) => updateRow(row.id, { activity: e.target.value })}
                    placeholder="Activity name"
                    className="flex-1 min-w-0 font-semibold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
                  />
                </label>
                <select
                  value={row.kind}
                  onChange={(e) => updateRow(row.id, { kind: e.target.value as WeeklyKind })}
                  aria-label="Activity kind"
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
                  aria-label={`Remove ${row.activity || 'activity'}`}
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
                      aria-pressed={on}
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
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    Start
                    <input
                      type="time"
                      value={row.start}
                      onChange={(e) => updateRow(row.id, { start: e.target.value })}
                      className="text-sm text-slate-700 border border-slate-300 rounded px-2 py-1"
                    />
                  </label>
                  <span className="text-slate-400 text-sm">–</span>
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    End
                    <input
                      type="time"
                      value={row.end}
                      onChange={(e) => updateRow(row.id, { end: e.target.value })}
                      className="text-sm text-slate-700 border border-slate-300 rounded px-2 py-1"
                    />
                  </label>
                </div>
                <input
                  value={row.note || ''}
                  onChange={(e) => updateRow(row.id, { note: e.target.value })}
                  placeholder="Note (optional)"
                  aria-label="Note (optional)"
                  className="flex-1 min-w-[160px] text-sm text-slate-600 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => addRow()}
            className="text-sm font-medium px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 w-full"
          >
            + Add weekly row
          </button>
        </div>
      </section>

      {/* ============ 2. FELLOWS ============ */}
      <section>
        <SectionHead
          n="2"
          title="Fellows"
          hint="Names shown on the schedule grid. These are display names for the
            rotation grid — accounts are managed separately on the dashboard."
        />
        <div className="space-y-2">
          {config.fellows.map((f) => (
            <div key={f.id} className="flex gap-2 items-center flex-wrap">
              <input
                value={f.name}
                onChange={(e) => updateFellow(f.id, { name: e.target.value })}
                placeholder="Dr. Name"
                aria-label="Fellow name"
                className="flex-1 min-w-[160px] text-sm font-medium border border-slate-300 rounded px-2 py-1.5"
              />
              <input
                value={f.pgy}
                onChange={(e) => updateFellow(f.id, { pgy: e.target.value })}
                placeholder="PGY-4"
                aria-label="PGY level"
                className="w-24 text-sm border border-slate-300 rounded px-2 py-1.5"
              />
              <ConfirmButton
                label="✕"
                title="Remove fellow"
                confirmText={`Remove ${f.name || 'this fellow'}? Their grid assignments clear too.`}
                onConfirm={() => removeFellow(f.id)}
                buttonClassName="text-slate-400 hover:text-red-600 text-sm px-1"
              />
            </div>
          ))}
          <button
            onClick={addFellow}
            className="text-sm font-medium"
            style={{ color: NAVY }}
          >
            + Add fellow
          </button>
        </div>
      </section>

      {/* ============ 3. ROTATION SUGGESTIONS ============ */}
      <section>
        <SectionHead
          n="3"
          title="Rotation Suggestions"
          hint="Autocomplete options for assignment cells below — staff can always type anything."
        />
        <div className="flex flex-wrap gap-2 mb-2">
          {config.rotations.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1.5 text-sm bg-slate-100 text-slate-700 rounded-full pl-3 pr-1.5 py-1"
            >
              {r}
              <button
                onClick={() => removeRotation(r)}
                className="text-slate-400 hover:text-red-600"
                title="Remove"
                aria-label={`Remove ${r}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
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
            aria-label="New rotation suggestion"
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
      </section>

      {/* ============ 4. BLOCK GRID ============ */}
      <section>
        <SectionHead
          n="4"
          title="Rotation Block Grid"
          hint="13 four-week blocks. Attending per block on the first row; one row per fellow."
        />
        <datalist id="rotation-suggestions">
          {config.rotations.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>

        {config.blocks.length === 0 && config.fellows.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg p-4">
            Add fellows (section 2) and blocks below to build the grid.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm border-collapse bg-white">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 text-left text-xs font-bold text-slate-500 uppercase tracking-wide p-2 border border-slate-200 min-w-[140px]">
                    Block
                    <button
                      onClick={addBlock}
                      className="block mt-1 text-[11px] font-semibold normal-case tracking-normal"
                      style={{ color: NAVY }}
                    >
                      + Add block
                    </button>
                  </th>
                  {config.blocks.map((b) => (
                    <th key={b.id} className="align-top p-2 border border-slate-200 min-w-[150px] bg-slate-50">
                      <input
                        value={b.label}
                        onChange={(e) => updateBlock(b.id, { label: e.target.value })}
                        aria-label="Block label"
                        className="font-semibold text-slate-900 w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none"
                      />
                      <div className="flex gap-1 mt-1">
                        <input
                          type="date"
                          value={b.start}
                          onChange={(e) => updateBlock(b.id, { start: e.target.value })}
                          aria-label={`${b.label || 'Block'} start date`}
                          className="text-[11px] border border-slate-200 rounded px-1 py-0.5 text-slate-600 w-[112px]"
                        />
                        <input
                          type="date"
                          value={b.end}
                          onChange={(e) => updateBlock(b.id, { end: e.target.value })}
                          aria-label={`${b.label || 'Block'} end date`}
                          className="text-[11px] border border-slate-200 rounded px-1 py-0.5 text-slate-600 w-[112px]"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sticky left-0 bg-white z-10 p-2 border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Attending
                  </td>
                  {config.blocks.map((b) => (
                    <td key={b.id} className="p-1.5 border border-slate-200">
                      <input
                        value={b.attending}
                        onChange={(e) => updateBlock(b.id, { attending: e.target.value })}
                        placeholder="—"
                        aria-label={`Attending for ${b.label || 'block'}`}
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                      />
                    </td>
                  ))}
                </tr>
                {config.fellows.map((f) => (
                  <tr key={f.id}>
                    <td className="sticky left-0 bg-white z-10 p-2 border border-slate-200 font-medium text-slate-800">
                      {f.name || '—'}
                      <span className="block text-[11px] font-normal text-slate-400">{f.pgy}</span>
                    </td>
                    {config.blocks.map((b) => (
                      <td key={b.id} className="p-1.5 border border-slate-200">
                        <input
                          list="rotation-suggestions"
                          value={b.assignments[f.id] || ''}
                          onChange={(e) => setAssignment(b.id, f.id, e.target.value)}
                          placeholder="—"
                          aria-label={`${f.name || 'Fellow'} assignment for ${b.label || 'block'}`}
                          className="w-full text-sm border border-slate-300 rounded px-2 py-1.5"
                          style={b.assignments[f.id] ? { borderLeft: `3px solid ${NAVY}` } : undefined}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* remove-block row */}
                <tr>
                  <td className="sticky left-0 bg-white z-10 p-2 border border-slate-200" />
                  {config.blocks.map((b) => (
                    <td key={b.id} className="p-1.5 border border-slate-200 text-center">
                      <button
                        onClick={() => removeBlock(b.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Remove block"
                        aria-label={`Remove block${b.label ? ` ${b.label}` : ''}`}
                      >
                        ✕
                      </button>
                    </td>
                  ))}
                </tr>
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
              aria-pressed={mo.id === selectedMonthId}
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
              placeholder="2026-07"
              aria-label="New month"
              onChange={(e) => {
                setNewMonthYm(e.target.value)
                setMonthError(null)
              }}
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

        {monthError && <p className="-mt-1 mb-3 text-sm text-red-600">{monthError}</p>}

        {selectedMonth ? (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-5">
            {/* month meta */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={selectedMonth.label}
                onChange={(e) => updateMonth(selectedMonth.id, { label: e.target.value })}
                placeholder="June 2026"
                aria-label="Month label"
                className="text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
              />
              <span className="text-xs text-slate-400">({selectedMonth.ym})</span>
              <div className="flex-1" />
              <ConfirmButton
                label="Remove month"
                confirmText={`Remove ${selectedMonth.label || selectedMonth.ym}? Its sessions and coverage will be deleted.`}
                onConfirm={() => removeMonth(selectedMonth.id)}
                buttonClassName="text-xs font-medium text-slate-400 hover:text-red-600"
              />
            </div>
            <input
              value={selectedMonth.subtitle || ''}
              onChange={(e) => updateMonth(selectedMonth.id, { subtitle: e.target.value })}
              placeholder="Subtitle (optional) — e.g. Images, Genetics and Transplant Medicine"
              aria-label="Month subtitle (optional)"
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
                      aria-label="Session date"
                      className="text-sm border border-slate-300 rounded px-2 py-1.5 w-[150px]"
                    />
                    <input
                      value={s.title}
                      onChange={(e) => updateSession(selectedMonth.id, s.id, { title: e.target.value })}
                      placeholder="Session title (e.g. Grand Rounds)"
                      aria-label="Session title"
                      className="flex-1 min-w-[180px] text-sm border border-slate-300 rounded px-2 py-1.5"
                    />
                    <input
                      value={s.badge || ''}
                      onChange={(e) => updateSession(selectedMonth.id, s.id, { badge: e.target.value })}
                      placeholder="🎓"
                      aria-label="Session badge (optional)"
                      className="w-16 text-sm border border-slate-300 rounded px-2 py-1.5 text-center"
                    />
                    <button
                      onClick={() => removeSession(selectedMonth.id, s.id)}
                      className="text-slate-400 hover:text-red-600 px-1"
                      title="Remove session"
                      aria-label={`Remove session${s.title ? ` ${s.title}` : ''}`}
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
                        aria-label="Weekend coverage — who"
                        className="w-[160px] text-sm border border-slate-300 rounded px-2 py-1.5"
                      />
                      <input
                        value={w.dates}
                        onChange={(e) => updateWeekend(selectedMonth.id, w.id, { dates: e.target.value })}
                        placeholder="June 13-14, 27-28"
                        aria-label="Weekend coverage — dates"
                        className="flex-1 min-w-[160px] text-sm border border-slate-300 rounded px-2 py-1.5"
                      />
                      <button
                        onClick={() => removeWeekend(selectedMonth.id, w.id)}
                        className="text-slate-400 hover:text-red-600 px-1"
                        title="Remove"
                        aria-label={`Remove weekend row${w.who ? ` for ${w.who}` : ''}`}
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

// Inline two-step confirm for destructive actions (same pattern as
// PublishControls): first tap arms the control and shows what will be lost;
// the action only fires from the explicit Confirm button. Auto-cancels after
// 5s so a stray arm can't be confirmed accidentally later.
function ConfirmButton({
  label,
  confirmText,
  onConfirm,
  buttonClassName,
  buttonStyle,
  title,
}: {
  label: string
  confirmText: string
  onConfirm: () => void
  buttonClassName?: string
  buttonStyle?: CSSProperties
  title?: string
}) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 5000)
    return () => clearTimeout(t)
  }, [armed])

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={buttonClassName}
        style={buttonStyle}
        title={title}
      >
        {label}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 flex-wrap rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5">
      <span className="text-xs font-medium text-red-700">{confirmText}</span>
      <button
        type="button"
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
        className="inline-flex items-center justify-center px-3 text-xs font-semibold rounded text-white min-h-[44px]"
        style={{ background: CRIMSON }}
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="inline-flex items-center justify-center px-3 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-50 min-h-[44px]"
      >
        Cancel
      </button>
    </span>
  )
}
