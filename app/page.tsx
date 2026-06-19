// app/page.tsx
// Public front door. Signed-in users go to their hub; everyone else gets the
// recruiting landing — now rendered from the published public.people directory
// (server-fetched) instead of a hardcoded roster.
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { getPublishedPeople, groupDirectory } from '@/lib/people';
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

  const groups = groupDirectory(await getPublishedPeople());
  return <Landing groups={groups} />;
}
