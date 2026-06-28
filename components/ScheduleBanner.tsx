// components/ScheduleBanner.tsx
// App-wide announcement that a schedule view was published. Rendered from the
// root layout for every signed-in page (the layout computes the most-recent
// publish event and passes it in). Dismissible PER PUBLISH EVENT: the dismiss
// key includes the publish timestamp, so re-publishing (which bumps the
// timestamp) re-shows the banner even for someone who dismissed the last one.
// Hidden in print output. Links the live, printable schedule for that year.
//
// Educational program announcement only — NO PHI.
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Scope = 'blocks' | 'months'

export type LatestPublish = {
  academicYear: string
  scope: Scope
  publishedAt: string
} | null

const SCOPE_LABEL: Record<Scope, string> = {
  blocks: 'block schedule',
  months: 'monthly calendar',
}

export default function ScheduleBanner({ latest }: { latest: LatestPublish }) {
  // Start hidden so server HTML and first client render agree (both null); reveal
  // after we've checked localStorage on the client. Avoids a flash-then-hide.
  const [dismissed, setDismissed] = useState(true)

  const key = latest
    ? `schedBanner:${latest.academicYear}:${latest.scope}:${latest.publishedAt}`
    : null

  useEffect(() => {
    if (!key) return
    try {
      setDismissed(window.localStorage.getItem(key) === '1')
    } catch {
      setDismissed(false)
    }
  }, [key])

  if (!latest || !key || dismissed) return null

  function dismiss() {
    try {
      if (key) window.localStorage.setItem(key, '1')
    } catch {
      /* ignore storage failures — banner just won't persist its dismissal */
    }
    setDismissed(true)
  }

  return (
    <div className="print:hidden bg-[#003a63] text-white border-b border-white/15">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <span aria-hidden="true" className="text-base leading-none">
          📅
        </span>
        <p className="text-sm flex-1 min-w-0">
          The{' '}
          <span className="font-semibold">
            {latest.academicYear} {SCOPE_LABEL[latest.scope]}
          </span>{' '}
          has been published.{' '}
          <Link
            href={`/schedule/print?ay=${encodeURIComponent(latest.academicYear)}`}
            className="underline underline-offset-2 font-medium hover:text-white/90"
          >
            View / print
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 -mr-2 inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded text-white/80 hover:text-white hover:bg-white/10 text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
