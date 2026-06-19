// app/emergencies/page.tsx
// Fellows' Survival Guide for endocrine & electrolyte emergencies.
// Internal program reference — gated behind login (requireProfile). Content is
// static (lib/endocrine-emergencies.ts); no DB query needed. Navy header matches
// the rest of the app; the searchable guide is a client component.
import Link from 'next/link'
import { requireProfile, isStaff } from '@/lib/auth'
import SignOutButton from '@/components/SignOutButton'
import EmergencyGuide from './EmergencyGuide'

export const dynamic = 'force-dynamic'

export default async function EmergenciesPage() {
  const profile = await requireProfile()
  // Back link goes where the user actually has a home: staff → dashboard,
  // fellows → the logger (their home screen).
  const homeHref = isStaff(profile.role) ? '/dashboard' : '/log'
  const homeLabel = isStaff(profile.role) ? 'Dashboard' : 'Logger'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight truncate">Endocrine Emergencies</h1>
                <p className="text-sm text-white/70">Fellows&apos; Survival Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href={homeHref}
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                {homeLabel}
              </Link>
              <SignOutButton variant="onDark" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <p className="sr-only">Signed in as {profile.full_name}</p>
        <EmergencyGuide />
      </main>
    </div>
  )
}