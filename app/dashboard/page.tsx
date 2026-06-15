// app/dashboard/page.tsx
// Staff dashboard. One route, three role-aware "centers" selected by ?view=:
//   readiness  → APD command center (graduation readiness)
//   program    → PD program oversight (evaluation completion + readiness)
//   operations → coordinator worklist (chase outstanding items)
// Staff-gated; each role lands on its own center by default but may switch tabs.
import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireStaff } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'
import {
  getCoordinatorWorklist,
  getReadinessOverview,
} from '@/dashboard/queries'
import CommandCenter from '@/dashboard/CommandCenter'
import PdCenter from '@/dashboard/PdCenter'
import CoordinatorCenter from '@/dashboard/CoordinatorCenter'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

type View = 'readiness' | 'program' | 'operations'

const TABS: { view: View; label: string }[] = [
  { view: 'readiness', label: 'Readiness' },
  { view: 'program', label: 'Program' },
  { view: 'operations', label: 'Operations' },
]

function defaultViewForRole(role: UserRole): View {
  if (role === 'coordinator') return 'operations'
  if (role === 'pd') return 'program'
  return 'readiness' // apd, admin
}

function normalizeView(value: string | string[] | undefined): View | null {
  const v = Array.isArray(value) ? value[0] : value
  return v === 'readiness' || v === 'program' || v === 'operations' ? v : null
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
  // Next 15: searchParams is a Promise and must be awaited.
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
    } else {
      const overview = await getReadinessOverview()
      body = <CommandCenter overview={overview} />
    }
  } catch {
    body = <ErrorPanel what="the dashboard" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Program Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  {profile.full_name} · {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>

          {/* View tabs (links, not client state) */}
          <nav aria-label="Dashboard views" className="flex gap-1 -mb-px">
            {TABS.map((tab) => {
              const active = tab.view === view
              return (
                <Link
                  key={tab.view}
                  href={`/dashboard?view=${tab.view}`}
                  aria-current={active ? 'page' : undefined}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? 'border-[#0066CC] text-[#0066CC]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6">{body}</main>
    </div>
  )
}
