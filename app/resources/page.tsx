// app/resources/page.tsx
// Behind-login materials library. Everyone signed in reads active materials;
// staff also get the upload form. Files live in the private 'resources' bucket
// and are served via short-lived signed URLs; external links open directly.
// Meeting minutes (category 'minutes') are presented folder-style, grouped by
// year then month; everything else is grouped under category section headers.
import Link from 'next/link'
import { requireProfile, isStaff, roleHome } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS } from '@/resources/types'
import type { Resource, ResourceCategory } from '@/resources/types'
import UploadForm from '@/resources/UploadForm'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

// URLs are minted at page render, so the TTL must cover the whole page session:
// 1 hour covers a normal session. The deeper fix (sign-on-click, minting a
// fresh URL per click) is ticketed separately.
const SIGNED_URL_TTL = 3600 // seconds

function monthHeading(year: number, month: number): string {
  if (!year || !month) return 'Undated'
  const monthLong = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })
  return `${monthLong} ${year}`
}

function postedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function ResourcesPage() {
  const profile = await requireProfile()
  const staff = isStaff(profile.role)
  // Home link goes where the user actually has a home (/dashboard is staff-only;
  // attendings land on /attending, fellows on /log).
  const homeHref = roleHome(profile.role)
  const homeLabel = staff ? 'Dashboard' : profile.role === 'attending' ? 'Faculty Home' : 'Logger'
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const resources: Resource[] = data ?? []

  const links = new Map<string, string>()
  const paths = resources
    .map((r) => r.storage_path)
    .filter((p): p is string => Boolean(p))
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from('resources')
      .createSignedUrls(paths, SIGNED_URL_TTL)
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) links.set(s.path, s.signedUrl)
    })
  }

  function hrefFor(r: Resource): string | null {
    if (r.storage_path) return links.get(r.storage_path) ?? null
    if (r.external_url) return r.external_url
    return null
  }

  // Minutes are pulled out of the flat list and grouped year → month, both
  // descending. Rows missing a date (legacy/bad data) fall into an "Undated"
  // bucket (year 0) rather than breaking the grouping.
  const minutes = resources.filter((r) => r.category === 'minutes')
  const minutesByYear = new Map<number, Map<number, Resource[]>>()
  for (const m of minutes) {
    const year = m.meeting_year ?? 0
    const month = m.meeting_month ?? 0
    if (!minutesByYear.has(year)) minutesByYear.set(year, new Map())
    const byMonth = minutesByYear.get(year)!
    if (!byMonth.has(month)) byMonth.set(month, [])
    byMonth.get(month)!.push(m)
  }
  const minuteYears = [...minutesByYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, byMonth]) => ({
      year,
      count: [...byMonth.values()].reduce((n, arr) => n + arr.length, 0),
      months: [...byMonth.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, docs]) => ({ month, docs })),
    }))

  // Everything else stays in declaration order from CATEGORY_LABELS (minus
  // 'minutes'), one section per category that actually has materials.
  const otherCategories = (Object.keys(CATEGORY_LABELS) as ResourceCategory[])
    .filter((c) => c !== 'minutes')
    .map((c) => ({ category: c, items: resources.filter((r) => r.category === c) }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white border-b-4 border-crimson">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5"
              />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight truncate">Program Materials</h1>
                <p className="text-sm text-white/70 truncate">
                  {profile.full_name} · {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <nav aria-label="Materials shortcuts" className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
              <Link
                href={homeHref}
                className="inline-flex min-h-[44px] items-center px-3 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                {homeLabel}
              </Link>
              <Link
                href="/account"
                className="inline-flex min-h-[44px] items-center px-3 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Password
              </Link>
              <SignOutButton variant="onDark" />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-8">
        {staff ? <UploadForm /> : null}

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="font-semibold text-red-900 mb-1">Couldn&apos;t load materials</h2>
            <p className="text-sm text-red-700">
              Refresh the page; if it keeps failing, the database connection may be down.
            </p>
          </div>
        ) : (
          <>
            {staff || minutes.length > 0 ? (
              <section aria-labelledby="minutes-heading">
                <h2 id="minutes-heading" className="text-lg font-bold text-primary mb-3">
                  Meeting minutes
                </h2>
                {minuteYears.length === 0 ? (
                  <p className="text-sm text-muted">No meeting minutes posted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {minuteYears.map(({ year, count, months }, yearIdx) => (
                      <details
                        key={year}
                        open={yearIdx === 0}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <summary className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer select-none font-bold text-ink hover:bg-gray-50 min-h-[44px]">
                          <span>{year === 0 ? 'Undated' : year}</span>
                          <span className="text-sm font-medium text-muted">
                            {count} {count === 1 ? 'document' : 'documents'}
                          </span>
                        </summary>
                        <div className="px-4 pb-4 space-y-4">
                          {months.map(({ month, docs }) => (
                            <div key={month}>
                              <h3 className="text-sm font-semibold uppercase tracking-wide text-crimson mt-2 mb-1">
                                {monthHeading(year, month)}
                              </h3>
                              <ul className="divide-y divide-gray-100">
                                {docs.map((r) => {
                                  const href = hrefFor(r)
                                  return (
                                    <li
                                      key={r.id}
                                      className="flex items-center justify-between gap-3 py-2.5"
                                    >
                                      <div className="min-w-0">
                                        <p className="font-medium text-ink truncate">{r.title}</p>
                                        <p className="text-xs text-muted">
                                          Posted {postedDate(r.created_at)}
                                        </p>
                                      </div>
                                      {href ? (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="shrink-0 inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-700 min-h-[44px]"
                                        >
                                          Open
                                        </a>
                                      ) : (
                                        <span className="shrink-0 text-sm text-gray-400">
                                          Link unavailable
                                        </span>
                                      )}
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {resources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-gray-300 bg-white">
                <p className="font-semibold text-gray-800">No materials yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  {staff
                    ? 'Upload your first document above.'
                    : 'Nothing has been posted yet — check back soon.'}
                </p>
              </div>
            ) : (
              otherCategories.map(({ category, items }) => (
                <section key={category} aria-labelledby={`cat-${category}`}>
                  <h2 id={`cat-${category}`} className="text-lg font-bold text-primary mb-3">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => {
                      const href = hrefFor(r)
                      return (
                        <li
                          key={r.id}
                          className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col"
                        >
                          <span className="text-xs font-semibold uppercase tracking-wide text-crimson">
                            {CATEGORY_LABELS[r.category]}
                          </span>
                          <h3 className="mt-1 font-bold text-primary leading-snug">{r.title}</h3>
                          {r.description ? (
                            <p className="mt-1 text-sm text-gray-600 flex-1">{r.description}</p>
                          ) : (
                            <div className="flex-1" />
                          )}
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-700 min-h-[44px]"
                            >
                              Open
                            </a>
                          ) : (
                            <span className="mt-4 text-sm text-gray-400">Link unavailable</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))
            )}
          </>
        )}
      </main>
    </div>
  )
}
