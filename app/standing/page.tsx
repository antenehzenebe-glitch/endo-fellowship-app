// app/standing/page.tsx
// "Where I stand" — the fellow's read-only readiness snapshot in one place:
// procedures vs ACGME minimums, onboarding/milestone progress, and the latest
// finalized faculty evaluation. All data is RLS-scoped to the signed-in fellow.
// This is a consolidation view; data entry stays on /log and /onboarding.
import Link from 'next/link'
import { requireFellow } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import FellowNav from '@/components/FellowNav'
import { periodLabel, ratingLabel, ratingTone } from '@/lib/evaluations'

export const dynamic = 'force-dynamic'

type Bar = { label: string; done: number; min: number }

function Meter({ done, min }: { done: number; min: number }) {
  const pct = min > 0 ? Math.min(100, Math.round((done / min) * 100)) : done > 0 ? 100 : 0
  const met = min > 0 && done >= min
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: met ? '#15803d' : '#003a63' }}
      />
    </div>
  )
}

export default async function StandingPage() {
  const profile = await requireFellow()
  const supabase = await createClient()
  const firstName = profile.full_name.split(' ')[0]

  const [typesRes, targetsRes, logsRes, onbRes, evalRes] = await Promise.all([
    supabase
      .from('procedure_types')
      .select('code, label, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('procedure_targets').select('procedure_type, min_total'),
    supabase.from('procedure_logs').select('id, procedure_type'),
    supabase.from('onboarding_tasks').select('status, category'),
    supabase
      .from('fellow_evaluations')
      .select('id, period, academic_year, overall_rating, evaluator_id, finalized_at')
      .eq('status', 'final')
      .order('finalized_at', { ascending: false, nullsFirst: false })
      .limit(1),
  ])

  const loadError = typesRes.error || targetsRes.error || logsRes.error || onbRes.error

  const types = typesRes.data ?? []
  const targets = targetsRes.data ?? []
  const logs = logsRes.data ?? []
  const onb = onbRes.data ?? []
  const latestEval = (evalRes.data ?? [])[0] ?? null

  let evaluatorName: string | null = null
  if (latestEval?.evaluator_id) {
    const { data: ev } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', latestEval.evaluator_id)
      .maybeSingle()
    evaluatorName = ev?.full_name ?? null
  }

  const minByType = new Map<string, number>(targets.map((t) => [t.procedure_type, t.min_total]))
  const bars: Bar[] = types.map((t) => ({
    label: t.label,
    done: logs.filter((l) => l.procedure_type === t.code).length,
    min: minByType.get(t.code) ?? 0,
  }))
  const reqBars = bars.filter((b) => b.min > 0)
  const minsMet = reqBars.filter((b) => b.done >= b.min).length
  const minsTotal = reqBars.length
  const totalLogged = logs.length

  const onbDone = onb.filter((r) => r.status === 'completed').length
  const onbTotal = onb.length
  const inst = onb.filter((r) => r.category === 'onboarding')
  const train = onb.filter((r) => r.category === 'training')
  const instDone = inst.filter((r) => r.status === 'completed').length
  const trainDone = train.filter((r) => r.status === 'completed').length

  const Header = (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 pt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Where I stand</h1>
            <p className="text-sm text-gray-500">Hi, {firstName}</p>
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
            We couldn’t load your progress right now. Please refresh; if it keeps
            happening, sign out and back in.
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {Header}
      <main className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Procedures */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-baseline justify-between">
            <h2 className="font-bold text-gray-900">Procedures</h2>
            <Link href="/log" className="text-sm font-medium text-[#003a63] hover:underline">Log →</Link>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{minsMet} of {minsTotal}</span> minimums met
              {' · '}
              <span className="font-semibold text-gray-900">{totalLogged}</span> logged
            </p>
            {bars.length === 0 ? (
              <p className="text-sm text-gray-500">No procedures configured yet.</p>
            ) : (
              <ul className="space-y-3">
                {bars.map((b) => {
                  const met = b.min > 0 && b.done >= b.min
                  return (
                    <li key={b.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 flex items-center gap-1.5">
                          {met && <span aria-hidden="true" className="text-green-700">✓</span>}
                          {b.label}
                        </span>
                        <span className="text-gray-500 tabular-nums">
                          {b.done}{b.min > 0 ? ` / ${b.min}` : ''}
                          {met ? <span className="sr-only"> (minimum met)</span> : null}
                        </span>
                      </div>
                      <Meter done={b.done} min={b.min} />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Onboarding & milestones */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-baseline justify-between">
            <h2 className="font-bold text-gray-900">Onboarding &amp; milestones</h2>
            <Link href="/onboarding" className="text-sm font-medium text-[#003a63] hover:underline">Open →</Link>
          </div>
          <div className="p-4 space-y-4">
            {onbTotal === 0 ? (
              <p className="text-sm text-gray-500">No checklist items yet.</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{onbDone} of {onbTotal}</span> items complete
                </p>
                {inst.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">Institutional Onboarding</span>
                      <span className="text-gray-500 tabular-nums">{instDone} / {inst.length}</span>
                    </div>
                    <Meter done={instDone} min={inst.length} />
                  </div>
                )}
                {train.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">Training &amp; Development</span>
                      <span className="text-gray-500 tabular-nums">{trainDone} / {train.length}</span>
                    </div>
                    <Meter done={trainDone} min={train.length} />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Faculty evaluation */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-baseline justify-between">
            <h2 className="font-bold text-gray-900">Faculty evaluation</h2>
            <Link href="/evaluations" className="text-sm font-medium text-[#003a63] hover:underline">All →</Link>
          </div>
          <div className="p-4 space-y-3">
            {latestEval ? (
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {periodLabel(latestEval.period)} · {latestEval.academic_year}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {evaluatorName ? `by ${evaluatorName}` : 'Finalized'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-white"
                    style={{ background: ratingTone(latestEval.overall_rating) }}
                  >
                    {ratingLabel(latestEval.overall_rating)}
                  </span>
                  <Link
                    href={`/evaluations/${latestEval.id}/print`}
                    className="text-sm font-medium text-[#003a63] hover:underline"
                  >
                    Read
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No finalized evaluations yet.</p>
            )}
            <p className="text-xs text-gray-400">
              The official evaluation is completed in New Innovations; this is the program&rsquo;s summary.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
