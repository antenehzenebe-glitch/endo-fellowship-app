// dashboard/EducationCenter.tsx
// Staff "Education" center — learning-module completion across the program.
// Pure render from a ModuleCompletionOverview (no fetching, no client state).
//
// Distinct layout from the readiness board: a module-centric roster. Each
// published module is a card with a completion header and a per-fellow status
// list (Not started / Awaiting attestation / Attested|Completed), so the
// CCC/APD can see at a glance who still owes a module and which completions
// still need a faculty sign-off. Color is meaning-bearing only and every status
// is carried by icon + text, never color alone. NO PHI.
import {
  type ModuleCompletion,
  type ModuleCompletionOverview,
  type ModuleFellowStatus,
} from '@/dashboard/moduleCompletion'

const NAVY = '#003a63'

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

function StatusPill({ tone, label }: { tone: Tone; label: string }) {
  const cls =
    tone === 'good'
      ? 'bg-green-600 text-white'
      : tone === 'warn'
        ? 'bg-amber-400 text-amber-950'
        : 'bg-gray-100 text-gray-600'
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {tone === 'good' ? (
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
      )}
      {label}
    </span>
  )
}

/* --------------------------------------------------------------- stat -- */
function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="px-4 py-4 text-center">
      <p className="text-3xl font-bold tabular-nums leading-none" style={{ color: NAVY }}>
        {value}
      </p>
      <p className="mt-1.5 text-xs font-medium text-gray-500">{label}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p> : null}
    </div>
  )
}

/* ----------------------------------------------------------- summary -- */
function EducationSummary({ overview }: { overview: ModuleCompletionOverview }) {
  const moduleCount = overview.modules.length
  // "Fully done" = attested where attestation is required, else completed.
  const fullyDone = overview.modules.reduce(
    (sum, m) => sum + (m.requiresAttestation ? m.attestedCount : m.completedCount),
    0,
  )
  const possible = moduleCount * overview.totalFellows

  return (
    <div className="mb-6 overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-900/5">
      <div className="bg-gradient-to-r from-[#003a63] to-[#00598f] px-5 py-4">
        <h2 className="text-lg font-semibold leading-tight text-white">Learning modules</h2>
        <p className="mt-0.5 text-sm text-white/70">
          {moduleCount} published {moduleCount === 1 ? 'module' : 'modules'} ·{' '}
          {overview.totalFellows} active {overview.totalFellows === 1 ? 'fellow' : 'fellows'}
        </p>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white">
        <Stat label="Modules" value={moduleCount} />
        <Stat label="Fellows" value={overview.totalFellows} />
        <Stat label="Fully done" value={fullyDone} sub={possible > 0 ? `of ${possible}` : undefined} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------- module card -- */
function ModuleCard({ mod }: { mod: ModuleCompletion }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <header className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">Module</span>
            <h3 className="truncate text-lg font-semibold leading-tight text-gray-900">{mod.title}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold leading-none tabular-nums" style={{ color: NAVY }}>
              {mod.completedCount}
              <span className="text-base text-gray-400">/{mod.totalFellows}</span>
            </p>
            <p className="mt-1 text-[11px] text-gray-500">completed</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Self-check {mod.passPct}% to pass
          {mod.requiresAttestation
            ? ` · ${mod.attestedCount}/${mod.totalFellows} faculty-attested`
            : ' · no attestation required'}
        </p>
      </header>

      <div className="px-5 py-1">
        {mod.fellows.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No active fellows to track yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {mod.fellows.map((s) => {
              const st = statusFor(s, mod.requiresAttestation)
              const hasScore = typeof s.quizScore === 'number' && typeof s.quizTotal === 'number'
              return (
                <li key={s.fellowId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{s.fellowName}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                      {s.pgyLevel ? (
                        <span className="rounded bg-[#c8102e]/10 px-1.5 py-0.5 font-semibold text-[#c8102e]">
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
                  <StatusPill tone={st.tone} label={st.label} />
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
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-900/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#003a63]">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M12 7v13" strokeLinecap="round" />
          <path d="M3 6c2.5-1 6-1 9 .5C15 5 18.5 5 21 6v12c-2.5-1-6-1-9 .5C9 17 5.5 17 3 18V6Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">No modules published yet</h3>
      <p className="max-w-sm text-sm text-gray-600">
        When the program activates a learning module, each fellow&apos;s self-check completion and
        faculty attestation will roll up here.
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- root -- */
export default function EducationCenter({ overview }: { overview: ModuleCompletionOverview }) {
  return (
    <section aria-label="Learning module completion">
      <EducationSummary overview={overview} />
      {overview.modules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {overview.modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} />
          ))}
        </div>
      )}
    </section>
  )
}
