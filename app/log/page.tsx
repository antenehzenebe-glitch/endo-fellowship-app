// app/log/page.tsx
// Mobile Procedure Logger — the fellow's home screen. Server component: loads
// the procedure menu, the fellow's own logs (RLS scopes to them), program
// minimums, and the attending roster, then hands serializable data to the
// client form + recent list. Staff are routed to their dashboard.
import FellowNav from '@/components/FellowNav'
import { requireFellow } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import { ProcedureLogger, type Progress, type RecentLog } from '@/procedures/ProcedureLogger'

export const dynamic = 'force-dynamic'

export default async function LoggerPage() {
  const profile = await requireFellow()

  const supabase = await createClient()

  const [typesRes, targetsRes, logsRes, attendingsRes] = await Promise.all([
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
  ])

  const loadError =
    typesRes.error || targetsRes.error || logsRes.error || attendingsRes.error

  const firstName = profile.full_name.split(' ')[0]

  const Header = (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 pt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            className="w-10 h-10 shrink-0 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Hi, {firstName}</h1>
            <p className="text-sm text-gray-500">{profile.pgy_level ?? 'Fellow'}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
      <FellowNav />
    </header>
  )

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        {Header}
        <main className="max-w-md mx-auto px-4 py-6">
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

  const minByType = new Map<string, number>(targets.map((t) => [t.procedure_type, t.min_total]))
  const labelByType = new Map<string, string>(types.map((t) => [t.code, t.label]))
  const nameById = new Map<string, string>(attendings.map((a) => [a.id, a.full_name]))

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

  return (
    <div className="min-h-screen bg-gray-50">
      {Header}
      <main className="max-w-md mx-auto px-4 py-6">
        <ProcedureLogger
          progress={progress}
          attendings={attendings}
          logs={recent}
          todayStr={new Date().toISOString().slice(0, 10)}
        />
      </main>
    </div>
  )
}