// dashboard/FacultyAddenda.tsx
// Foot-of-summary "Faculty notes" block: one lightweight, editable free-text
// note per fellow, rendered below the read-only Evaluation Summary matrix.
// Client component (textarea + Save) so EvalSummary itself stays a server
// component. Only mounted for authors (pd / apd / admin) — RLS independently
// enforces the same on every write. Color follows DESIGN.md: navy for
// structure, Howard crimson for actions. Mobile-first; 44px touch targets.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveFellowAddendum, clearFellowAddendum } from '@/dashboard/addendumActions'
import type { FellowAddendaData, FellowAddendumRow } from '@/dashboard/fellowAddenda'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function FellowNoteCard({ fellow, canEdit }: { fellow: FellowAddendumRow; canEdit: boolean }) {
  const router = useRouter()
  const note = fellow.note
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note?.body ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setDraft(note?.body ?? '')
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setDraft(note?.body ?? '')
    setError(null)
    setEditing(false)
  }

  async function save() {
    setBusy(true)
    setError(null)
    const res = await saveFellowAddendum({ fellowId: fellow.id, body: draft })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setEditing(false)
    router.refresh()
  }

  async function remove() {
    setBusy(true)
    setError(null)
    const res = await clearFellowAddendum({ fellowId: fellow.id })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setDraft('')
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#003a63]">{fellow.name}</span>
          {fellow.pgyLevel ? (
            <span className="inline-block rounded bg-[#003a63]/10 px-1.5 py-0.5 text-xs font-semibold text-[#003a63]">
              {fellow.pgyLevel}
            </span>
          ) : null}
        </div>
        {canEdit && !editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#c8102e] transition-colors hover:bg-[#c8102e]/[0.06]"
          >
            {note ? 'Edit' : 'Add a note'}
          </button>
        ) : null}
      </div>

      {!editing ? (
        note ? (
          <div className="mt-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{note.body}</p>
            <p className="mt-2 text-xs text-gray-500">
              — {note.authorName ?? 'Unknown'} · {formatDate(note.updatedAt)}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No note yet.</p>
        )
      ) : (
        <div className="mt-3 space-y-2">
          <label htmlFor={`note-${fellow.id}`} className="sr-only">
            Faculty note for {fellow.name}
          </label>
          <textarea
            id={`note-${fellow.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="A short faculty note on this fellow — strengths, focus areas, follow-up."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003a63]"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy || draft.trim().length === 0}
              className="rounded-lg bg-[#c8102e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#a60d26] disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save note'}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            {note ? (
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FacultyAddenda({
  data,
  canEdit = true,
}: {
  data: FellowAddendaData
  canEdit?: boolean
}) {
  if (data.fellows.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-[#003a63]">Faculty notes</h2>
        <span className="text-sm text-gray-500">One short note per fellow</span>
      </div>
      <p className="text-sm text-gray-600">
        A lightweight, free-text note alongside the summary — not a formal evaluation. Visible to
        program leadership only.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {data.fellows.map((f) => (
          <FellowNoteCard key={f.id} fellow={f} canEdit={canEdit} />
        ))}
      </div>
    </section>
  )
}
