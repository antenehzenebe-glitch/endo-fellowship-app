// app/schedule/PublishControls.tsx
// Control for schedule editors (staff + fellows) to PUBLISH a year's schedule
// to the program. Schedules are built by the chief fellows and published in
// consultation with the APD/PD. The schedule has two independently-publishable
// views — the yearly block grid and the monthly didactic calendar — so this
// renders one card per view, each showing current publish status (when + by
// whom) and a Publish / Re-publish button guarded by an inline confirm. Calls
// the publishSchedule server action (staff + fellows; see actions.ts), which
// stamps the row and revalidates; we then router.refresh() so the status
// updates in place.
//
// Publish is ANNOUNCEMENT-ONLY (decision D1): it posts the app-wide banner. It
// does NOT gate what fellows/attendings see — the schedule renders regardless
// of publish state. Copy below must never imply visibility gating.
//
// Rendered for schedule editors (staff + fellows) — see page.tsx. NO PHI.
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
      <span className="text-xs font-semibold uppercase tracking-wide text-crimson">Publish</span>
      <h2 className="mt-1 font-bold text-primary leading-snug">
        Share {academicYear} with the program
      </h2>
      <p className="mt-1 text-sm text-muted">
        Publishing posts an announcement banner to fellows and faculty across the app,
        linking the schedule. Publish only after reviewing the schedule with the
        APD/PD — and re-publish after changes to re-notify everyone.
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
      <h3 className="font-semibold text-ink">{meta.label}</h3>
      <p className="mt-0.5 text-xs text-muted">{meta.help}</p>

      <div className="mt-2 text-sm">
        {isPublished ? (
          <p className="text-green-700 font-medium">
            <span aria-hidden="true">✓ </span>
            Published {formatDate(state.publishedAt as string)}
            {state.publishedByName ? ` · ${state.publishedByName}` : ''}
          </p>
        ) : (
          <p className="text-muted">Not published yet</p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-crimson" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 pt-1">
        {confirming ? (
          <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
            <p className="text-sm text-ink">
              Publish the {academicYear} {meta.label.toLowerCase()}? This posts an
              announcement banner to fellows and faculty that this schedule was
              updated.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={doPublish}
                disabled={pending}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-crimson text-white hover:bg-crimson-dark disabled:opacity-60 min-h-[44px]"
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
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-ink hover:bg-gray-100 disabled:opacity-60 min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-crimson text-white hover:bg-crimson-dark min-h-[44px] w-full sm:w-auto"
          >
            {isPublished ? 'Re-publish update' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  )
}
