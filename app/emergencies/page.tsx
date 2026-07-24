// app/emergencies/page.tsx
// Full endocrine emergency reference (all 15 guides). Mobile-first, one thumb:
// jump bar to filter, then every guide expanded. Server component.
import Link from 'next/link'
import { requireProfile } from '@/lib/auth'
import SignOutButton from '@/components/SignOutButton'
import FellowNav from '@/components/FellowNav'
import EmergencyGuide from './EmergencyGuide'

export const dynamic = 'force-dynamic'

export default async function EmergenciesPage() {
  const profile = await requireProfile()
  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Endocrine Emergencies
              </h1>
              <p className="text-sm text-gray-500">Hi, {firstName}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
        <FellowNav />
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">
          Quick reference for the 15 endocrine emergencies. For the full protocol,
          see{' '}
          <Link href="/resources" className="font-medium text-primary hover:underline">
            Program Materials
          </Link>
          .
        </p>
        <EmergencyGuide />
        <p className="text-xs text-gray-400 mt-6 text-center">
          Educational reference — verify doses against current institutional
          protocols.
        </p>
      </main>
    </div>
  )
}
