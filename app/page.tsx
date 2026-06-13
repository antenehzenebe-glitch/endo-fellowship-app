// app/page.tsx
// Public front door for the program.
//  • Signed-in users are sent to their hub (staff -> /dashboard, fellow -> /log).
//  • Everyone else sees the recruiting landing page.
//
// NOTE: this assumes lib/auth.ts exports `getProfile()` returning the user's
// profile (or null when not signed in). If your helper differs, adjust the import.
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import Landing from '@/components/Landing';

export const dynamic = 'force-dynamic';

const STAFF_ROLES = ['pd', 'apd', 'coordinator', 'admin'];

export default async function Home() {
  let profile: { role?: string } | null = null;
  try {
    profile = await getProfile();
  } catch {
    profile = null;
  }

  if (profile?.role) {
    redirect(STAFF_ROLES.includes(profile.role) ? '/dashboard' : '/log');
  }

  return <Landing />;
}
