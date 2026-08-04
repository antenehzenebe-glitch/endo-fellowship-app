// app/page.tsx
// Public front door. Signed-in users go to their hub; everyone else gets the
// recruiting landing — now rendered from the published public.people directory
// (server-fetched) instead of a hardcoded roster.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { getPublishedPeople, groupDirectory } from '@/lib/people';
import Landing from '@/components/Landing';

export const dynamic = 'force-dynamic';

const STAFF_ROLES = ['pd', 'apd', 'coordinator', 'admin'];

const DESCRIPTION =
  'A two-year, ACGME-accredited Endocrinology, Diabetes & Metabolism fellowship at Howard University Hospital in Washington, D.C. — rigorous clinical training, close mentorship, and scholarship rooted in a legacy of service and health equity. Apply through ERAS.';

export const metadata: Metadata = {
  metadataBase: new URL('https://endo-fellowship-app.netlify.app'),
  title: 'Endocrinology, Diabetes & Metabolism Fellowship | Howard University Hospital',
  description: DESCRIPTION,
  openGraph: {
    title: 'Endocrinology, Diabetes & Metabolism Fellowship | Howard University Hospital',
    description: DESCRIPTION,
    type: 'website',
    images: [
      {
        url: 'https://xousmzkftledlkwtpavb.supabase.co/storage/v1/object/public/landing-images/hero-main.jpg',
        width: 2048,
        height: 1002,
        alt: 'Howard University Hospital — Endocrinology, Diabetes & Metabolism Fellowship',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Endocrinology, Diabetes & Metabolism Fellowship | Howard University Hospital',
    description: DESCRIPTION,
    images: ['https://xousmzkftledlkwtpavb.supabase.co/storage/v1/object/public/landing-images/hero-main.jpg'],
  },
};

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

  // A failed directory query must not look like an empty directory: surface
  // the failure to Landing so it can show a temporary-unavailable notice.
  const result = await getPublishedPeople();
  const groups = groupDirectory(result.ok ? result.people : []);
  return <Landing groups={groups} directoryError={!result.ok} />;
}
