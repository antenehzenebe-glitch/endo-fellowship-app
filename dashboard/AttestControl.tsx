// dashboard/AttestControl.tsx
// Inline faculty control on the Education center: attests one fellow's module
// self-check and (optionally) leaves feedback for that fellow. Collapsed it is a
// single button; expanded it reveals a feedback box plus confirm/cancel. On
// success it refreshes the dashboard so the row flips to its attested state.
// Rendered only for rows awaiting attestation; the action itself is staff-gated
// by RLS regardless. NO PHI.
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { attestModule } from '@/dashboard/moduleAttest'

export default function AttestControl({
  moduleId,
  fellowId,
  fellowName,
}: {
  moduleId: string
  fellowId: string
  fellowName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function confirm() {
    setError(null)
    startTransition(async () => {
      const res = await attestModule({ moduleId, fellowId, note: note.trim() || null })
      if (res.ok) {
        setOpen(false)
        setNote('')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  if (!open) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#003a63]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#003a63] transition-colors hover:bg-[#003a63]/5"
        >
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Attest &amp; add feedback
        </button>
      </div>
    )
  }

  const fieldId = `attest-note-${moduleId}-${fellowId}`

  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <label htmlFor={fieldId} className="block text-xs font-semibold text-slate-700">
        Feedback for {fellowName}{' '}
        <span className="font-normal text-slate-400">(optional — visible to the fellow)</span>
      </label>
      <textarea
        id={fieldId}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        disabled={pending}
        placeholder="Technique to reinforce, next steps… (no patient identifiers)"
        className="mt-1.5 w-full resize-y rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#003a63] focus:outline-none focus:ring-2 focus:ring-[#003a63]/30 disabled:opacity-60"
      />
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          aria-busy={pending}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-[#15803d] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#136a34] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Confirm attestation'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
            setNote('')
          }}
          disabled={pending}
          className="px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        Records you as the attesting faculty with today&apos;s date. This confirms the fellow&apos;s
        self-check; the formal evaluation remains in New Innovations.
      </p>
    </div>
  )
}
