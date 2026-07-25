// dashboard/EducationCenter.tsx
// Staff "Education" center — learning-module completion across the program.
// Renders from a ModuleCompletionOverview. Faculty can attest a fellow's
// self-check (and leave feedback) inline via AttestControl on rows that are
// awaiting attestation; attested rows show who signed off and any feedback.
// Attestation is a clinical sign-off: the attest control is only rendered when
// the viewer may attest (canAttest — every staff role except the coordinator);
// coordinators still see the full completion/attestation status, read-only.
//
// v2 STRUCTURAL redesign: opens with the shared overview band (completions /
// awaiting attestation / fully done + a plain-language takeaway), then
// module cards in the same card language as the readiness board — eyebrow,
// big completion numeral, tidy fellow rows with status pills, a calm attested
// state, and the attest control inline where sign-off is still owed.
// Color is meaning-bearing only and every status is carried by icon + text,
// never color alone. NO PHI.
import {
  type ModuleCompletion,
  type ModuleCompletionOverview,
  type ModuleFellowStatus,
} from '@/dashboard/moduleCompletion'
import AttestControl from '@/dashboard/AttestControl'
import StatusPill, { type StatusTone } from '@/components/ui/StatusPill'
import OverviewBand from '@/components/ui/OverviewBand'


/* --------------------------------------------------------- status pill -- */
type Tone = 'good' | 'warn' | 'idle'

function statusFor(
  s: ModuleFellowStatus,
  requiresAttestation: boolean,
): { label: string; tone: Tone } {
  if (!s.completedAt) return { label: 'Not started', tone: 'idle' }
  if (requiresAttestation && !s.attestedAt) return { label: 'Awaiting attestation', tone: 'warn' }
  return { label: requiresAttestation ? 'Attested' : 'Completed', tone: 'good' }
}

const TONE_MAP: Record<Tone, StatusTone> = { good: 'success', warn: 'warning', idle: 'neutral' }

function ModuleStatusPill({ tone, label }: { tone: Tone; label: string }) {
  const icon =
    tone === 'good' ? (
      <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : tone === 'warn' ? (
      <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M4 8h8" strokeLinecap="round" />
      </svg>
    )
  return (
    <StatusPill tone={TONE_MAP[tone]} icon={icon}>
      {label}
    </StatusPill>
  )
}

/* ----------------------------------------------------------- summary -- */
function EducationBand({ overview }: { overview: ModuleCompletionOverview }) {
  const moduleCount = overview.modules.length
  const completions = overview.modules.reduce((sum, m) => sum + m.completedCount, 0)
  // "Awaiting attestation" = self-check done but faculty sign-off still owed.
  const awaiting = overview.modules.reduce(
    (sum, m) => sum + (m.requiresAttestation ? m.completedCount - m.attestedCount : 0),
    0,
  )
  // "Fully done" = attested where attestation is required, else completed.
  const fullyDone = overview.modules.reduce(
    (sum, m) => sum + (m.requiresAttestation ? m.attestedCount : m.completedCount),
    0,
  )
  const possible = moduleCount * overview.totalFellows

  return (
    <OverviewBand
      eyebrow="Education"
      title="Learning modules"
      takeaway={
        moduleCount === 0
          ? 'No modules are published yet — completion rolls up here once one is.'
          : awaiting > 0
            ? `${awaiting} ${awaiting === 1 ? 'completion is' : 'completions are'} waiting on faculty sign-off.`
            : 'Nothing is waiting on faculty sign-off.'
      }
      aside={`${moduleCount} published ${moduleCount === 1 ? 'module' : 'modules'} · ${overview.totalFellows} active ${overview.totalFellows === 1 ? 'fellow' : 'fellows'}`}
      stats={[
        { label: 'Completions', value: completions, sub: possible > 0 ? `of ${possible} possible` : undefined },
        { label: 'Awaiting attestation', value: awaiting, tone: 'warning' },
        { label: 'Fully done', value: fullyDone, tone: 'success' },
      ]}
    />
  )
}

/* ------------------------------------------------------- module card -- */
function ModuleCard({ mod, canAttest }: { mod: ModuleCompletion; canAttest: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Module</p>
            <h3 className="mt-1 truncate text-lg font-semibold leading-tight text-gray-900">{mod.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-bold leading-none tabular-nums text-primary">
              {mod.completedCount}
              <span className="text-base font-semibold text-gray-400">/{mod.totalFellows}</span>
            </p>
            <p className="mt-1 text-xs text-muted">completed</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Self-check {mod.passPct}% to pass
          {mod.requiresAttestation
            ? ` · ${mod.attestedCount}/${mod.totalFellows} faculty-attested`
            : ' · no attestation required'}
        </p>
      </header>

      <div className="px-5 py-1">
        {mod.fellows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No active fellows to track yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {mod.fellows.map((s) => {
              const st = statusFor(s, mod.requiresAttestation)
              const hasScore = typeof s.quizScore === 'number' && typeof s.quizTotal === 'number'
              return (
                <li key={s.fellowId} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{s.fellowName}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                        {s.pgyLevel ? (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                            {s.pgyLevel}
                          </span>
                        ) : null}
                        {hasScore ? (
                          <span className="tabular-nums">
                            Self-check {s.quizScore}/{s.quizTotal}
                          </span>
                        ) : null}
                        {s.completedAt ? (
                          <span className="tabular-nums">
                            {new Date(s.completedAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ModuleStatusPill tone={st.tone} label={st.label} />
                  </div>

                  {/* Awaiting attestation -> inline faculty attest + feedback.
                      Hidden entirely for roles that may not attest (coordinator). */}
                  {canAttest && st.tone === 'warn' ? (
                    <AttestControl
                      moduleId={mod.id}
                      moduleTitle={mod.title}
                      fellowId={s.fellowId}
                      fellowName={s.fellowName}
                    />
                  ) : null}

                  {/* Attested -> calm confirmation of who signed off and any
                      feedback left for the fellow. */}
                  {st.tone === 'good' && (s.attestedByName || s.attestationNote) ? (
                    <div className="mt-2 rounded-lg border border-green-100 bg-green-50/60 px-3 py-2 text-xs">
                      {s.attestedByName ? (
                        <p className="flex items-center gap-1.5 font-medium text-green-800">
                          <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Attested by {s.attestedByName}
                          {s.attestedAt ? ` · ${new Date(s.attestedAt).toLocaleDateString()}` : ''}
                        </p>
                      ) : null}
                      {s.attestationNote ? (
                        <p className="mt-1 leading-relaxed text-slate-700">
                          <span className="font-semibold">Feedback:</span> {s.attestationNote}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </article>
  )
}

/* --------------------------------------------------------- empty state -- */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M12 7v13" strokeLinecap="round" />
          <path d="M3 6c2.5-1 6-1 9 .5C15 5 18.5 5 21 6v12c-2.5-1-6-1-9 .5C9 17 5.5 17 3 18V6Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">No modules published yet</h3>
      <p className="max-w-sm text-sm text-muted">
        When the program activates a learning module, each fellow&apos;s self-check completion and
        faculty attestation will roll up here.
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- root -- */
export default function EducationCenter({
  overview,
  canAttest,
}: {
  overview: ModuleCompletionOverview
  canAttest: boolean
}) {
  return (
    <section aria-label="Learning module completion" className="space-y-6">
      <EducationBand overview={overview} />
      {overview.modules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {overview.modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} canAttest={canAttest} />
          ))}
        </div>
      )}
    </section>
  )
}
