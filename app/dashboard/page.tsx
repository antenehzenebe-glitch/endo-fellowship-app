// app/dashboard/page.tsx
// Staff dashboard. One route, role-aware "centers" selected by ?view=:
//   readiness   -> APD command center (graduation readiness)
//   program     -> PD program oversight (evaluation completion + readiness)
//   evaluations -> mid-year / end-of-year evaluation summary (all staff)
//   education   -> learning-module completion (all staff) + faculty attestation
//                  (faculty/leadership only — the coordinator cannot attest)
//   operations  -> coordinator worklist (chase outstanding items)
// Staff-gated; each role lands on its own center by default but may switch tabs.
//
// The Evaluations tab shows the read-only completion summary; authors
// (pd/apd/admin via canAuthorEval) also get a CTA up top into the full
// authoring workspace at /evaluations, plus a "Faculty notes" block at the FOOT
// of the summary (one lightweight, editable note per fellow). Both are
// author-only and never shown to the coordinator; RLS independently enforces
// the same on the addenda table. The summary matrix itself stays a read-only
// server component (EvalSummary) — the notes block is a separate client
// component rendered beneath it.
//
// v2 chrome (restyle only): a slim light identity bar (logo + title + signed-in
// staff member), secondary links as a horizontally-scrollable snap pill row on
// phones, and the five views as a true segmented control (active = filled
// crimson, inactive = quiet). All data loading and routing below is unchanged.
import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireStaff } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'
import { getCoordinatorWorklist, getReadinessOverview } from '@/dashboard/queries'
import { getEvalSummary } from '@/dashboard/evaluationSummary'
import { getFellowAddenda } from '@/dashboard/fellowAddenda'
import { getModuleCompletion } from '@/dashboard/moduleCompletion'
import { canAuthorEval } from '@/lib/evaluations'
import CommandCenter from '@/dashboard/CommandCenter'
import PdCenter from '@/dashboard/PdCenter'
import CoordinatorCenter from '@/dashboard/CoordinatorCenter'
import EvalSummary from '@/dashboard/EvalSummary'
import FacultyAddenda from '@/dashboard/FacultyAddenda'
import EducationCenter from '@/dashboard/EducationCenter'
import SignOutButton from '@/components/SignOutButton'
import { NEW_INNOVATIONS_URL } from '@/lib/links'
import ExternalHub from '@/components/ExternalHub'

export const dynamic = 'force-dynamic'

type View = 'readiness' | 'program' | 'evaluations' | 'education' | 'operations'

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

// Secondary app navigation — quiet pills in one horizontally-scrollable,
// scroll-snapped row so a phone never wraps into a wall or overflows the page.
const SITE_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/resources', label: 'Materials' },
  { href: '/emergencies', label: 'Emergencies' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/admin/roster', label: 'Roster' },
  { href: NEW_INNOVATIONS_URL, label: 'New Innovations', external: true },
  { href: '/account', label: 'Password' },
]

const SITE_PILL_CLASS =
  'inline-flex min-h-[44px] shrink-0 snap-start items-center gap-1 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function defaultViewForRole(role: UserRole): View {
  if (role === 'coordinator') return 'operations'
  if (role === 'pd') return 'program'
  return 'readiness' // apd, admin
}

function normalizeView(value: string | string[] | undefined): View | null {
  const v = Array.isArray(value) ? value[0] : value
  return v === 'readiness' ||
    v === 'program' ||
    v === 'evaluations' ||
    v === 'education' ||
    v === 'operations'
    ? v
    : null
}

// CTA into the full authoring workspace, shown above the read-only summary for
// authors only. Same card language as the rest of the dashboard; the summary
// itself stays the at-a-glance completion grid.
function EvalAuthorCTA() {
  return (
    <Link
      href="/evaluations"
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-crimson/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-crimson">Authoring</p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-ink">Write or edit a program summary</p>
          <p className="mt-0.5 text-sm text-muted">
            Mid-year &amp; end-of-year narratives — the program&apos;s summary alongside the official New Innovations review.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-crimson">
          Open
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

function ErrorPanel({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
      <h2 className="mb-1 font-semibold text-red-900">Couldn&apos;t load {what}</h2>
      <p className="text-sm text-red-700">
        The data didn&apos;t come back. Refresh the page; if it keeps failing, the
        database connection may be down.
      </p>
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string | string[] }>
}) {
  const profile = await requireStaff()
  const sp = (await searchParams) ?? {}
  const view: View = normalizeView(sp.view) ?? defaultViewForRole(profile.role)

  // Module attestation is a clinical sign-off: every staff role except the
  // (non-clinical) coordinator may attest. The server action re-checks this.
  const canAttest = profile.role !== 'coordinator'

  let body: ReactNode
  try {
    if (view === 'operations') {
      const worklist = await getCoordinatorWorklist()
      body = <CoordinatorCenter worklist={worklist} />
    } else if (view === 'program') {
      const overview = await getReadinessOverview()
      body = <PdCenter overview={overview} />
    } else if (view === 'evaluations') {
      const canAuthor = canAuthorEval(profile.role)
      const [summary, addenda] = await Promise.all([
        getEvalSummary(),
        canAuthor ? getFellowAddenda() : Promise.resolve(null),
      ])
      body = (
        <div className="space-y-6">
          {canAuthor ? <EvalAuthorCTA /> : null}
          <EvalSummary summary={summary} />
          {canAuthor && addenda ? <FacultyAddenda data={addenda} canEdit currentUserName={profile.full_name} /> : null}
        </div>
      )
    } else if (view === 'education') {
      const overview = await getModuleCompletion()
      body = <EducationCenter overview={overview} canAttest={canAttest} />
    } else {
      const overview = await getReadinessOverview()
      body = <CommandCenter overview={overview} />
    }
  } catch {
    body = <ErrorPanel what="the dashboard" />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Slim identity bar: crimson rule on top, then logo + title + who is
          signed in. Light (not navy) so the centers below own the emphasis. */}
      <header className="sticky top-0 z-30 border-t-4 border-crimson border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src="/logo.png"
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-tight text-ink">Program Dashboard</h1>
                <p className="truncate text-xs text-muted">
                  {profile.full_name} · {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <SignOutButton />
            </div>
          </div>

          {/* Secondary links: one scroll-snapped pill row (scrolls sideways on
              a phone; never wraps, never overflows the page). */}
          <nav
            aria-label="Site"
            className="flex items-center gap-2 overflow-x-auto pb-2 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SITE_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="New Innovations (opens in a new tab)"
                  className={SITE_PILL_CLASS}
                >
                  {link.label}
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={SITE_PILL_CLASS}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* View switcher: a true segmented control — quiet track, filled
              crimson active segment, icons inherited from the tab color. */}
          <nav aria-label="Dashboard views" className="pb-3">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((tab) => {
                const active = tab.view === view
                return (
                  <Link
                    key={tab.view}
                    href={`/dashboard?view=${tab.view}`}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex min-h-[44px] flex-1 shrink-0 snap-start items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson ${
                      active
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <ExternalHub includeSocieties={profile.role !== 'coordinator'} />
        </div>
        {body}
      </main>
    </div>
  )
}
