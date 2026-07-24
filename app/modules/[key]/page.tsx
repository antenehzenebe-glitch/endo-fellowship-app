// app/modules/[key]/page.tsx
// The fellow-facing learning module experience: lecture video, procedure
// videos, then the self-check (ThyroidQuiz). Completion (passing the self-check)
// is recorded for signed-in fellows; when the module requires attestation the
// page shows the attestation state. Static teaching content — NO PHI.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import FellowNav from '@/components/FellowNav'
import ThyroidQuiz from '@/modules/ThyroidQuiz'
import { MODULE_COMPONENTS } from '@/modules/registry'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ key: string }> }

export default async function ModulePage({ params }: Params) {
  const { key } = await params
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: mod } = await supabase
    .from('modules')
    .select('id, key, title, subtitle, pass_pct, requires_attestation')
    .eq('key', key)
    .eq('is_active', true)
    .maybeSingle()

  if (!mod) notFound()

  const isFellow = profile.role === 'fellow'
  const { data: progress } = isFellow
    ? await supabase
        .from('module_progress')
        .select('completed_at, quiz_score, quiz_total, attested_at, attestation_note')
        .eq('module_id', mod.id)
        .eq('fellow_id', profile.id)
        .maybeSingle()
    : { data: null }

  const Body = MODULE_COMPONENTS[mod.key]
  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{mod.title}</h1>
              <p className="text-sm text-gray-500">Hi, {firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/log"
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Logger
            </Link>
            <SignOutButton />
          </div>
        </div>
        <FellowNav />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {mod.subtitle ? <p className="text-sm text-muted">{mod.subtitle}</p> : null}

        {/* completion state for fellows */}
        {isFellow && progress?.completed_at ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              ✓ Completed
              {typeof progress.quiz_score === 'number' && typeof progress.quiz_total === 'number'
                ? ` — self-check ${progress.quiz_score}/${progress.quiz_total}`
                : ''}
            </p>
            {mod.requires_attestation ? (
              progress.attested_at ? (
                <p className="text-sm text-green-700 mt-1">
                  Faculty-attested.{progress.attestation_note ? ` Feedback: ${progress.attestation_note}` : ''}
                </p>
              ) : (
                <p className="text-sm text-amber-700 mt-1">
                  Awaiting faculty attestation — your completion is recorded and visible to faculty.
                </p>
              )
            ) : null}
          </div>
        ) : null}

        {Body ? (
          <Body />
        ) : (
          <p className="text-sm text-gray-600">This module&apos;s content is being prepared.</p>
        )}

        {/* self-check */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-primary">Self-check</h2>
            <p className="text-xs text-muted mt-0.5">
              {mod.pass_pct}% to pass{isFellow ? ' — your result is recorded' : ''}.
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <ThyroidQuiz
              moduleId={mod.id}
              moduleKey={mod.key}
              passPct={mod.pass_pct}
              canRecord={isFellow}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
