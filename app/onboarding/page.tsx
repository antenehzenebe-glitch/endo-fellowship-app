// app/onboarding/page.tsx
// Per-fellow checklist in two groups:
//   Institutional Onboarding (category = 'onboarding') — incoming-fellow must-clear items
//   Training & Development   (category = 'training')   — ongoing formative milestones
// Role-aware: a fellow gets interactive checklists of their own items; staff get
// a read-only progress overview of every fellow. RLS scopes the data.
import Link from 'next/link'
import { requireProfile, isStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import OnboardingChecklist, { type OnboardingTask } from './OnboardingChecklist'

export const dynamic = 'force-dynamic'

type OnbRow = {
  id: string
  fellow_id: string
  task_name: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
  category: 'onboarding' | 'training'
  created_at: string
}

const GROUPS: { key: 'onboarding' | 'training'; label: string; subtitle: string }[] = [
  { key: 'onboarding', label: 'Institutional Onboarding', subtitle: 'Clear these as you start fellowship.' },
  { key: 'training', label: 'Training & Development Milestones', subtitle: 'Ongoing training and development to track through the year.' },
]

function ErrorPanel() {
  return (
    <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      We couldn’t load the checklist right now. Please refresh; if it keeps
      happening, your session may have expired — sign out and back in.
    </div>
  )
}

function toTask(r: OnbRow): OnboardingTask {
  return {
    id: r.id,
    task_name: r.task_name,
    description: r.description ?? null,
    status: r.status,
    completed_at: r.completed_at,
  }
}

export default async function OnboardingPage() {
  const profile = await requireProfile()
  const staff = isStaff(profile.role)
  const supabase = await createClient()

  // ---- Staff: progress overview of all fellows ----
  if (staff) {
    const [fellowsRes, tasksRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, pgy_level')
        .eq('role', 'fellow')
        .eq('is_active', true)
        .order('full_name', { ascending: true }),
      supabase
        .from('onboarding_tasks')
        .select('id, fellow_id, task_name, description, status, completed_at, category, created_at')
        .order('created_at', { ascending: true })
        .returns<OnbRow[]>(),
    ])

    const loadError = fellowsRes.error || tasksRes.error
    const fellows = fellowsRes.data ?? []
    const rows = tasksRes.data ?? []

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5" />
                <div>
                  <h1 className="text-xl font-bold leading-tight">Fellow Onboarding</h1>
                  <p className="text-sm text-white/70">{profile.full_name} · {profile.role.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors">Dashboard</Link>
                <SignOutButton variant="onDark" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-4">
          {loadError ? (
            <ErrorPanel />
          ) : fellows.length === 0 ? (
            <p className="text-sm text-gray-600">No active fellows yet.</p>
          ) : (
            fellows.map((f) => {
              const items = rows.filter((t) => t.fellow_id === f.id)
              return (
                <section key={f.id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h2 className="font-semibold text-gray-900">{f.full_name}</h2>
                    <p className="text-xs text-gray-500">{f.pgy_level ?? 'Fellow'}</p>
                  </div>

                  {GROUPS.map((g) => {
                    const gi = items.filter((t) => t.category === g.key)
                    if (gi.length === 0) return null
                    const done = gi.filter((t) => t.status === 'completed').length
                    const total = gi.length
                    const pct = total ? Math.round((done / total) * 100) : 0
                    return (
                      <div key={g.key} className="mt-4">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h3 className="text-sm font-semibold text-[#003a63]">{g.label}</h3>
                          <span className="text-sm font-medium text-gray-700">{done}/{total}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
                          <div className="h-full bg-[#003a63]" style={{ width: `${pct}%` }} />
                        </div>
                        <ul className="space-y-2">
                          {gi.map((t) => {
                            const completed = t.status === 'completed'
                            return (
                              <li key={t.id} className="flex items-start gap-2 text-sm">
                                <span aria-hidden="true" className={completed ? 'text-green-600' : 'text-gray-300'}>
                                  {completed ? '✓' : '○'}
                                </span>
                                <span className={completed ? 'text-gray-500 line-through' : 'text-gray-800'}>
                                  {t.task_name}
                                  {completed && t.completed_at ? (
                                    <span className="ml-2 text-xs text-gray-400 no-underline">
                                      {new Date(t.completed_at).toLocaleDateString()}
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </section>
              )
            })
          )}
        </main>
      </div>
    )
  }

  // ---- Fellow: own interactive checklists ----
  const { data, error } = await supabase
    .from('onboarding_tasks')
    .select('id, fellow_id, task_name, description, status, completed_at, category, created_at')
    .order('created_at', { ascending: true })
    .returns<OnbRow[]>()

  const rows = data ?? []
  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">My Checklist</h1>
              <p className="text-sm text-gray-500">Hi, {firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/log" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Logger</Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {error ? (
          <ErrorPanel />
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-600">
            Your checklist is empty. Your program coordinator will add your items.
          </div>
        ) : (
          GROUPS.map((g) => {
            const groupTasks = rows.filter((r) => r.category === g.key).map(toTask)
            if (groupTasks.length === 0) return null
            return (
              <OnboardingChecklist key={g.key} title={g.label} subtitle={g.subtitle} initialTasks={groupTasks} />
            )
          })
        )}
      </main>
    </div>
  )
}
