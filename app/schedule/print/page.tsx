// app/schedule/print/page.tsx
// Board-ready, print-optimized rendering of the program schedule. Any signed-in
// user can open it; the browser's Print / "Save as PDF" turns it into a poster.
// Reproduces the program's two paper sheets:
//   Sheet 1 — annual block grid (months as columns, attending + fellows)
//   Sheet 2 — the current month's didactic calendar + coverage footer
// Pure display from program_schedule. NO PHI. No server-side PDF engine — the
// browser does the PDF, so this works identically on phone and desktop.
import Link from 'next/link'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import PrintButton from './PrintButton'
import {
  asConfig,
  blockForDate,
  monthGridWeeks,
  pickMonth,
  WEEKDAYS,
  type ScheduleConfig,
  type ScheduleWeekly,
} from '@/lib/schedule'

export const dynamic = 'force-dynamic'

const NAVY = '#003a63'
const CRIMSON = '#c8102e'

function todayInDC(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function monthAbbr(ymd: string): string {
  const [y, m] = ymd.split('-').map(Number)
  if (!y || !m) return ''
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
}

function prettyDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function daySummary(weekly: ScheduleWeekly[], day: string): string {
  let clinic = false
  let didactic: string | null = null
  for (const r of weekly) {
    if (!r.days.includes(day)) continue
    if (r.kind === 'clinic') clinic = true
    if (r.kind === 'didactic') didactic = `${r.start}–${r.end}`
  }
  const parts: string[] = []
  if (clinic) parts.push('Clinic')
  if (didactic) parts.push(didactic)
  return parts.join(' · ')
}

const PRINT_CSS = `
.pr { font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
.pr * { box-sizing: border-box; }
.pr-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
.pr-sheet { margin: 0 auto 28px; max-width: 1040px; }
.pr-band { background:${NAVY}; color:#fff; border-radius:8px 8px 0 0; padding:14px 18px; border-bottom:4px solid ${CRIMSON}; }
.pr-band h1 { margin:0; font-size:20px; font-weight:800; letter-spacing:.2px; }
.pr-band p { margin:2px 0 0; font-size:12px; color:#cbd9e6; }
.pr-body { border:1px solid #cbd5e1; border-top:none; border-radius:0 0 8px 8px; padding:16px; }

table.pr-grid { width:100%; border-collapse:collapse; font-size:11px; table-layout:fixed; }
table.pr-grid th, table.pr-grid td { border:1px solid #94a3b8; padding:5px 4px; text-align:center; vertical-align:middle; word-wrap:break-word; }
table.pr-grid thead th { background:${NAVY}; color:#fff; font-weight:700; }
table.pr-grid .pr-rowhead { background:#eef2f7; font-weight:700; text-align:left; width:104px; }
table.pr-grid tbody tr:nth-child(odd) td { background:#f8fafc; }
table.pr-grid .pr-attend td, table.pr-grid .pr-attend .pr-rowhead { font-weight:700; }
.pr-cur { outline:2px solid ${CRIMSON}; outline-offset:-2px; }
.pr-curhead { background:${CRIMSON} !important; color:#fff !important; }

table.pr-cal { width:100%; border-collapse:collapse; table-layout:fixed; }
table.pr-cal th { background:${NAVY}; color:#fff; border:1px solid #94a3b8; padding:6px 4px; text-align:left; font-size:12px; width:20%; }
table.pr-cal th .sub { font-size:9px; font-weight:400; color:#cbd9e6; margin-top:2px; }
table.pr-cal td { border:1px solid #cbd5e1; padding:5px; vertical-align:top; height:78px; font-size:10px; }
table.pr-cal td.empty { background:#f1f5f9; }
table.pr-cal .d { font-weight:700; font-size:11px; color:#334155; }
table.pr-cal .ses { margin-top:3px; background:#eef2f7; border-radius:3px; padding:2px 3px; line-height:1.25; }
.pr-today { background:#fff7ed !important; }
.pr-today .d { color:${CRIMSON}; }

.pr-cov { margin-top:14px; border:1px solid #cbd5e1; border-radius:6px; padding:12px 14px; font-size:12px; }
.pr-cov h3 { margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:.4px; color:#64748b; }
.pr-cov dl { margin:0; display:grid; grid-template-columns: 190px 1fr; row-gap:5px; column-gap:10px; }
.pr-cov dt { font-weight:700; color:#334155; }
.pr-cov dd { margin:0; color:#1e293b; }
.pr-foot { margin-top:12px; font-size:10px; color:#64748b; text-align:center; }
.pr-empty { padding:24px; text-align:center; color:#94a3b8; font-size:13px; }

@media print {
  .no-print { display:none !important; }
  .pr-sheet { page-break-after: always; max-width:none; }
  .pr-sheet:last-of-type { page-break-after: auto; }
  table.pr-grid, table.pr-cal { page-break-inside: auto; }
  tr, td, th { page-break-inside: avoid; }
  .pr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
@page { size: landscape; margin: 12mm; }
`

export default async function SchedulePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>
}) {
  const { ay } = await searchParams
  await requireProfile()

  const supabase = await createClient()
  // Multi-year: print the requested year (?ay=), else the current year, else newest.
  const { data: rows } = await supabase
    .from('program_schedule')
    .select('academic_year, config, is_current')
    .order('academic_year', { ascending: false })
  const all = rows ?? []
  const row =
    all.find((r) => r.academic_year === ay) ??
    all.find((r) => r.is_current) ??
    all[0] ??
    null

  const academicYear = row?.academic_year ?? '—'
  const config: ScheduleConfig = asConfig(row?.config)
  const today = todayInDC()
  const currentBlockId = blockForDate(config.blocks, today)?.id ?? null
  const month = pickMonth(config.months, today)
  const weeks = month ? monthGridWeeks(month.ym) : []

  const sessionsByDate = new Map<string, { id: string; title: string; badge?: string }[]>()
  if (month) {
    for (const s of month.sessions) {
      if (!s.date) continue
      const arr = sessionsByDate.get(s.date) ?? []
      arr.push(s)
      sessionsByDate.set(s.date, arr)
    }
  }
  const cov = month?.coverage
  const hasCoverage =
    !!cov && (cov.consultAttending || cov.consultFellows || cov.procedureFellow || cov.weekend.length > 0)

  return (
    <div className="pr min-h-screen bg-white px-4 py-6">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="pr-toolbar">
        <Link
          href={`/schedule?ay=${encodeURIComponent(academicYear)}`}
          className="no-print text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to schedule
        </Link>
        <PrintButton />
      </div>
      <p className="no-print text-xs text-slate-400 mb-4 max-w-2xl">
        Tip: in the print dialog choose <strong>Landscape</strong> and “Save as PDF.” Enable
        <strong> Background graphics</strong> so the colored headers print. This is an educational
        schedule (de-identified) — fine to post.
      </p>

      {/* ===== Sheet 1: annual block grid ===== */}
      <section className="pr-sheet">
        <div className="pr-band">
          <h1>Academic Schedule {academicYear}</h1>
          <p>Howard University Hospital · Endocrinology, Diabetes &amp; Metabolism Fellowship</p>
        </div>
        <div className="pr-body">
          {config.blocks.length === 0 ? (
            <div className="pr-empty">No block grid has been published yet.</div>
          ) : (
            <table className="pr-grid">
              <thead>
                <tr>
                  <th className="pr-rowhead">Rotation</th>
                  {config.blocks.map((b) => (
                    <th key={b.id} className={b.id === currentBlockId ? 'pr-curhead' : ''}>
                      {monthAbbr(b.start) || b.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="pr-attend">
                  <th className="pr-rowhead">Attending</th>
                  {config.blocks.map((b) => (
                    <td key={b.id} className={b.id === currentBlockId ? 'pr-cur' : ''}>
                      {b.attending || '—'}
                    </td>
                  ))}
                </tr>
                {config.fellows.map((f) => (
                  <tr key={f.id}>
                    <th className="pr-rowhead">{f.name}</th>
                    {config.blocks.map((b) => (
                      <td key={b.id} className={b.id === currentBlockId ? 'pr-cur' : ''}>
                        {b.assignments?.[f.id] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="pr-foot">Generated {prettyDate()} · Educational schedule (de-identified)</div>
        </div>
      </section>

      {/* ===== Sheet 2: current month calendar + coverage ===== */}
      {month && (
        <section className="pr-sheet">
          <div className="pr-band">
            <h1>{month.label || month.ym}</h1>
            <p>
              Howard University Hospital · Department of Endocrinology
              {month.subtitle ? ` · ${month.subtitle}` : ''}
            </p>
          </div>
          <div className="pr-body">
            <table className="pr-cal">
              <thead>
                <tr>
                  {WEEKDAYS.map((d) => (
                    <th key={d}>
                      {d}
                      <div className="sub">{daySummary(config.weekly, d) || '\u00A0'}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((cell, ci) => {
                      if (!cell.ymd) return <td key={ci} className="empty" />
                      const isToday = cell.ymd === today
                      const sessions = sessionsByDate.get(cell.ymd) ?? []
                      return (
                        <td key={ci} className={isToday ? 'pr-today' : ''}>
                          <div className="d">{cell.day}</div>
                          {sessions.map((s) => (
                            <div key={s.id} className="ses">
                              {s.badge ? `${s.badge} ` : ''}
                              {s.title}
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {hasCoverage && cov && (
              <div className="pr-cov">
                <h3>Coverage</h3>
                <dl>
                  {cov.consultAttending && (
                    <>
                      <dt>Consult service attending</dt>
                      <dd>{cov.consultAttending}</dd>
                    </>
                  )}
                  {cov.consultFellows && (
                    <>
                      <dt>Consult fellows</dt>
                      <dd>{cov.consultFellows}</dd>
                    </>
                  )}
                  {cov.procedureFellow && (
                    <>
                      <dt>Procedure fellow</dt>
                      <dd>{cov.procedureFellow}</dd>
                    </>
                  )}
                  {cov.weekend.length > 0 && (
                    <>
                      <dt>Weekend coverage</dt>
                      <dd>
                        {cov.weekend.map((w) => (
                          <div key={w.id}>
                            <strong>{w.who}</strong>
                            {w.who && w.dates ? ': ' : ''}
                            {w.dates}
                          </div>
                        ))}
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            )}
            <div className="pr-foot">Generated {prettyDate()} · Educational schedule (de-identified)</div>
          </div>
        </section>
      )}
    </div>
  )
}
