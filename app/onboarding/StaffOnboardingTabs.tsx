'use client'

// app/onboarding/StaffOnboardingTabs.tsx
// Staff-facing onboarding overview rendered as a glossy horizontal tab strip:
// one tab per fellow (name · PGY · % complete), with only the selected
// fellow's checklist shown below. Presentational only — data is fetched
// server-side in page.tsx (RLS-scoped) and passed in as props.
//
// CHANGE (this revision): each group's item list renders in a responsive grid
// (1 col on phones, 2 cols ≥640px, 3 cols ≥1024px) instead of one vertical
// column, so a long onboarding list (e.g. the incoming-PGY-4 access checklist)
// stays scannable.

import { useState } from 'react'

export type FellowLite = {
  id: string
  full_name: string | null
  pgy_level: string | null
}

export type OnbRow = {
  id: string
  fellow_id: string
  task_name: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
  category: 'onboarding' | 'training'
  created_at: string
}

const GROUPS: { key: 'onboarding' | 'training'; label: string }[] = [
  { key: 'onboarding', label: 'Institutional Onboarding' },
  { key: 'training', label: 'Training & Development Milestones' },
]

function pctOf(rows: OnbRow[]) {
  const total = rows.length
  if (!total) return 0
  const done = rows.filter((t) => t.status === 'completed').length
  return Math.round((done / total) * 100)
}

export default function StaffOnboardingTabs({
  fellows,
  rows,
}: {
  fellows: FellowLite[]
  rows: OnbRow[]
}) {
  const [activeId, setActiveId] = useState(fellows[0]?.id ?? '')

  const activeFellow = fellows.find((f) => f.id === activeId) ?? fellows[0]
  const activeRows = rows.filter((t) => t.fellow_id === activeFellow?.id)

  return (
    <div>
      {/* Glossy horizontal fellow tabs */}
      <div
        role="tablist"
        aria-label="Fellows"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {fellows.map((f) => {
          const isActive = f.id === activeFellow?.id
          const pct = pctOf(rows.filter((t) => t.fellow_id === f.id))
          return (
            <button
              key={f.id}
              role="tab"
              id={`onb-tab-${f.id}`}
              aria-selected={isActive}
              aria-controls={`onb-panel-${f.id}`}
              onClick={() => setActiveId(f.id)}
              className={[
                'group relative flex-1 min-w-[150px] rounded-xl px-4 py-3 text-left transition-all',
                'ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8102e]',
                isActive
                  ? 'bg-gradient-to-b from-[#0a4f86] to-[#003a63] text-white ring-[#003a63] shadow-md -translate-y-px'
                  : 'bg-gradient-to-b from-white to-gray-100 text-gray-700 ring-gray-200 shadow-sm hover:to-gray-50',
              ].join(' ')}
            >
              {/* glossy sheen across the top half */}
              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl',
                  isActive ? 'bg-white/10' : 'bg-white/50',
                ].join(' ')}
              />
              <span className="relative block">
                <span className="block text-sm font-semibold leading-tight truncate">
                  {f.full_name ?? 'Fellow'}
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span
                    className={[
                      'rounded px-1.5 py-0.5 text-[11px] font-medium',
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600',
                    ].join(' ')}
                  >
                    {f.pgy_level ?? 'Fellow'}
                  </span>
                  <span className={isActive ? 'text-xs text-white/80' : 'text-xs text-gray-500'}>
                    {pct}% complete
                  </span>
                </span>
              </span>
              {/* crimson accent on the active tab */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#c8102e]"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Active fellow's checklist */}
      {activeFellow && (
        <section
          key={activeFellow.id}
          id={`onb-panel-${activeFellow.id}`}
          role="tabpanel"
          aria-labelledby={`onb-tab-${activeFellow.id}`}
          className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5"
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">{activeFellow.full_name ?? 'Fellow'}</h2>
            <p className="text-xs text-gray-500">{activeFellow.pgy_level ?? 'Fellow'}</p>
          </div>

          {GROUPS.every((g) => activeRows.filter((t) => t.category === g.key).length === 0) ? (
            <p className="mt-3 text-sm text-gray-600">No onboarding items for this fellow yet.</p>
          ) : (
            GROUPS.map((g) => {
              const gi = activeRows.filter((t) => t.category === g.key)
              if (gi.length === 0) return null
              const done = gi.filter((t) => t.status === 'completed').length
              const total = gi.length
              const pct = total ? Math.round((done / total) * 100) : 0
              return (
                <div key={g.key} className="mt-4">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#003a63]">{g.label}</h3>
                    <span className="text-sm font-medium text-gray-700">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-[#003a63]" style={{ width: `${pct}%` }} />
                  </div>
                  {/* Items — multi-column grid, not one tall list */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                    {gi.map((t) => {
                      const completed = t.status === 'completed'
                      return (
                        <li key={t.id} className="flex items-start gap-2 text-sm">
                          <span aria-hidden="true" className={completed ? 'text-green-600' : 'text-gray-300'}>
                            {completed ? '✓' : '○'}
                          </span>
                          <span className={completed ? 'text-gray-500 line-through' : 'text-gray-800'}>
                            {t.task_name}
                            {completed && t.completed_at ? (
                              <span className="ml-2 text-xs text-gray-400 no-underline">
                                {new Date(t.completed_at).toLocaleDateString()}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })
          )}
        </section>
      )}
    </div>
  )
}
