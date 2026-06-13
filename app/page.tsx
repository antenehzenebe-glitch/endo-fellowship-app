// app/page.tsx
// Root is a pure role router. Middleware already redirects unauthenticated
// requests to /login, so anyone reaching here is signed in: send them to their
// home (staff → /dashboard, fellow → /log). An authenticated user with no
// profile (edge case) is bounced to /login.
import { redirect } from 'next/navigation'
import { getProfile, roleHome } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  redirect(roleHome(profile.role))
}
