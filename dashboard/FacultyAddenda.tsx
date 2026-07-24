// dashboard/FacultyAddenda.tsx
// App-side companion to New Innovations: additional, program-specific items
// that don't fit the standard NI evaluation form (e.g. procedure sign-off,
// conference presentation, longitudinal clinic note). Staff post an addendum
// per fellow; fellows read theirs. NO PHI — educational comments only.
// Read-only here for the dashboard: the posting form lives on /evaluations.
import type { ReactNode } from 'react'
import type { Addendum } from '@/dashboard/queries'

const KIND_META: Record<Addendum['kind'], { label: string; icon: ReactNode; cls: string }> = {
  procedure_signoff: {
    label: 'Procedure sign-off',
    cls: 'bg-primary-50 text-primary',
    icon: (
      <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  conference: {
    label: 'Conference',
    cls: 'bg-violet-50 text-violet-700',
    icon: (
      <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M2 5h12v8H2zM5 3v4M11 3v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  clinic_note: {
    label: 'Clinic note',
    cls: 'bg-teal-50 text-teal-700',
    icon: (
      <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M4 2h8v12H4zM6.5 5.5h3M6.5 8h3M6.5 10.5h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  other: {
    label: 'Addendum',
    cls: 'bg-gray-100 text-gray-700',
    icon: (
      <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M8 3v10M3 8h10" strokeLinecap="round" />
      </svg>
    ),
  },
}

export default function FacultyAddenda({ addenda }: { addenda: Addendum[] }) {
  if (addenda.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No addenda yet this academic year. Program-specific items (procedure
        sign-offs, conference presentations, clinic notes) will appear here as
        faculty post them.
      </p>
    )
  }

  return (
    <ul className="space-y-2.5">
      {addenda.map((a) => {
        const meta = KIND_META[a.kind] ?? KIND_META.other
        return (
          <li key={a.id} className="rounded-lg border border-gray-200 bg-white p-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.cls}`}>
                <span aria-hidden="true">{meta.icon}</span>
                {meta.label}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(a.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {a.authorName ? ` · ${a.authorName}` : ''}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-gray-800 leading-relaxed">{a.body}</p>
          </li>
        )
      })}
    </ul>
  )
}
