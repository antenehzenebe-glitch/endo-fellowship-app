'use client'

// app/emergencies/EmergencyGuide.tsx
// Interactive accordion for the 15 endocrine emergencies. Client component
// (no fetching, no DB). DESIGN.md: Howard navy (primary token) + crimson, status by
// icon + text + color (never color alone), 320px → desktop, 44px tap targets.
import { useMemo, useState } from 'react'
import {
  EMERGENCIES,
  EMERGENCY_CATEGORIES,
  type Emergency,
  type EmergencyCategory,
  type EmergencyTable,
} from '@/lib/endocrine-emergencies'
import { NAVY } from '@/lib/tokens'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4>
      <div className="mt-1 text-sm text-slate-800 leading-relaxed">{children}</div>
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  )
}

function ETable({ t }: { t: EmergencyTable }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {t.headers.map((h) => (
              <th
                key={h}
                className="border border-slate-300 px-2 py-1.5 text-left text-white"
                style={{ background: NAVY }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
              {r.map((c, j) => (
                <td key={j} className="border border-slate-300 px-2 py-1.5 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmergencyBody({ e }: { e: Emergency }) {
  return (
    <div className="px-4 pb-4">
      {e.overview ? <p className="text-sm text-slate-800 leading-relaxed">{e.overview}</p> : null}
      {e.presentation ? (
        <Section title="Presentation">
          <Bullets items={e.presentation} />
        </Section>
      ) : null}
      {e.diagnosis ? (
        <Section title="Diagnosis">
          <Bullets items={e.diagnosis} />
        </Section>
      ) : null}
      {e.management ? (
        <Section title="Management">
          <Bullets items={e.management} />
        </Section>
      ) : null}
      {e.table ? (
        <Section title={e.tableCaption ?? 'Reference'}>
          <ETable t={e.table} />
        </Section>
      ) : null}
      {e.pearl ? (
        <div className="mt-4 rounded-md border-l-4 border-crimson bg-primary-50 px-3 py-2 text-sm text-primary">
          <span className="font-semibold text-crimson">Pearl · </span>
          {e.pearl}
        </div>
      ) : null}
    </div>
  )
}

export default function EmergencyGuide() {
  const [cat, setCat] = useState<EmergencyCategory | 'all'>('all')
  const [open, setOpen] = useState<string | null>(EMERGENCIES[0]?.slug ?? null)

  const list = useMemo(
    () => (cat === 'all' ? EMERGENCIES : EMERGENCIES.filter((e) => e.category === cat)),
    [cat]
  )

  return (
    <div>
      {/* jump bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Filter by system">
        {(['all', ...EMERGENCY_CATEGORIES] as const).map((c) => {
          const active = cat === c
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="shrink-0 px-3 min-h-[44px] rounded-full text-sm font-medium border transition-colors"
              style={
                active
                  ? { background: NAVY, color: 'white', borderColor: NAVY }
                  : { background: 'white', color: NAVY, borderColor: '#d1d5db' }
              }
              aria-pressed={active}
            >
              {c === 'all' ? 'All' : c}
            </button>
          )
        })}
      </div>

      {/* accordion */}
      <div className="mt-3 space-y-2">
        {list.map((e) => {
          const isOpen = open === e.slug
          return (
            <div key={e.slug} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : e.slug)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[44px] text-left"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-primary leading-snug">{e.name}</span>
                  <span className="block text-xs text-slate-500">{e.category}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-slate-400 text-lg leading-none transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                >
                  ▾
                </span>
              </button>
              {isOpen ? <EmergencyBody e={e} /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
