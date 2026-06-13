import { redirect } from 'next/navigation'
import { requireProfile, roleHome } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import ProcedureLogForm from '@/procedures/ProcedureLogForm'
import RecentProcedures from '@/procedures/RecentProcedures'
import SignOutButton from '@/components/SignOutButton'
import { EVALUATOR_ROLES, type ProcedureType } from '@/lib/supabase/database.types'

// Mobile Procedure Logger — the fellow's home screen. One thumb, one minute.
export default async function LogPage() {
  const profile = await requireProfile()
  if (profile.role !== 'fellow') redirect(roleHome(profile.role))

  const supabase = await createClient()

  const [{ data: logs }, { data: targets }, { data: allLogs }, { data: evaluators }] =
    await Promise.all([
      supabase
        .from('procedure_logs')
        .select('*')
        .eq('fellow_id', profile.id)
        .order('date_performed', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('procedure_targets').select('*').order('procedure_type'),
      supabase.from('procedure_logs').select('procedure_type').eq('fellow_id', profile.id),
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', [...EVALUATOR_ROLES])
        .eq('is_active', true)
        .order('full_name'),
    ])

  const countsByType = { FNA: 0, THYROID_US: 0, CGM_INTERP: 0 } satisfies Record<
    ProcedureType,
    number
  >
  for (const row of allLogs ?? []) countsByType[row.procedure_type] += 1

  const attendings = (evaluators ?? []).map((e) => ({ id: e.id, full_name: e.full_name }))
  const attendingNames: Record<string, string> = {}
  for (const a of attendings) attendingNames[a.id] = a.full_name

  const today = new Date().toISOString().slice(0, 10)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-6 sm:px-6">
        <header className="flex justify-between items-center mb-6 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Log a procedure</h1>
            <p className="text-sm text-gray-600">
              {profile.full_name}
              {profile.pgy_level ? ` • ${profile.pgy_level}` : ''}
            </p>
          </div>
          <SignOutButton />
        </header>

        <section
          aria-label="New procedure entry"
          className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm mb-8"
        >
          <ProcedureLogForm attendings={attendings} today={today} />
        </section>

        <RecentProcedures
          logs={logs ?? []}
          targets={targets ?? []}
          countsByType={countsByType}
          attendingNames={attendingNames}
        />
      </div>
    </main>
  )
}
