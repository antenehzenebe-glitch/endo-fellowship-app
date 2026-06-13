import { redirect } from 'next/navigation'
import { requireProfile, roleHome } from '@/lib/auth'

// Root = role router. Fellows land on the mobile logger, everyone else on the
// staff dashboard. Unauthenticated users are bounced to /login by middleware;
// authenticated-but-unprovisioned users are handled inside requireProfile.
export default async function Home() {
  const profile = await requireProfile()
  redirect(roleHome(profile.role))
}
