'use client'

// app/schedule/RotationSchedule.tsx
// Presentational rotation reference: current-block banner, a fellows × blocks
// grid (horizontally scrollable, current block highlighted, auto-scrolled into
// view), a weekly continuity-clinic strip, and per-block coverage. Pure render
// over lib/schedule-config.ts + props from the server (current block, today).
// DESIGN.md: Howard navy + crimson, color always paired with a text label,
// 320px → desktop.
import { useEffect, useRef } from 'react'
import {
  ACADEMIC_YEAR,
  ASSIGNMENTS,
  BLOCKS,
  COVERAGE,
  FELLOWS,
  ROTATIONS,
  type Weekday,
  fellowById,
} from '@/lib/schedule-config'

const NAVY = '#003a63'
const WEEKDAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function fmtRange(startIso: string, endIso: string): string {
  const s = new Date(startIso + 'T00:00:00')
  const e = new Date(endIso + 'T00:00:00')
  const m = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${m(s)} – ${m(e)}`
}

function RotationChip({ rotationKey }: { rotationKey: keyof typeof ROTATIONS }) {
  const r = ROTATIONS[rotationKey]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${r.chip}`}>
      {rotationKey === 'consults' ? <span aria-hidden="true">★</span> : null}
      {r.short}
    </span>
  )
}

export default function RotationSchedule({
  currentBlockId,
  today,
}: {
  currentBlockId: string | null
  today: string
}) {
  const currentColRef = useRef<HTMLTableCellElement>(null)

  // Bring the current block column into view on mount (nice on the 13-wide grid).
  useEffect(() => {
    currentColRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  const currentBlock = BLOCKS.find((b) => b.id === currentBlockId) ?? null
  const todayLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Academic year + today */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Academic Year {ACADEMIC_YEAR}</h2>
        <p className="text-sm text-gray-500">Today: {todayLabel}</p>
      </div>

      {/* Current-block banner */}
      <section aria-label="Current block" className="rounded-xl border border-[#003a63]/20 bg-white shadow-sm overflow-hidden">
        <div className="bg-[#003a63] px-4 py-2.5 text-white">
          <h3 className="text-sm font-semibold">
            {currentBlock ? `Current — ${currentBlock.label}` : 'Current block'}
            {currentBlock ? <span className="font-normal text-white/70"> · {fmtRange(currentBlock.start, currentBlock.end)}</span> : null}
          </h3>
        </div>
        {currentBlock ? (
          <div className="divide-y divide-gray-100">
            {FELLOWS.map((f) => {
              const rk = ASSIGNMENTS[f.id]?.[currentBlock.id]
              const cov = COVERAGE[currentBlock.id]
              const onConsults = cov?.primary === f.id
              const isBackup = cov?.backup === f.id
              return (
                <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 leading-tight truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.pgy} · Continuity clinic {f.continuityDay}s</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onConsults ? (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">On consults</span>
                    ) : isBackup ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200">Backup</span>
                    ) : null}
                    {rk ? <RotationChip rotationKey={rk} /> : <span className="text-xs text-gray-400">—</span>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-4 py-4 text-sm text-gray-600">
            Today is outside the {ACADEMIC_YEAR} block calendar. Use the full-year grid below.
          </div>
        )}
      </section>

      {/* Weekly continuity-clinic strip */}
      <section aria-label="Weekly continuity clinic" className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Continuity clinic — weekly</h3>
        <p className="text-xs text-gray-500">A standing half-day each week, independent of the block rotation.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {WEEKDAYS.map((day) => {
            const here = FELLOWS.filter((f) => f.continuityDay === day)
            return (
              <div key={day} className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">{day}</p>
                {here.length === 0 ? (
                  <p className="text-xs text-gray-400">—</p>
                ) : (
                  <ul className="space-y-1">
                    {here.map((f) => (
                      <li key={f.id} className="text-sm text-gray-800 leading-tight">
                        {f.name.replace(/, MD$/, '')}
                        <span className="block text-[11px] text-gray-400">{f.pgy}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Full-year rotation grid */}
      <section aria-label="Rotation grid" className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Block rotations — full year</h3>
          <span className="text-xs text-gray-400">Scroll sideways →</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">
                  Fellow
                </th>
                {BLOCKS.map((b) => {
                  const isCurrent = b.id === currentBlockId
                  return (
                    <th
                      key={b.id}
                      ref={isCurrent ? currentColRef : undefined}
                      className={`px-3 py-2 text-center text-xs font-semibold border-b border-gray-200 whitespace-nowrap ${
                        isCurrent ? 'text-white' : 'text-gray-600 bg-gray-50'
                      }`}
                      style={isCurrent ? { backgroundColor: NAVY } : undefined}
                      aria-current={isCurrent ? 'date' : undefined}
                    >
                      <span className="block">{b.label.replace('Block ', 'B')}</span>
                      <span className={`block font-normal ${isCurrent ? 'text-white/70' : 'text-gray-400'}`}>
                        {fmtRange(b.start, b.end)}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {FELLOWS.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 last:border-0">
                  <th scope="row" className="sticky left-0 z-10 bg-white px-3 py-2 text-left align-top border-r border-gray-100">
                    <span className="block font-medium text-gray-900 leading-tight whitespace-nowrap">{f.name.replace(/, MD$/, '')}</span>
                    <span className="block text-[11px] text-gray-400">{f.pgy}</span>
                  </th>
                  {BLOCKS.map((b) => {
                    const rk = ASSIGNMENTS[f.id]?.[b.id]
                    const isCurrent = b.id === currentBlockId
                    return (
                      <td key={b.id} className={`px-2 py-2 text-center align-middle ${isCurrent ? 'bg-[#003a63]/5' : ''}`}>
                        {rk ? <RotationChip rotationKey={rk} /> : <span className="text-gray-300">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coverage per block */}
      <section aria-label="Consult coverage" className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Consult coverage by block</h3>
        <p className="text-xs text-gray-500">★ Primary = on the consult service · Backup = designated cross-cover.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {BLOCKS.map((b) => {
            const cov = COVERAGE[b.id]
            const primary = cov ? fellowById(cov.primary) : undefined
            const backup = cov ? fellowById(cov.backup) : undefined
            const isCurrent = b.id === currentBlockId
            return (
              <div
                key={b.id}
                className={`rounded-lg border p-2.5 ${isCurrent ? 'border-[#003a63] bg-[#003a63]/5' : 'border-gray-200 bg-white'}`}
              >
                <p className="text-[11px] font-semibold text-gray-500">
                  {b.label} · {fmtRange(b.start, b.end)}
                </p>
                <p className="mt-1 text-sm text-gray-900 leading-tight">
                  <span aria-hidden="true">★</span> {primary ? primary.name.replace(/, MD$/, '') : '—'}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  Backup: {backup ? backup.name.replace(/, MD$/, '') : '—'}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Legend */}
      <section aria-label="Legend" className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Rotations</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROTATIONS) as (keyof typeof ROTATIONS)[]).map((k) => (
            <span key={k} className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${ROTATIONS[k].chip}`}>
              {k === 'consults' ? <span aria-hidden="true">★</span> : null}
              {ROTATIONS[k].label}
              <span className="text-[10px] opacity-60">· {ROTATIONS[k].kind === 'clinical' ? 'clinical' : 'educational'}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}