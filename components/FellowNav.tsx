'use client'

// components/FellowNav.tsx
// Shared fellow-facing section nav — redesigned to be conspicuous: each section
// is a color-coded pill with an icon (so a tab is never missed), the tabs wrap
// onto multiple rows instead of hiding in a scroll strip, and the active tab is
// filled with its accent color. Width is governed by the parent, so this looks
// right both on the wide dashboard and on the narrower section pages.
// New Innovations is appended as an outbound link (GME system of record).
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NEW_INNOVATIONS_URL } from '@/lib/links'
import type { ReactNode } from 'react'

type NavItem = { href: string; label: string; color: string; icon: ReactNode }

// Accent colors are chosen dark enough for white text on the active (filled) pill.
const ITEMS: NavItem[] = [
  { href: '/log', label: 'Logger', color: '#c8102e', icon: <PathIcon name="logger" /> },
  { href: '/standing', label: 'Progress', color: '#047857', icon: <PathIcon name="progress" /> },
  { href: '/onboarding', label: 'Checklist', color: '#b45309', icon: <PathIcon name="checklist" /> },
  { href: '/evaluations', label: 'Evaluations', color: '#6d28d9', icon: <PathIcon name="star" /> },
  { href: '/resources', label: 'Materials', color: '#1d4ed8', icon: <PathIcon name="book" /> },
  { href: '/emergencies', label: 'Emergencies', color: '#b91c1c', icon: <PathIcon name="alert" /> },
  { href: '/schedule', label: 'Schedule', color: '#0f766e', icon: <PathIcon name="calendar" /> },
  { href: '/account', label: 'Password', color: '#334155', icon: <PathIcon name="lock" /> },
]

export default function FellowNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Sections"
      className="mx-auto flex max-w-5xl flex-wrap gap-2 px-3 pb-3 pt-1"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={
              active
                ? { background: item.color, color: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }
                : { background: '#ffffff', color: '#1e293b', boxShadow: 'inset 0 0 0 1px #e2e8f0' }
            }
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-lg"
              style={
                active
                  ? { background: 'rgba(255,255,255,0.22)', color: '#ffffff' }
                  : { background: item.color + '14', color: item.color }
              }
              aria-hidden="true"
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        )
      })}

      <a
        href={NEW_INNOVATIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="New Innovations (opens in a new tab)"
        className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: '#003a63', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.22)', color: '#ffffff' }}
          aria-hidden="true"
        >
          <PathIcon name="external" />
        </span>
        New Innovations
      </a>
    </nav>
  )
}

// Compact inline icons (no icon-library dependency). stroke=currentColor so the
// chip's color style drives them.
function PathIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    logger: (
      <>
        <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
        <path d="M8 6H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2" />
        <path d="M9 13l2 2 4-4" />
      </>
    ),
    progress: (
      <>
        <path d="M22 7l-8.5 8.5-4-4L2 19" />
        <path d="M16 7h6v6" />
      </>
    ),
    checklist: (
      <>
        <path d="M10 6h10M10 12h10M10 18h10" />
        <path d="M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17" />
      </>
    ),
    star: <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9z" />,
    book: (
      <>
        <path d="M3 5s2-1 4.5-1S12 5 12 5v14s-2-1-4.5-1S3 19 3 19z" />
        <path d="M12 5s2-1 4.5-1S21 5 21 5v14s-2-1-4.5-1S12 19 12 19z" />
      </>
    ),
    alert: (
      <>
        <path d="M12 4l9 16H3z" />
        <path d="M12 10v4M12 17.5h.01" />
      </>
    ),
    calendar: (
      <>
        <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        <path d="M4 10h16M8 3v4M16 3v4" />
      </>
    ),
    lock: (
      <>
        <path d="M7 10V8a5 5 0 0 1 10 0v2" />
        <path d="M5 10h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" />
      </>
    ),
    external: <path d="M7 17 17 7M9 7h8v8" />,
  }
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}
