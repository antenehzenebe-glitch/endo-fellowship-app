// app/modules/[key]/page.tsx
// One educational module: lecture slides + procedure videos + a self-check.
// Generic over the module `key`; renders the module-specific quiz when one exists.
// Private media (videos in the 'program-videos' bucket, slides in 'resources')
// are served via short-lived signed URLs. De-identified educational content - NO PHI.
import Link from 'next/link'
import { requireProfile, roleHome } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import ThyroidQuiz from '@/modules/ThyroidQuiz'

export const dynamic = 'force-dynamic'

const VIDEO_URL_TTL = 3600 // 1h - comfortable for a viewing session
const LECTURE_URL_TTL = 600 // 10m - matches the resources page

export default async function ModulePage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: mod } = await supabase
    .from('modules')
    .select('*')
    .eq('key', key)
    .eq('is_active', true)
    .maybeSingle()

  if (!mod) {
    return <NotPublished home={roleHome(profile.role)} />
  }

  // Procedure videos for this module
  const { data: videoRows } = await supabase
    .from('program_videos')
    .select('*')
    .eq('module_id', mod.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  const videos = videoRows ?? []

  // Lecture (a resources row), if linked
  let lecture: { title: string; url: string | null } | null = null
  if (mod.lecture_resource_id) {
    const { data: res } = await supabase
      .from('resources')
      .select('title, storage_path, external_url')
      .eq('id', mod.lecture_resource_id)
      .maybeSingle()
    if (res) {
      let url: string | null = res.external_url ?? null
      if (res.storage_path) {
        const { data: signed } = await supabase.storage
          .from('resources')
          .createSignedUrl(res.storage_path, LECTURE_URL_TTL)
        url = signed?.signedUrl ?? url
      }
      lecture = { title: res.title, url }
    }
  }

  // Signed URLs for video + poster storage paths (private bucket)
  const videoPaths = videos.map((v) => v.storage_path).filter((p): p is string => Boolean(p))
  const posterPaths = videos.map((v) => v.poster_path).filter((p): p is string => Boolean(p))
  const signedByPath = new Map<string, string>()
  if (videoPaths.length) {
    const { data: s } = await supabase.storage
      .from('program-videos')
      .createSignedUrls(videoPaths, VIDEO_URL_TTL)
    s?.forEach((x) => {
      if (x.path && x.signedUrl) signedByPath.set(x.path, x.signedUrl)
    })
  }
  if (posterPaths.length) {
    const { data: s } = await supabase.storage
      .from('program-videos')
      .createSignedUrls(posterPaths, VIDEO_URL_TTL)
    s?.forEach((x) => {
      if (x.path && x.signedUrl) signedByPath.set(x.path, x.signedUrl)
    })
  }

  // The signed-in fellow's progress on this module
  const { data: progress } = await supabase
    .from('module_progress')
    .select('completed_at, quiz_score, quiz_total, attested_at')
    .eq('module_id', mod.id)
    .eq('fellow_id', profile.id)
    .maybeSingle()

  const canRecord = profile.role === 'fellow'
  const hasScore =
    typeof progress?.quiz_score === 'number' && typeof progress?.quiz_total === 'number'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5"
              />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight truncate">{mod.title}</h1>
                <p className="text-sm text-white/70 truncate">
                  {profile.full_name} &middot; {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-none">
              <Link
                href={roleHome(profile.role)}
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                Home
              </Link>
              <SignOutButton variant="onDark" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {mod.subtitle && <p className="text-[#5C6B7A] -mt-1">{mod.subtitle}</p>}

        {progress?.completed_at && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              &#10003; Self-check completed{hasScore ? ` \u2014 ${progress.quiz_score}/${progress.quiz_total}` : ''}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {new Date(progress.completed_at).toLocaleDateString()}
              {progress.attested_at ? ' \u00b7 faculty attested' : ''}
            </p>
          </div>
        )}

        {mod.description && (
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[15px] leading-relaxed text-[#1B2733] whitespace-pre-line">
              {mod.description}
            </p>
          </section>
        )}

        {lecture && (
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">Lecture</span>
            <h2 className="mt-1 font-bold text-[#003a63] leading-snug">{lecture.title}</h2>
            {lecture.url ? (
              <a
                href={lecture.url}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#003a63] text-white hover:bg-[#04263f] min-h-[44px]"
              >
                Open slides
              </a>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Slides will be available shortly.</p>
            )}
          </section>
        )}

        {videos.length > 0 && (
          <section className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">
              Procedure videos
            </span>
            {videos.map((v) => {
              const src = v.storage_path ? signedByPath.get(v.storage_path) : v.external_url ?? undefined
              const poster = v.poster_path ? signedByPath.get(v.poster_path) : undefined
              return (
                <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-[#003a63] leading-snug">{v.title}</h3>
                  {v.description && <p className="mt-1 text-sm text-[#5C6B7A]">{v.description}</p>}
                  {src ? (
                    <video
                      controls
                      preload="metadata"
                      poster={poster}
                      className="w-full rounded-lg mt-3 bg-black"
                    >
                      <source src={src} />
                      Your browser does not support embedded video.
                    </video>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">Video will be available shortly.</p>
                  )}
                </div>
              )
            })}
          </section>
        )}

        {key === 'thyroid_us' && (
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">Self-check</span>
            <h2 className="mt-1 font-bold text-[#003a63] leading-snug">
              Check your readiness &middot; {mod.pass_pct ?? 80}% to pass
            </h2>
            <p className="mt-1 mb-4 text-sm text-[#5C6B7A]">
              A short formative self-check. Not a graded ACGME assessment.
            </p>
            <ThyroidQuiz
              moduleId={mod.id}
              moduleKey={mod.key}
              passPct={mod.pass_pct ?? 80}
              canRecord={canRecord}
            />
          </section>
        )}
      </main>
    </div>
  )
}

function NotPublished({ home }: { home: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5" />
              <h1 className="text-xl font-bold">Module</h1>
            </div>
            <SignOutButton variant="onDark" />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10 sm:px-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#c8102e]">Not available</span>
          <h2 className="mt-1 font-bold text-[#003a63] text-lg">This module is not published yet</h2>
          <p className="mt-2 text-sm text-gray-600">It will appear here once the program adds it.</p>
          <Link
            href={home}
            className="mt-5 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#003a63] text-white hover:bg-[#04263f] min-h-[44px]"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
