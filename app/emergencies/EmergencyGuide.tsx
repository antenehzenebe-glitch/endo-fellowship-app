'use client'

// app/emergencies/EmergencyGuide.tsx
// Fellows' Survival Guide — searchable, expandable quick-reference for endocrine
// & electrolyte emergencies. Pure client render over the static EMERGENCIES data
// (no fetching, no DB). DESIGN.md: Howard navy (#003a63) + crimson, status by
// icon + text + color (never color alone), 320px → desktop, 44px tap targets.
import { useMemo, useState } from 'react'
import {
  EMERGENCIES,
  EMERGENCY_CATEGORIES,
  type Emergency,
  type EmergencyCategory,
  type EmergencyTable,
} from '@/lib/endocrine-emergencies'

const NAVY = '#003a63'

/* ----------------------------------------------------------------- icons -- */
const iconSearch = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
  </svg>
)
const iconChevron = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const iconWarning = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M10.3 3.9 1.8 18A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* --------------------------------------------------------- section block -- */
function Section({ heading, items, accent }: { heading: string; items: string[]; accent?: boolean }) {
  if (items.length === 0) return null
  return (
    <div>
      <h4 className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${accent ? 'text-[#c8102e]' : 'text-gray-500'}`}>
        {heading}
      </h4>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700 leading-snug">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------------------------------------- table block -- */
function TableBlock({ t }: { t: EmergencyTable }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500">{t.title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              {t.columns.map((c, i) => (
                <th key={i} className="border-b border-gray-200 px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 ? 'bg-gray-50/50' : 'bg-white'}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 align-top text-gray-700 ${ci === 0 ? 'font-medium text-gray-900 whitespace-nowrap' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.note ? <p className="mt-1.5 text-xs leading-snug text-gray-500">{t.note}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------ one card -- */
function EmergencyCard({
  e,
  open,
  onToggle,
}: {
  e: Emergency
  open: boolean
  onToggle: () => void
}) {
  const cat = EMERGENCY_CATEGORIES[e.category]
  const panelId = `emrg-panel-${e.id}`
  const btnId = `emrg-btn-${e.id}`

  return (
    <article className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${open ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
      <h3>
        <button
          id={btnId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-900 leading-tight">{e.name}</span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cat.chip}`}>
                {cat.label}
              </span>
            </span>
            <span className="mt-1 block text-sm text-gray-500 leading-snug">{e.summary}</span>
          </span>
          <span className={`mt-0.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
            {iconChevron}
          </span>
        </button>
      </h3>

      {open ? (
        <div id={panelId} role="region" aria-labelledby={btnId} className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
          <Section heading="Clinical features" items={e.features} />
          <Section heading="Diagnosis / key labs" items={e.diagnosis} />
          {e.tables?.map((t, i) => (
            <TableBlock key={i} t={t} />
          ))}
          <Section heading="Management" items={e.management} accent />
          <Section heading="Disposition & follow-up" items={e.followUp} />
          {e.pearls.length > 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-1.5">High-yield pearls</h4>
              <ul className="space-y-1.5">
                {e.pearls.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-900 leading-snug">
                    <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold">★</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

/* --------------------------------------------------------------- root -- */
export default function EmergencyGuide() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<EmergencyCategory | 'all'>('all')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const categoriesPresent = useMemo(() => {
    const seen = new Set<EmergencyCategory>()
    for (const e of EMERGENCIES) seen.add(e.category)
    return (Object.keys(EMERGENCY_CATEGORIES) as EmergencyCategory[]).filter((c) => seen.has(c))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EMERGENCIES.filter((e) => {
      if (cat !== 'all' && e.category !== cat) return false
      if (!q) return true
      const hay = [
        e.name,
        e.summary,
        EMERGENCY_CATEGORIES[e.category].label,
        ...e.features,
        ...e.diagnosis,
        ...e.management,
        ...e.followUp,
        ...e.pearls,
        ...(e.tables ?? []).flatMap((t) => [t.title, t.note ?? '', ...t.columns, ...t.rows.flat()]),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, cat])

  const allOpen = filtered.length > 0 && filtered.every((e) => openIds.has(e.id))

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setOpenIds((prev) => {
      if (allOpen) {
        const next = new Set(prev)
        for (const e of filtered) next.delete(e.id)
        return next
      }
      const next = new Set(prev)
      for (const e of filtered) next.add(e.id)
      return next
    })

  return (
    <div className="space-y-4">
      {/* Disclaimer — always visible */}
      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex gap-2.5">
          <span className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true">{iconWarning}</span>
          <p className="text-sm text-amber-900 leading-snug">
            <span className="font-semibold">Educational quick-reference only.</span> This guide supports learning;
            it does not replace attending judgment or your institution&apos;s protocols. Verify every drug and dose
            against current local guidelines before use.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{iconSearch}</span>
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emergencies, symptoms, or management…"
          aria-label="Search emergencies"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#003a63] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setCat('all')}
          aria-pressed={cat === 'all'}
          className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
            cat === 'all' ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          style={cat === 'all' ? { backgroundColor: NAVY } : undefined}
        >
          All ({EMERGENCIES.length})
        </button>
        {categoriesPresent.map((c) => {
          const meta = EMERGENCY_CATEGORIES[c]
          const count = EMERGENCIES.filter((e) => e.category === c).length
          const active = cat === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={active}
              className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                active ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={active ? { backgroundColor: NAVY } : undefined}
            >
              {meta.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Result count + expand/collapse */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'topic' : 'topics'}
          {query.trim() || cat !== 'all' ? ' match' : ''}
        </p>
        {filtered.length > 0 ? (
          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-medium text-[#003a63] hover:underline"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        ) : null}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
          No emergencies match your search. Try a different term or clear the filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {filtered.map((e) => (
            <EmergencyCard key={e.id} e={e} open={openIds.has(e.id)} onToggle={() => toggle(e.id)} />
          ))}
        </div>
      )}
    </div>
  )
}