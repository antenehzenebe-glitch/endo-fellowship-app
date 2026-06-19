// app/admin/roster/page.tsx
// Staff-only roster admin — curate the public people directory + upload headshots.
// Writes are RLS-enforced via the staff member's own session (see RosterManager).
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireProfile, isStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Person } from '@/people/types'
import RosterManager from '@/people/RosterManager'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

export default async function RosterAdminPage() {
  const profile = await requireProfile()
  if (!isStaff(profile.role)) redirect('/dashboard')

  const supabase = await createClient()
  const { data } = await supabase
    .from('people')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('full_name', { ascending: true })

  const people: Person[] = (data ?? []) as Person[]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5" />
              <div>
                <h1 className="text-xl font-bold leading-tight">Roster Admin</h1>
                <p className="text-sm text-white/70">Public directory · {profile.full_name} · {profile.role.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/dashboard" className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors">Dashboard</Link>
              <SignOutButton variant="onDark" />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <RosterManager initialPeople={people} />
      </main>
    </div>
  )
}
