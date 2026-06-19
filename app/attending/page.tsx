// app/attending/page.tsx
// Faculty home for attendings. Attendings are evaluators, not program staff and
// not fellows — so they land here instead of the staff dashboard or the fellow
// logger. Server component: gated to attendings; everyone else is routed to
// their own home by requireAttending().
import Link from 'next/link'
import { requireAttending } from '@/lib/auth'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

type Tile = {
  href: string
  title: string
  blurb: string
  cta: string
}

// Surfaces an attending can use today. The fellow logger is deliberately absent.
const TILES: Tile[] = [
  {
    href: '/resources',
    title: 'Program Materials',
    blurb: 'Curriculum, policies, didactic decks, and board-prep resources.',
    cta: 'Open materials',
  },
  {
    href: '/emergencies',
    title: 'Endocrine Emergencies',
    blurb: 'Quick reference for DKA/HHS, adrenal crisis, thyroid storm, and more.',
    cta: 'Open reference',
  },
  {
    href: '/schedule',
    title: 'Program Schedule',
    blurb: 'Weekly continuity, didactics, training sessions, and rotation blocks.',
    cta: 'View schedule',
  },
]

export default async function AttendingHome() {
  const profile = await requireAttending()
  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5"
              />
              <div>
                <h1 className="text-xl font-bold leading-tight">Faculty Home</h1>
                <p className="text-sm text-white/70">
                  {profile.full_name} · {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
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
                href="/account"
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Password
              </Link>
              <SignOutButton variant="onDark" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Welcome, Dr. {firstName}</h2>
          <p className="text-sm text-slate-600 mt-1">
            Faculty view for the Endocrinology, Diabetes &amp; Metabolism fellowship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#003a63]/30 transition-all"
            >
              <h3 className="font-semibold text-slate-900">{t.title}</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{t.blurb}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#003a63] mt-3 group-hover:gap-2 transition-all">
                {t.cta} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}

          {/* Evaluations — live */}
          <Link
            href="/evaluations"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#003a63]/30 transition-all"
          >
            <h3 className="font-semibold text-slate-900">Fellow Evaluations</h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Write mid-year and end-of-year narrative evaluations for fellows, then print them for the record.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#003a63] mt-3 group-hover:gap-2 transition-all">
              Open evaluations <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </main>
    </div>
  )
}
