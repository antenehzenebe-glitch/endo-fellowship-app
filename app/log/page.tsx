// app/log/page.tsx
// Fellow home. For now a minimal authenticated landing so role routing has a
// real destination (roleHome('fellow') → /log). The Mobile Procedure Logger
// drops in here next. Staff are redirected to their dashboard.
import { redirect } from 'next/navigation'
import { requireProfile, isStaff } from '@/lib/auth'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

export default async function FellowHome() {
  const profile = await requireProfile()
  if (isStaff(profile.role)) redirect('/dashboard')

  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0066CC] text-white shrink-0">
              <span className="text-sm font-bold">HE</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Hi, {firstName}
              </h1>
              <p className="text-sm text-gray-500">{profile.pgy_level ?? 'Fellow'}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Log a procedure</h2>
          <p className="text-sm text-gray-600">
            Quick procedure logging is coming here next. You&apos;ll record FNA,
            ultrasound, CGM, DXA, and pump-management procedures in a couple of taps.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Your progress</h2>
          <p className="text-sm text-gray-600">
            Procedure counts toward program minimums, scholarly activity, and
            onboarding will show here once logging is live.
          </p>
        </section>
      </main>
    </div>
  )
}
