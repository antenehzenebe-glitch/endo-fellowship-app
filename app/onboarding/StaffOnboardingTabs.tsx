'use client'

// app/onboarding/StaffOnboardingTabs.tsx
// Staff (non-fellow) overview: per-fellow onboarding progress with a tab per
// fellow, each showing that fellow's two checklists read-only (staff can see
// status but items are toggled by the fellow). Read-only mirrors the fellow UI.
import { useState } from 'react'

type Row = {
  id: string
  fellow_id: string
  task_name: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
  category: 'onboarding' | 'training'
  created_at: string
}

type Fellow = { id: string; full_name: string; pgy_level: string | null }

const GROUPS: { key: 'onboarding' | 'training'; label: string }[] = [
  { key: 'onboarding', label: 'Institutional Onboarding' },
  { key: 'training', label: 'Training & Development' },
]

const STATUS_STYLE: Record<Row['status'], string> = {
  pending: 'bg-white border-gray-300 text-gray-600',
  in_progress: 'bg-amber-400 border-amber-400 text-amber-950',
  completed: 'bg-green-600 border-green-600 text-white',
}
const STATUS_LABEL: Record<Row['status'], string> = {
  pending: '○ To do',
  in_progress: '◐ In progress',
  completed: '✓ Done',
}

function GroupCard({ label, rows }: { label: string; rows: Row[] }) {
  const done = rows.filter((r) => r.status === 'completed').length
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm">{label}</h3>
          <span className="text-xs font-semibold text-gray-600 tabular-nums">
            {done} / {rows.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
          <div className="h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="divide-y divide-gray-100">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-2.5 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium leading-snug ${r.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {r.task_name}
              </p>
              {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${STATUS_STYLE[r.status]}`}>
              {STATUS_LABEL[r.status]}
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-4 text-sm text-gray-400">No items.</li>}
      </ul>
    </section>
  )
}

export default function StaffOnboardingTabs({ fellows, rows }: { fellows: Fellow[]; rows: Row[] }) {
  const [selectedId, setSelectedId] = useState<string>(fellows[0]?.id ?? '')
  const selected = fellows.find((f) => f.id === selectedId) ?? fellows[0]
  const selRows = rows.filter((r) => r.fellow_id === selected?.id)

  return (
    <div className="space-y-4">
      {/* fellow tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Fellows">
        {fellows.map((f) => {
          const active = f.id === selected?.id
          const total = rows.filter((r) => r.fellow_id === f.id).length
          const done = rows.filter((r) => r.fellow_id === f.id && r.status === 'completed').length
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(f.id)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${
                active ? 'border-primary bg-primary-50' : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <span className="block text-sm font-semibold text-gray-900">{f.full_name}</span>
              <span className="block text-xs text-gray-500 tabular-nums">
                {f.pgy_level ?? 'Fellow'} · {done}/{total} done
              </span>
            </button>
          )
        })}
      </div>

      {selRows.length === 0 ? (
        <p className="text-sm text-gray-600">No checklist items for {selected?.full_name} yet.</p>
      ) : (
        <div className="space-y-4">
          {GROUPS.map((g) => {
            const gRows = selRows.filter((r) => r.category === g.key)
            if (gRows.length === 0) return null
            return <GroupCard key={g.key} label={g.label} rows={gRows} />
          })}
        </div>
      )}
    </div>
  )
}
