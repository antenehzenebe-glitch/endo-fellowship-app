// lib/auth.ts
// Server-side profile + role helpers. Mirrors the SQL helpers is_staff()/
// is_evaluator() so routing decisions in app code match what RLS enforces in
// the database. RLS is still the source of truth — these are for UX/routing.
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserRole = Database['public']['Enums']['user_role']

// Staff = anyone who can see across the program (mirrors public.is_staff()).
export const STAFF_ROLES = ['pd', 'apd', 'coordinator', 'admin'] as const
// Evaluators = staff + attendings (mirrors public.is_evaluator()). Attendings
// assess fellows but are NOT program staff, so they get their own home — not
// the fellow logger and not the staff command center.
export const EVALUATOR_ROLES = ['attending', 'pd', 'apd', 'coordinator', 'admin'] as const

export function isStaff(role: UserRole): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role)
}

export function isEvaluator(role: UserRole): boolean {
  return (EVALUATOR_ROLES as readonly string[]).includes(role)
}

// Where a given role lands after login. Three audiences, not two:
//   staff (pd/apd/coordinator/admin) → /dashboard  (command center)
//   attending                        → /attending  (faculty home)
//   fellow                           → /log         (procedure logger)
// The previous version collapsed this to "staff vs everyone-else", which sent
// attendings to the fellow logger.
export function roleHome(role: UserRole): string {
  if (isStaff(role)) return '/dashboard'
  if (role === 'attending') return '/attending'
  return '/log' // fellow
}

// The signed-in user's profile, or null if unauthenticated / not provisioned.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return data ?? null
}

// Require a provisioned profile; bounce to /login otherwise.
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  return profile
}

// Require staff; non-staff are sent to their own home rather than shown a 403.
export async function requireStaff(): Promise<Profile> {
  const profile = await requireProfile()
  if (!isStaff(profile.role)) redirect(roleHome(profile.role))
  return profile
}

// Require an attending; everyone else (staff, fellows) goes to their own home.
export async function requireAttending(): Promise<Profile> {
  const profile = await requireProfile()
  if (profile.role !== 'attending') redirect(roleHome(profile.role))
  return profile
}

// Require a fellow; everyone else goes to their own home. Use this to gate the
// procedure logger so attendings/staff can't land on it.
export async function requireFellow(): Promise<Profile> {
  const profile = await requireProfile()
  if (profile.role !== 'fellow') redirect(roleHome(profile.role))
  return profile
}