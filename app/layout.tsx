import type { Metadata } from 'next'
import { Playfair_Display, Open_Sans } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import ScheduleBanner, { type LatestPublish } from '@/components/ScheduleBanner'

// Program typefaces, self-hosted by next/font (no render-blocking Google CSS).
// Exposed as CSS variables consumed by the font-display / font-body Tailwind
// tokens (see tailwind.config.ts) — currently used by the public landing.
const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})
const bodyFont = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

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

  const { data: rows, error } = await supabase
    .from('program_schedule')
    .select('academic_year, blocks_published_at, months_published_at')
  // Log, but keep the banner silent on failure — the schedule banner is
  // informational chrome, never worth breaking the page over.
  if (error) console.error('getLatestPublish:', error.message)
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
      <body
        className={`${displayFont.variable} ${bodyFont.variable} bg-white text-gray-900 antialiased`}
      >
        <ScheduleBanner latest={latest} />
        {children}
      </body>
    </html>
  )
}
