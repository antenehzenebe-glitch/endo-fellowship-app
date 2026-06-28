// app/schedule/PublishControls.tsx
// Staff + fellow control to PUBLISH a year's schedule to the program. The
// schedule has two independently-publishable views — the yearly block grid and
// the monthly didactic calendar — so this renders one card per view, each
// showing current publish status (when + by whom) and a Publish / Re-publish
// button guarded by an inline confirm. Calls the publishSchedule server action
// (EDITOR_ROLES; see actions.ts), which stamps the row and revalidates; we then
// router.refresh() so the status updates in place.
//
// Only rendered for editors (staff + fellows) — see page.tsx. NO PHI.
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { publishSchedule, type ScheduleScope } from './actions'

type ScopeState = { publishedAt: string | null; publishedByName: string | null }

type Props = {
  academicYear: string
  blocks: ScopeState
  months: ScopeState
}

const SCOPE_META: Record<ScheduleScope, { label: string; help: string }> = {
  blocks: { label: 'Block schedule', help: 'The yearly rotation block grid.' },
  months: { label: 'Monthly calendar', help: 'The month-by-month didactic calendar.' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PublishControls({ academicYear, blocks, months }: Props) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">Publish</span>
      <h2 className="mt-1 font-bold text-[#003a63] leading-snug">
        Share {academicYear} with the program
      </h2>
      <p className="mt-1 text-sm text-[#5C6B7A]">
        Publishing posts an announcement across the app linking the live, printable
        schedule. Re-publish after changes to re-notify everyone.
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PublishCard academicYear={academicYear} scope="blocks" state={blocks} />
        <PublishCard academicYear={academicYear} scope="months" state={months} />
      </div>
    </section>
  )
}

function PublishCard({
  academicYear,
  scope,
  state,
}: {
  academicYear: string
  scope: ScheduleScope
  state: ScopeState
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const meta = SCOPE_META[scope]
  const isPublished = Boolean(state.publishedAt)

  function doPublish() {
    setError(null)
    startTransition(async () => {
      const res = await publishSchedule(academicYear, scope)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setConfirming(false)
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 flex flex-col">
      <h3 className="font-semibold text-[#1B2733]">{meta.label}</h3>
      <p className="mt-0.5 text-xs text-[#5C6B7A]">{meta.help}</p>

      <div className="mt-2 text-sm">
        {isPublished ? (
          <p className="text-green-700 font-medium">
            <span aria-hidden="true">✓ </span>
            Published {formatDate(state.publishedAt as string)}
            {state.publishedByName ? ` · ${state.publishedByName}` : ''}
          </p>
        ) : (
          <p className="text-[#5C6B7A]">Not published yet</p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-[#c8102e]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 pt-1">
        {confirming ? (
          <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
            <p className="text-sm text-[#1B2733]">
              Publish the {academicYear} {meta.label.toLowerCase()}? This makes it the
              live version your fellows and faculty see and posts an announcement
              across the app.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={doPublish}
                disabled={pending}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#c8102e] text-white hover:bg-[#a50d26] disabled:opacity-60 min-h-[44px]"
              >
                {pending ? 'Publishing…' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  setError(null)
                }}
                disabled={pending}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-[#1B2733] hover:bg-gray-100 disabled:opacity-60 min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#c8102e] text-white hover:bg-[#a50d26] min-h-[44px] w-full sm:w-auto"
          >
            {isPublished ? 'Re-publish update' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  )
}
