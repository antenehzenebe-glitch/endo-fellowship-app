import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import ScheduleBanner, { type LatestPublish } from '@/components/ScheduleBanner'

export const metadata: Metadata = {
  title: 'Howard Endo Fellowship',
  description:
    'Internal program tool for the Howard University Hospital Endocrinology, Diabetes & Metabolism fellowship: evaluations, progress tracking, and program materials.',
}

// Most-recent schedule publish across all years and both views (block grid +
// monthly calendar), for the app-wide banner. Returns null for signed-out
// requests (no banner on login/onboarding) or when nothing has been published.
// Read-only; relies on middleware to keep the session fresh.
async function getLatestPublish(): Promise<LatestPublish> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: rows } = await supabase
    .from('program_schedule')
    .select('academic_year, blocks_published_at, months_published_at')
  if (!rows) return null

  let best: LatestPublish = null
  for (const r of rows) {
    const candidates: Array<{ scope: 'blocks' | 'months'; at: string | null }> = [
      { scope: 'blocks', at: r.blocks_published_at },
      { scope: 'months', at: r.months_published_at },
    ]
    for (const c of candidates) {
      // ISO 8601 UTC strings from the same column sort chronologically as text.
      if (c.at && (!best || c.at > best.publishedAt)) {
        best = { academicYear: r.academic_year, scope: c.scope, publishedAt: c.at }
      }
    }
  }
  return best
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const latest = await getLatestPublish()
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <ScheduleBanner latest={latest} />
        {children}
      </body>
    </html>
  )
}
