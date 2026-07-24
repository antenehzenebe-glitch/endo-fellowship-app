// app/dashboard/page.tsx
// Staff landing for pd / apd / coordinator / admin.
//
// CENTER MODEL (role-shaped). Every staff role lands on the same Readiness
// board (CommandCenter) — the shared operational view. Tabs add role centers:
// the readiness board stays first for everyone, then an evaluation MATRIX
// (PD/APD/Chief — read-only summary; the official evaluation is in New
// Innovations), learning-module completion (all staff), People directory,
// onboarding pipeline, and program scorecard. Attendings have their own home
// (/attending) and never see this page.
//
// NO PHI anywhere on this page.
import Link from 'next/link'
import { requireStaff } from '@/lib/auth'
import SignOutButton from '@/components/SignOutButton'
import CommandCenter from '@/dashboard/CommandCenter'
import EducationCenter from '@/dashboard/EducationCenter'
import PeopleCenter from '@/dashboard/PeopleCenter'
import CoordinatorCenter from '@/dashboard/CoordinatorCenter'
import PdCenter from '@/dashboard/PdCenter'
import EvalSummary from '@/dashboard/EvalSummary'
import { getReadinessOverview, getCoordinatorWorklist } from '@/dashboard/queries'
import { getModuleCompletionOverview } from '@/dashboard/moduleCompletion'
import { getPeopleOverview } from '@/dashboard/peopleDirectory'
import { getEvaluationSummary } from '@/dashboard/evaluationSummary'
import ExternalHub from '@/components/ExternalHub'
import { NEW_INNOVATIONS_URL } from '@/lib/links'

export const dynamic = 'force-dynamic'

type Role = 'pd' | 'apd' | 'coordinator' | 'admin'

type Tab = {
  id: string
  label: string
  show: (role: Role) => boolean
}

const TABS: Tab[] = [
  { id: 'readiness', label: 'Readiness', show: () => true },
  { id: 'evaluations', label: 'Evaluations', show: (r) => r !== 'coordinator' },
  { id: 'education', label: 'Education', show: () => true },
  { id: 'people', label: 'People', show: () => true },
  { id: 'operations', label: 'Operations', show: (r) => r === 'coordinator' || r === 'admin' },
  { id: 'program', label: 'Program', show: (r) => r === 'pd' || r === 'apd' },
]

export default async function StaffDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const profile = await requireStaff()
  const role = profile.role as Role
  const { tab } = await searchParams

  const visibleTabs = TABS.filter((t) => t.show(role))
  const active = visibleTabs.some((t) => t.id === tab) ? (tab as string) : 'readiness'

  const needs = new Set<string>([active])
  const [readiness, worklist, modules, people, evalSummary] = await Promise.all([
    needs.has('readiness') || needs.has('program') ? getReadinessOverview() : null,
    needs.has('operations') ? getCoordinatorWorklist() : null,
    needs.has('education') ? getModuleCompletionOverview() : null,
    needs.has('people') ? getPeopleOverview() : null,
    needs.has('evaluations') ? getEvaluationSummary() : null,
  ])

  // Who may attest module completions: everyone except the coordinator (the
  // server action enforces the same rule; this only hides the control).
  const canAttest = role !== 'coordinator'

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded-lg p-0.5"
              />
              <div>
                <h1 className="text-lg font-bold leading-tight">Program Dashboard</h1>
                <p className="text-xs text-white/60">
                  Endocrinology, Diabetes &amp; Metabolism Fellowship
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-white/60">
                {profile.full_name} · {role.toUpperCase()}
              </span>
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
                href="/onboarding"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Onboarding
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

          {/* Tabs */}
          <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto">
            {visibleTabs.map((t) => {
              const isActive = t.id === active
              return (
                <Link
                  key={t.id}
                  href={`/dashboard?tab=${t.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-crimson text-white'
                      : 'border-transparent text-white/60 hover:text-white/90'
                  }`}
                >
                  {t.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main: readiness board (APD) / role centers */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        {active === 'readiness' && readiness ? <CommandCenter overview={readiness} /> : null}
        {active === 'evaluations' && evalSummary ? <EvalSummary summary={evalSummary} /> : null}
        {active === 'education' && modules ? (
          <EducationCenter overview={modules} canAttest={canAttest} />
        ) : null}
        {active === 'people' && people ? <PeopleCenter overview={people} /> : null}
        {active === 'operations' && worklist ? <CoordinatorCenter worklist={worklist} /> : null}
        {active === 'program' && readiness ? <PdCenter overview={readiness} /> : null}
      </main>

      {/* Bottom: outbound systems & societies (compact launch bar) */}
      <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6">
        <ExternalHub />
      </div>
    </div>
  )
}
