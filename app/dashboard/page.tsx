// app/dashboard/page.tsx
// Staff dashboard. One route, role-aware "centers" selected by ?view=:
//   readiness   -> APD command center (graduation readiness)
//   program     -> PD program oversight (evaluation completion + readiness)
//   evaluations -> mid-year / end-of-year evaluation summary (all staff)
//   operations  -> coordinator worklist (chase outstanding items)
// Staff-gated; each role lands on its own center by default but may switch tabs.
//
// Chrome only (restyle): sticky navy header + Howard-crimson "filled" active tab
// with an icon per view. All data loading and routing below is unchanged.
import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireStaff } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'
import { getCoordinatorWorklist, getReadinessOverview } from '@/dashboard/queries'
import { getEvalSummary } from '@/dashboard/evaluationSummary'
import CommandCenter from '@/dashboard/CommandCenter'
import PdCenter from '@/dashboard/PdCenter'
import CoordinatorCenter from '@/dashboard/CoordinatorCenter'
import EvalSummary from '@/dashboard/EvalSummary'
import SignOutButton from '@/components/SignOutButton'
import { NEW_INNOVATIONS_URL } from '@/lib/links'
import ExternalHub from '@/components/ExternalHub'

export const dynamic = 'force-dynamic'

type View = 'readiness' | 'program' | 'evaluations' | 'operations'

const TABS: { view: View; label: string }[] = [
  { view: 'readiness', label: 'Readiness' },
  { view: 'program', label: 'Program' },
  { view: 'evaluations', label: 'Evaluations' },
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
      <path d="M7 15v3M12 11v7M17 7v11" strokeLinecap="round" />
    </svg>
  ),
  evaluations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M16 4h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 13 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  operations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

function defaultViewForRole(role: UserRole): View {
  if (role === 'coordinator') return 'operations'
  if (role === 'pd') return 'program'
  return 'readiness' // apd, admin
}

function normalizeView(value: string | string[] | undefined): View | null {
  const v = Array.isArray(value) ? value[0] : value
  return v === 'readiness' || v === 'program' || v === 'evaluations' || v === 'operations'
    ? v
    : null
}

function ErrorPanel({ what }: { what: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="font-semibold text-red-900 mb-1">Couldn&apos;t load {what}</h2>
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

  let body: ReactNode
  try {
    if (view === 'operations') {
      const worklist = await getCoordinatorWorklist()
      body = <CoordinatorCenter worklist={worklist} />
    } else if (view === 'program') {
      const overview = await getReadinessOverview()
      body = <PdCenter overview={overview} />
    } else if (view === 'evaluations') {
      const summary = await getEvalSummary()
      body = <EvalSummary summary={summary} />
    } else {
      const overview = await getReadinessOverview()
      body = <CommandCenter overview={overview} />
    }
  } catch {
    body = <ErrorPanel what="the dashboard" />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-[#003a63] text-white border-b-4 border-[#c8102e] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5"
              />
              <div>
                <h1 className="text-xl font-bold leading-tight">Program Dashboard</h1>
                <p className="text-sm text-white/70">
                  {profile.full_name} · {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/onboarding"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Onboarding
              </Link>
              <Link
                href="/resources"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Materials
              </Link>
              <Link
                href="/emergencies"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Emergencies
              </Link>
              <Link
                href="/schedule"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Schedule
              </Link>
              <Link
                href="/admin/roster"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Roster
              </Link>
              <a
                href={NEW_INNOVATIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="New Innovations (opens in a new tab)"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors inline-flex items-center gap-1"
              >
                New Innovations
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <Link
                href="/account"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Password
              </Link>
              <SignOutButton variant="onDark" />
            </div>
          </div>

          <nav aria-label="Dashboard views" className="flex gap-1 pb-2 overflow-x-auto">
            {TABS.map((tab) => {
              const active = tab.view === view
              return (
                <Link
                  key={tab.view}
                  href={`/dashboard?view=${tab.view}`}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#c8102e] text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {TAB_ICONS[tab.view]}
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <ExternalHub includeSocieties={profile.role !== 'coordinator'} />
        {body}
      </main>
    </div>
  )
}
