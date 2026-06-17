// app/resources/page.tsx
// Behind-login materials library. Everyone signed in reads active materials;
// staff also get the upload form. Files live in the private 'resources' bucket and
// are served via short-lived signed URLs; external links open directly.
import Link from 'next/link'
import { requireProfile, isStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS } from '@/resources/types'
import type { Resource } from '@/resources/types'
import UploadForm from '@/resources/UploadForm'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

const SIGNED_URL_TTL = 600 // seconds

export default async function ResourcesPage() {
  const profile = await requireProfile()
  const staff = isStaff(profile.role)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-[#003a63] leading-tight">Program Materials</h1>
                <p className="text-sm text-gray-500">{profile.full_name} · {profile.role.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-[#003a63] hover:underline">Dashboard</Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-8">
        {staff ? <UploadForm /> : null}

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="font-semibold text-red-900 mb-1">Couldn&apos;t load materials</h2>
            <p className="text-sm text-red-700">Refresh the page; if it keeps failing, the database connection may be down.</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-gray-300 bg-white">
            <p className="font-semibold text-gray-800">No materials yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {staff ? 'Upload your first document above.' : 'Nothing has been posted yet — check back soon.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => {
              const href = hrefFor(r)
              return (
                <li key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">{CATEGORY_LABELS[r.category]}</span>
                  <h3 className="mt-1 font-bold text-[#003a63] leading-snug">{r.title}</h3>
                  {r.description ? <p className="mt-1 text-sm text-gray-600 flex-1">{r.description}</p> : <div className="flex-1" />}
                  {href ? (
                    <a href={href} target="_blank" rel="noopener"
                      className="mt-4 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#003a63] text-white hover:bg-[#04263f] min-h-[44px]">
                      Open
                    </a>
                  ) : (
                    <span className="mt-4 text-sm text-gray-400">Link unavailable</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
