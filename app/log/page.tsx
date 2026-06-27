// app/log/page.tsx
// The fellow's home — redesigned. A navy header band, the color-coded section
// nav, then a real dashboard layout: on desktop the procedure logger sits beside
// an "at a glance" card + the two time-critical shortcuts (Schedule, Emergencies);
// on a phone everything stacks single-column (logger first, for fast entry). The
// quick-links launch bar runs full width below. Server component: loads the
// procedure menu, the fellow's own logs (RLS scopes to them), program minimums,
// the attending roster, and the published learning modules (+ this fellow's
// progress), then hands serializable data to the client form.
// Staff are routed to their dashboard. NO PHI.
import Link from 'next/link'
import FellowNav from '@/components/FellowNav'
import { requireFellow } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import { ProcedureLogger, type Progress, type RecentLog } from '@/procedures/ProcedureLogger'
import ExternalHub from '@/components/ExternalHub'

export const dynamic = 'force-dynamic'

export default async function LoggerPage() {
  const profile = await requireFellow()

  const supabase = await createClient()

  const [typesRes, targetsRes, logsRes, attendingsRes, modulesRes, progressRes] = await Promise.all([
    supabase
      .from('procedure_types')
      .select('code, label, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('procedure_targets').select('procedure_type, min_total'),
    supabase
      .from('procedure_logs')
      .select('id, procedure_type, date_performed, outcome, supervising_attending_id')
      .order('date_performed', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['attending', 'pd', 'apd'])
      .eq('is_active', true)
      .order('full_name', { ascending: true }),
    supabase
      .from('modules')
      .select('id, key, title, subtitle, requires_attestation')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('module_progress')
      .select('module_id, completed_at, attested_at')
      .eq('fellow_id', profile.id),
  ])

  const loadError =
    typesRes.error ||
    targetsRes.error ||
    logsRes.error ||
    attendingsRes.error ||
    modulesRes.error ||
    progressRes.error

  const firstName = profile.full_name.split(' ')[0]

  const Header = (
    <header>
      <div className="bg-gradient-to-r from-[#003a63] to-[#001f34] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt=""
              className="w-11 h-11 shrink-0 object-contain bg-white rounded-lg p-1"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight truncate">Hi, {firstName}</h1>
              <p className="text-sm text-white/70">
                {profile.pgy_level ?? 'Fellow'} · Endocrinology Fellowship
              </p>
            </div>
          </div>
          <SignOutButton variant="onDark" />
        </div>
      </div>
      <div className="bg-white border-b border-slate-200">
        <FellowNav />
      </div>
    </header>
  )

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        {Header}
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            We couldn’t load your logger right now. Please refresh; if it keeps
            happening, your session may have expired — sign out and back in.
          </div>
        </main>
      </div>
    )
  }

  const types = typesRes.data ?? []
  const targets = targetsRes.data ?? []
  const logs = logsRes.data ?? []
  const attendings = attendingsRes.data ?? []
  const modules = modulesRes.data ?? []
  const moduleProgress = progressRes.data ?? []

  const minByType = new Map<string, number>(targets.map((t) => [t.procedure_type, t.min_total]))
  const labelByType = new Map<string, string>(types.map((t) => [t.code, t.label]))
  const nameById = new Map<string, string>(attendings.map((a) => [a.id, a.full_name]))
  const progressByModule = new Map<string, (typeof moduleProgress)[number]>(
    moduleProgress.map((p) => [p.module_id, p]),
  )

  const progress: Progress[] = types.map((t) => ({
    code: t.code,
    label: t.label,
    done: logs.filter((l) => l.procedure_type === t.code).length,
    min: minByType.get(t.code) ?? 0,
  }))

  const recent: RecentLog[] = logs.slice(0, 20).map((l) => ({
    id: l.id,
    label: labelByType.get(l.procedure_type) ?? l.procedure_type,
    date_performed: l.date_performed,
    outcome: l.outcome,
    attendingName: l.supervising_attending_id
      ? nameById.get(l.supervising_attending_id) ?? null
      : null,
  }))

  // At-a-glance roll-up (summary, distinct from the logger's per-procedure cards).
  const totalLogged = progress.reduce((s, p) => s + p.done, 0)
  const withMin = progress.filter((p) => p.min > 0)
  const minTotal = withMin.length
  const metCount = withMin.filter((p) => p.done >= p.min).length
  const metPct = minTotal > 0 ? Math.round((metCount / minTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {Header}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Procedure logger — the daily tool, front and center */}
          <section className="lg:col-span-2">
            <ProcedureLogger
              progress={progress}
              attendings={attendings}
              logs={recent}
              todayStr={new Date().toISOString().slice(0, 10)}
            />
          </section>

          {/* Side rail: snapshot + the two "need-it-fast" destinations */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#003a63] to-[#06243b] p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">At a glance</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold leading-none">{totalLogged}</span>
                <span className="mb-0.5 text-sm text-white/70">procedures logged</span>
              </div>
              {minTotal > 0 && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-white/80">
                    <span>Minimums met</span>
                    <span className="font-semibold">
                      {metCount}/{minTotal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${metPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/schedule"
                className="flex flex-col items-start gap-2 rounded-2xl p-4 text-white shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: '#0f766e' }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                  <path d="M4 10h16M8 3v4M16 3v4" />
                </svg>
                <span className="text-sm font-semibold">Schedule</span>
              </Link>
              <Link
                href="/emergencies"
                className="flex flex-col items-start gap-2 rounded-2xl p-4 text-white shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: '#b91c1c' }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4l9 16H3z" />
                  <path d="M12 10v4M12 17.5h.01" />
                </svg>
                <span className="text-sm font-semibold">Emergencies</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Learning modules — the program's interactive teaching units (lecture +
            videos + self-check). Data-driven: one card per published module, with
            this fellow's completion state. Reuses the module page's own palette. */}
        {modules.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#003a63]">
              Learning modules
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((m) => {
                const p = progressByModule.get(m.id)
                const done = Boolean(p?.completed_at)
                const awaitingAttestation = done && m.requires_attestation && !p?.attested_at
                return (
                  <Link
                    key={m.id}
                    href={`/modules/${m.key}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#003a63]/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003a63] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">
                        Module
                      </span>
                      {done && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-bold text-[#003a63] leading-snug">{m.title}</h3>
                    {m.subtitle && <p className="mt-1 text-sm text-[#5C6B7A]">{m.subtitle}</p>}
                    {awaitingAttestation && (
                      <p className="mt-2 text-xs font-medium text-[#b45309]">
                        Awaiting faculty attestation
                      </p>
                    )}
                    <span className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-1 self-start rounded-lg bg-[#003a63] px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[#04263f]">
                      {done ? 'Review module' : 'Start module'}
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <div className="mt-6">
          <ExternalHub />
        </div>
      </main>
    </div>
  )
}
