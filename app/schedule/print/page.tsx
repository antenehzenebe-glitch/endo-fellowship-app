// app/schedule/print/page.tsx
// Server-rendered print sheets: Sheet 1 = 13-block rotation grid (landscape),
// Sheet 2+ = one monthly didactic calendar per page (portrait). Open the page
// and use the browser's Print / Save-as-PDF. Plain HTML + inline CSS — no
// client JS. Multi-year: ?ay= picks the academic year; defaults to current.
import Link from 'next/link'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  asConfig,
  type ScheduleConfig,
  type ScheduleMonth,
  type Coverage,
} from '@/lib/schedule'

export const dynamic = 'force-dynamic'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function prettyDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function fmt(iso: string): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Calendar weeks (Sun-first) for a YYYY-MM month, nulls padding the ends.
function weeksFor(ym: string): (string | null)[][] {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return []
  const first = new Date(y, m - 1, 1)
  const days = new Date(y, m, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(`${ym}-${String(d).padStart(2, '0')}`)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default async function SchedulePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>
}) {
  const { ay } = await searchParams
  await requireProfile()

  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('program_schedule')
    .select('academic_year, config, is_current')
    .order('academic_year', { ascending: false })

  const years = rows ?? []
  const selected =
    years.find((r) => r.academic_year === ay) ??
    years.find((r) => r.is_current) ??
    years[0] ??
    null
  const config: ScheduleConfig = asConfig(selected?.config)
  const ayLabel = selected?.academic_year ?? ay ?? ''

  const months: ScheduleMonth[] = [...config.months].sort((a, b) => a.ym.localeCompare(b.ym))

  return (
    <div className="pr">
      {/* print CSS — inline so the page is fully self-contained */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@page { size: letter; margin: 12mm; }
.pr { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#1b2733; }
.pr-sheet { max-width: 1040px; margin: 0 auto 32px; }
.pr-band { background:#003a63; color:#fff; border-radius:8px 8px 0 0; padding:14px 18px; }
.pr-band h1, .pr-band h2 { margin:0; font-size:20px; font-weight:800; letter-spacing:.2px; }
.pr-band p { margin:2px 0 0; font-size:12px; color:#cbd9e6; }
.pr-body { border:1px solid #cbd5e1; border-top:none; border-radius:0 0 8px 8px; padding:16px; }

/* Screen: sheets keep a readable minimum width and scroll sideways on phones;
   print: overflow is visible so the sheet fits the page as before. */
.pr-scroll { overflow-x:auto; }
table.pr-grid { width:100%; min-width:900px; border-collapse:collapse; font-size:11px; table-layout:fixed; }
.pr-grid th, .pr-grid td { border:1px solid #cbd5e1; padding:5px 6px; vertical-align:top; text-align:left; }
.pr-grid thead th { background:#f1f5f9; font-weight:700; font-size:10px; text-transform:uppercase; letter-spacing:.4px; color:#475569; }
.pr-grid td.rowh { background:#f8fafc; font-weight:700; font-size:10px; text-transform:uppercase; letter-spacing:.3px; color:#5c6b7a; width:88px; }
.pr-grid .b-label { font-weight:700; font-size:11px; color:#1b2733; }
.pr-grid .b-dates { color:#64748b; font-size:10px; margin-top:1px; }
.pr-grid .cell-att { font-weight:600; }
.pr-grid .cell-fellow { color:#334155; }

.pr-cal-wrap { margin-top:0; }
table.pr-cal { width:100%; min-width:900px; border-collapse:collapse; table-layout:fixed; }
.pr-cal th { background:#f1f5f9; font-size:10px; text-transform:uppercase; letter-spacing:.4px; color:#475569; padding:5px 4px; border:1px solid #cbd5e1; }
.pr-cal td { border:1px solid #cbd5e1; vertical-align:top; height:86px; padding:4px 5px; font-size:10px; }
.pr-cal .dnum { font-weight:700; color:#334155; font-size:11px; }
.pr-cal .empty { background:#f8fafc; }
.pr-chip { display:block; margin-top:3px; padding:2px 4px; border-radius:4px; background:#eef2f6; border-left:3px solid #003a63; font-size:10px; line-height:1.25; }

.pr-cov { margin-top:14px; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; }
.pr-cov h3 { margin:0 0 6px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.5px; color:#5c6b7a; }
.pr-cov dl { margin:0; display:grid; grid-template-columns: 1fr; row-gap:5px; column-gap:10px; }
@media (min-width: 640px) {
  .pr-cov dl { grid-template-columns: 190px 1fr; }
}
.pr-cov dt { font-size:11px; font-weight:600; color:#475569; }
.pr-cov dd { margin:0; font-size:11px; color:#1b2733; }

.pr-toolbar { max-width:1040px; margin:16px auto; display:flex; gap:10px; align-items:center; }
.pr-btn { display:inline-block; padding:10px 18px; border-radius:8px; font-size:14px; font-weight:600; text-decoration:none; cursor:pointer; border:1px solid #003a63; }
.pr-btn.primary { background:#003a63; color:#fff; }
.pr-btn.ghost { background:#fff; color:#003a63; }
.pr-empty { padding:40px; text-align:center; color:#64748b; font-size:14px; }
.pr-foot { margin-top:10px; font-size:10px; color:#94a3b8; }

@media print {
  .no-print { display:none !important; }
  .pr-sheet { page-break-after: always; max-width:none; }
  .pr-sheet:last-of-type { page-break-after: auto; }
  .pr-scroll { overflow: visible; }
  table.pr-grid, table.pr-cal { min-width:0; page-break-inside: auto; }
  tr, td, th { page-break-inside: avoid; }
  .pr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
          `,
        }}
      />

      <div className="pr-toolbar no-print">
        <button className="pr-btn primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <Link href="/schedule" className="pr-btn ghost">
          Back to schedule
        </Link>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Tip: Sheet 1 prints best in Landscape.
        </span>
      </div>

      {/* ---------- Sheet 1: 13-block rotation grid ---------- */}
      <section className="pr-sheet">
        <div className="pr-band">
          <h1>Rotation Block Schedule</h1>
          <p>
            Howard University Hospital · Department of Endocrinology
            {ayLabel ? ` · Academic Year ${esc(ayLabel)}` : ''}
          </p>
        </div>
        <div className="pr-body">
          {config.blocks.length === 0 ? (
            <div className="pr-empty">No block grid has been set up yet.</div>
          ) : (
            <div className="pr-scroll">
            <table className="pr-grid">
              <thead>
                <tr>
                  <th className="rowh">Block</th>
                  {config.blocks.map((b) => (
                    <th key={b.id}>
                      <div className="b-label">{esc(b.label)}</div>
                      <div className="b-dates">
                        {fmt(b.start)} – {fmt(b.end)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="rowh">Attending</td>
                  {config.blocks.map((b) => (
                    <td key={b.id} className="cell-att">
                      {esc(b.attending)}
                    </td>
                  ))}
                </tr>
                {config.fellows.map((f) => (
                  <tr key={f.id}>
                    <td className="rowh">
                      {esc(f.name)}
                      {f.pgy ? <div className="b-dates">{esc(f.pgy)}</div> : null}
                    </td>
                    {config.blocks.map((b) => (
                      <td key={b.id} className="cell-fellow">
                        {esc(b.assignments[f.id] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <div className="pr-foot">Generated {prettyDate()} · Educational schedule (de-identified)</div>
        </div>
      </section>

      {/* ---------- Sheets 2+: monthly didactic calendars ---------- */}
      {months.length === 0 ? (
        <section className="pr-sheet">
          <div className="pr-band">
            <h1>Monthly Didactic Calendars</h1>
            <p>Howard University Hospital · Department of Endocrinology</p>
          </div>
          <div className="pr-body">
            <div className="pr-empty">No monthly calendars yet.</div>
          </div>
        </section>
      ) : (
        months.map((month) => {
          const byDate = new Map<string, { title: string; badge?: string }[]>()
          month.sessions.forEach((s) => {
            if (!s.date) return
            const arr = byDate.get(s.date) ?? []
            arr.push({ title: s.title, badge: s.badge ?? undefined })
            byDate.set(s.date, arr)
          })
          const cov: Coverage = month.coverage
          const hasCoverage =
            cov.consultAttending.trim() ||
            cov.consultFellows.trim() ||
            cov.procedureFellow.trim() ||
            cov.weekend.some((w) => w.who.trim() || w.dates.trim())
          return (
            <section key={month.id} className="pr-sheet">
              <div className="pr-band">
                <h2>{month.label || month.ym}</h2>
                <p>
                  Howard University Hospital · Department of Endocrinology
                  {month.subtitle ? ` · ${month.subtitle}` : ''}
                </p>
              </div>
              <div className="pr-body">
                <div className="pr-scroll">
                <table className="pr-cal">
                  <thead>
                    <tr>
                      {DOW.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeksFor(month.ym).map((week, i) => (
                      <tr key={i}>
                        {week.map((date, j) => {
                          if (!date) return <td key={j} className="empty" />
                          const day = Number(date.slice(-2))
                          const items = byDate.get(date) ?? []
                          return (
                            <td key={j}>
                              <div className="dnum">{day}</div>
                              {items.map((s, k) => (
                                <span key={k} className="pr-chip">
                                  {s.badge ? `${s.badge} ` : ''}
                                  {esc(s.title)}
                                </span>
                              ))}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                {hasCoverage && cov && (
                  <div className="pr-cov">
                    <h3>Coverage</h3>
                    <dl>
                      {cov.consultAttending.trim() ? (
                        <>
                          <dt>Consult Service Attending</dt>
                          <dd>{esc(cov.consultAttending)}</dd>
                        </>
                      ) : null}
                      {cov.consultFellows.trim() ? (
                        <>
                          <dt>Consult Fellows</dt>
                          <dd>{esc(cov.consultFellows)}</dd>
                        </>
                      ) : null}
                      {cov.procedureFellow.trim() ? (
                        <>
                          <dt>Procedure Fellow</dt>
                          <dd>{esc(cov.procedureFellow)}</dd>
                        </>
                      ) : null}
                      {cov.weekend
                        .filter((w) => w.who.trim() || w.dates.trim())
                        .map((w) => (
                          <span key={w.id} style={{ display: 'contents' }}>
                            <dt>{esc(w.dates || 'Weekend')}</dt>
                            <dd>{esc(w.who)}</dd>
                          </span>
                        ))}
                    </dl>
                  </div>
                )}
                <div className="pr-foot">
                  {ayLabel ? `Academic Year ${esc(ayLabel)} · ` : ''}Generated {prettyDate()}
                </div>
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
