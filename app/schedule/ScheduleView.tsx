// app/schedule/ScheduleView.tsx
// Read-only program schedule for fellows & attendings (anyone who isn't staff).
// Pure display from the program_schedule config — no inputs, no hooks (renders
// as a server component). The route owns the page header and auth gate, and
// computes today's date (America/New_York), passed in as `today`. NO PHI.
import type { ReactNode } from 'react'
import {
  KIND_COLOR,
  WEEKDAYS,
  monthGridWeeks,
  pickMonth,
  type ScheduleConfig,
  type ScheduleMonth,
  type ScheduleWeekly,
  type WeeklyKind,
} from '@/lib/schedule'

const NAVY = '#003a63'
const CRIMSON = '#c8102e'

function fmtUpdated(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

// Recurring clinic / didactic summary for a weekday, derived from the skeleton.
function daySummary(weekly: ScheduleWeekly[], day: string): { clinic: boolean; didactic: string | null } {
  let clinic = false
  let didactic: string | null = null
  for (const r of weekly) {
    if (!r.days.includes(day)) continue
    if (r.kind === 'clinic') clinic = true
    if (r.kind === 'didactic') didactic = `${r.start}–${r.end}`
  }
  return { clinic, didactic }
}

export default function ScheduleView({
  config,
  academicYear,
  today,
  currentBlockId,
  updatedAt,
}: {
  config: ScheduleConfig
  academicYear: string
  today: string
  currentBlockId: string | null
  updatedAt: string | null
}) {
  const updated = fmtUpdated(updatedAt)
  const currentBlock = config.blocks.find((b) => b.id === currentBlockId) || null
  const month = pickMonth(config.months, today)

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-slate-900">Academic Year {academicYear}</h2>
        {updated && <span className="text-xs text-slate-400">Updated {updated}</span>}
      </div>

      {/* current block banner */}
      {currentBlock && (
        <div className="rounded-lg border-l-4 px-4 py-3" style={{ borderColor: NAVY, background: '#f0f6fb' }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current block{currentBlock.attending ? ` · Attending: ${currentBlock.attending}` : ''}
          </p>
          <p className="text-base font-bold text-slate-900">{currentBlock.label}</p>
        </div>
      )}

      {/* this month's calendar */}
      {month ? <MonthCalendar month={month} weekly={config.weekly} today={today} /> : null}

      {/* weekly skeleton */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Weekly Skeleton</h3>
        {config.weekly.length === 0 ? (
          <EmptyCard>The weekly skeleton hasn’t been published yet.</EmptyCard>
        ) : (
          <div className="space-y-2.5">
            {config.weekly.map((row) => (
              <div
                key={row.id}
                className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex gap-3 items-start"
              >
                <span
                  className="mt-1 w-1.5 h-8 rounded shrink-0"
                  style={{ background: KIND_COLOR[row.kind as WeeklyKind] || '#475569' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-slate-900">{row.activity || 'Untitled activity'}</span>
                    <span className="text-sm text-slate-500 tabular-nums">
                      {row.start}–{row.end}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {WEEKDAYS.map((d) => {
                      const on = row.days.includes(d)
                      return (
                        <span
                          key={d}
                          className="text-xs font-medium rounded px-2.5 py-1 border"
                          style={
                            on
                              ? { background: NAVY, color: 'white', borderColor: NAVY }
                              : { background: 'white', color: '#94a3b8', borderColor: '#e2e8f0' }
                          }
                        >
                          {d}
                        </span>
                      )
                    })}
                  </div>
                  {row.note && <p className="text-sm text-slate-500 mt-2">{row.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* annual block grid */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Annual Block Grid</h3>
        {config.blocks.length === 0 ? (
          <EmptyCard>The block grid hasn’t been published yet.</EmptyCard>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ background: NAVY }} className="text-white text-left">
                  <th
                    className="px-3 py-2.5 font-semibold sticky left-0 z-10"
                    style={{ background: NAVY, minWidth: 120 }}
                  >
                    Block
                  </th>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ minWidth: 140 }}>
                    Attending
                  </th>
                  {config.fellows.map((f) => (
                    <th
                      key={f.id}
                      className="px-3 py-2.5 font-semibold whitespace-nowrap"
                      style={{ minWidth: 140 }}
                    >
                      {f.name}
                      <span className="block text-[11px] font-normal text-blue-200">{f.pgy}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.blocks.map((b, i) => {
                  const isCurrent = b.id === currentBlockId
                  const base = i % 2 ? '#f8fafc' : 'white'
                  const bg = isCurrent ? '#fff7ed' : base
                  return (
                    <tr key={b.id} style={{ background: bg }}>
                      <td
                        className="px-3 py-2 align-top sticky left-0 z-10 font-semibold text-slate-900"
                        style={{ background: bg, minWidth: 120 }}
                      >
                        <span className="flex items-center gap-1.5">
                          {isCurrent && (
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ background: CRIMSON }}
                            />
                          )}
                          {b.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        {b.attending || <span className="text-slate-300">—</span>}
                      </td>
                      {config.fellows.map((f) => {
                        const rot = b.assignments?.[f.id] || ''
                        return (
                          <td key={f.id} className="px-3 py-2 align-top text-slate-700">
                            {rot || <span className="text-slate-300">—</span>}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-400 leading-relaxed">
        Educational schedule only — continuity clinic, didactics, training, and rotation blocks.
        Not a duty-hours tracker and not time-off; those stay in the institutional system of record.
      </p>
    </div>
  )
}

function MonthCalendar({
  month,
  weekly,
  today,
}: {
  month: ScheduleMonth
  weekly: ScheduleWeekly[]
  today: string
}) {
  const weeks = monthGridWeeks(month.ym)
  const byDate = new Map<string, ScheduleMonth['sessions']>()
  for (const s of month.sessions) {
    if (!s.date) continue
    const arr = byDate.get(s.date) ?? []
    arr.push(s)
    byDate.set(s.date, arr)
  }
  const cov = month.coverage
  const hasCoverage =
    cov.consultAttending || cov.consultFellows || cov.procedureFellow || cov.weekend.length > 0

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-900">{month.label || month.ym}</h3>
        {month.subtitle && <p className="text-sm text-slate-500">{month.subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => {
                const sum = daySummary(weekly, d)
                return (
                  <th
                    key={d}
                    className="border border-slate-200 px-2 py-2 text-left align-top"
                    style={{ background: NAVY, color: 'white', width: '20%' }}
                  >
                    <div className="font-semibold">{d}</div>
                    <div className="text-[11px] font-normal text-blue-100 mt-0.5 leading-tight">
                      {sum.clinic ? 'Clinic' : ''}
                      {sum.clinic && sum.didactic ? ' · ' : ''}
                      {sum.didactic || ''}
                      {!sum.clinic && !sum.didactic ? '\u00A0' : ''}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((cell, ci) => {
                  if (!cell.ymd) {
                    return <td key={ci} className="border border-slate-200 bg-slate-50/50" style={{ height: 84 }} />
                  }
                  const isToday = cell.ymd === today
                  const sessions = byDate.get(cell.ymd) ?? []
                  return (
                    <td
                      key={ci}
                      className="border border-slate-200 px-1.5 py-1.5 align-top"
                      style={{ height: 84, background: isToday ? '#fff7ed' : 'white' }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: isToday ? CRIMSON : '#334155' }}
                        >
                          {cell.day}
                        </span>
                        {isToday && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wide px-1 rounded text-white"
                            style={{ background: CRIMSON }}
                          >
                            Today
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {sessions.map((s) => (
                          <div
                            key={s.id}
                            className="text-[11px] font-medium leading-snug rounded px-1 py-0.5"
                            style={{ background: '#eef2f7', color: '#1e293b' }}
                          >
                            {s.badge ? `${s.badge} ` : ''}
                            {s.title}
                          </div>
                        ))}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasCoverage && (
        <div className="mt-3 bg-white border border-slate-200 rounded-lg p-4 text-sm">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Coverage</h4>
          <dl className="space-y-1.5">
            {cov.consultAttending && (
              <CoverageRow label="Consult service attending">{cov.consultAttending}</CoverageRow>
            )}
            {cov.consultFellows && <CoverageRow label="Consult fellows">{cov.consultFellows}</CoverageRow>}
            {cov.procedureFellow && <CoverageRow label="Procedure fellow">{cov.procedureFellow}</CoverageRow>}
            {cov.weekend.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <dt className="font-semibold text-slate-700 sm:w-52 shrink-0">Weekend coverage</dt>
                <dd className="text-slate-700">
                  <ul className="space-y-0.5">
                    {cov.weekend.map((w) => (
                      <li key={w.id}>
                        <span className="font-medium">{w.who}</span>
                        {w.who && w.dates ? ': ' : ''}
                        {w.dates}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </section>
  )
}

function CoverageRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="font-semibold text-slate-700 sm:w-52 shrink-0">{label}</dt>
      <dd className="text-slate-700">{children}</dd>
    </div>
  )
}

function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  )
}