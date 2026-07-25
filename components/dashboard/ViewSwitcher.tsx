'use client'
// components/dashboard/ViewSwitcher.tsx
// The dashboard's five views as a true segmented control (quiet track, filled
// crimson active segment, icons inherited from the tab color). Client-side so
// that on mount the ACTIVE segment can be scrolled into view inside the
// horizontally-scrollable track — the coordinator lands on the 5th segment,
// which would otherwise render off-screen on a phone.
import Link from 'next/link'
import { useEffect, useRef, type ReactNode } from 'react'

export type View = 'readiness' | 'program' | 'evaluations' | 'education' | 'operations'

const TABS: { view: View; label: string }[] = [
  { view: 'readiness', label: 'Readiness' },
  { view: 'program', label: 'Program' },
  { view: 'evaluations', label: 'Evaluations' },
  { view: 'education', label: 'Education' },
  { view: 'operations', label: 'Operations' },
]

// Small inline icons (16px, stroke = currentColor) so the active/inactive
// color is inherited from the tab.
const TAB_ICONS: Record<View, ReactNode> = {
  readiness: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" strokeLinejoin="round" />
      <path d="M6 12v5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  program: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15v3M12 11v7M17 7v11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  evaluations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M16 4h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 13 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  education: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 7v13" strokeLinecap="round" />
      <path d="M3 6c2.5-1 6-1 9 .5C15 5 18.5 5 21 6v12c-2.5-1-6-1-9 .5C9 17 5.5 17 3 18V6Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  operations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function ViewSwitcher({ active }: { active: View }) {
  const activeRef = useRef<HTMLAnchorElement>(null)

  // Never let the active tab render off-screen: on mount (and on view change)
  // nudge the scroll-snapped track so the aria-current segment is visible.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [active])

  return (
    <nav aria-label="Dashboard views" className="py-3">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = tab.view === active
          return (
            <Link
              key={tab.view}
              ref={isActive ? activeRef : undefined}
              href={`/dashboard?view=${tab.view}`}
              aria-current={isActive ? 'true' : undefined}
              className={`inline-flex min-h-[44px] flex-1 shrink-0 snap-start items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson ${
                isActive
                  ? 'bg-crimson text-white shadow-sm'
                  : 'text-muted hover:bg-white/70 hover:text-ink'
              }`}
            >
              {TAB_ICONS[tab.view]}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
