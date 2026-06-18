// app/schedule/page.tsx
// Rotation / continuity-clinic / coverage reference for the academic year.
// Internal program reference — gated behind login. Schedule data is static config
// (lib/schedule-config.ts); no DB query. The "current block" is computed here on
// the server (from today's date) and passed down, so the client never diverges on
// hydration. See the scope note in schedule-config.ts: this is a reference view,
// not a duty-hours tracker.
import Link from 'next/link'
import { requireProfile, isStaff } from '@/lib/auth'
import SignOutButton from '@/components/SignOutButton'
import RotationSchedule from './RotationSchedule'
import { blockForDate } from '@/lib/schedule-config'

export const dynamic = 'force-dynamic'

// Today's date in America/New_York (Howard / D.C.) as yyyy-mm-dd, so the current
// block is correct regardless of server timezone.
function todayInDC(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return parts // en-CA yields yyyy-mm-dd
}

export default async function SchedulePage() {
  const profile = await requireProfile()
  const today = todayInDC()
  const currentBlockId = blockForDate(today)?.id ?? null
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
                <h1 className="text-xl font-bold leading-tight truncate">Rotation Schedule</h1>
                <p className="text-sm text-white/70">Continuity clinic &amp; coverage</p>
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
        <RotationSchedule currentBlockId={currentBlockId} today={today} />
      </main>
    </div>
  )
}