import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STAFF_ROLES, type Profile, type UserRole } from '@/lib/supabase/database.types'

export function isStaffRole(role: UserRole): boolean {
  return (STAFF_ROLES as readonly UserRole[]).includes(role)
}

// Where each role lands after sign-in.
export function roleHome(role: UserRole): string {
  return role === 'fellow' ? '/log' : '/dashboard'
}

// Returns the signed-in user's profile, or null when signed in but not yet
// provisioned (accounts are invite-only; staff create the profile row).
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Like getProfile but treats "no profile" as a hard stop.
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/login?error=unprovisioned')
  return profile
}
