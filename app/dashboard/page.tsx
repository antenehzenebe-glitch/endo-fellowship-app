import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'


const ROLE_LABELS: Record<string, string> = {
  fellow: 'Fellow',
  attending: 'Attending',
  pd: 'Program Director',
  apd: 'Associate Program Director',
  coordinator: 'Coordinator',
  admin: 'Admin',
}

// Staff landing. Attendings see it too (their evaluation queue will live here).
// Fellows are routed to /log instead. RLS scopes every query: staff see all
// fellows' logs, attendings see only logs they supervised.
export default async function DashboardPage() {
  const profile = await requireProfile()
  if (profile.role === 'fellow') redirect('/log')

  const supabase = await createClient()

  const [{ data: fellows }, { data: targets }, { data: logRows }, { data: catalog }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, pgy_level, is_active')
      .eq('role', 'fellow')
      .eq('is_active', true)
      .order('full_name'),
    supabase.from('procedure_targets').select('*').order('procedure_type'),
    supabase.from('procedure_logs').select('fellow_id, procedure_type'),
    supabase.from('procedure_types').select('code, label').order('sort_order'),
  ])

  const procedureLabels: Record<string, string> = {}
  for (const t of catalog ?? []) procedureLabels[t.code] = t.label
  const labelFor = (code: string) => procedureLabels[code] ?? code

  // counts[fellow_id][procedure_code]
  const counts: Record<string, Record<string, number>> = {}
  for (const row of logRows ?? []) {
    const perFellow = (counts[row.fellow_id] ??= {})
    perFellow[row.procedure_type] = (perFellow[row.procedure_type] ?? 0) + 1
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center mb-8 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Program dashboard</h1>
            <p className="text-sm text-gray-600">
              {profile.full_name} • {ROLE_LABELS[profile.role] ?? profile.role}
            </p>
          </div>
          <SignOutButton />
        </header>

        <section aria-labelledby="fellows-heading" className="mb-8">
          <h2 id="fellows-heading" className="text-xl font-bold text-gray-900 mb-3">
            Fellows — procedure progress
          </h2>
          {(fellows ?? []).length === 0 ? (
            <div className="p-6 border border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-600">
              No fellows provisioned yet. Add them in Supabase → Authentication → invite, then
              create their profile rows.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(fellows ?? []).map((f) => (
                <article key={f.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-base mb-0.5">{f.full_name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{f.pgy_level ?? '—'}</p>
                  <ul className="space-y-1.5">
                    {(targets ?? []).map((t) => {
                      const c = counts[f.id]?.[t.procedure_type] ?? 0
                      const met = t.min_total > 0 ? c >= t.min_total : true
                      return (
                        <li key={t.procedure_type} className="flex justify-between text-sm">
                          <span className="text-gray-700">{labelFor(t.procedure_type)}</span>
                          <span
                            className={`font-medium ${met ? 'text-green-700' : 'text-orange-700'}`}
                          >
                            {c} / {t.min_total} {met ? '✓' : ''}
                          </span>
                        </li>
                      )
                    })}
                    {(targets ?? []).length === 0 && (
                      <li className="text-sm text-gray-500">
                        No minimums set yet (procedure_targets is empty).
                      </li>
                    )}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="text-sm text-gray-500">
          Coming next: evaluation assignment, milestone trends, ITE scores, and the materials
          library.
        </p>
      </div>
    </main>
  )
}
