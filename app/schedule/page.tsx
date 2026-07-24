'use client'

// app/schedule/page.tsx
// Program schedule route: reads the requested academic year's program_schedule
// row (?ay=), then renders either the staff editor (staff only) or the read-only
// view (fellows & attendings). Staff-only because the schedule embeds fellows'
// names — attendings and fellows still see it (it's their program), but only
// staff can edit. Multi-year (Phase 6b): YearSwitcher drives which row loads;
// the editor/view remount per year via key={academicYear}. NO PHI.
import { requireProfile, isStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ScheduleEditor from './ScheduleEditor'
import ScheduleView from './ScheduleView'
import YearSwitcher from './YearSwitcher'
import PublishControls from './PublishControls'
import {
  asConfig,
  blockForDate,
  emptyConfig,
  type SchedulePayload,
} from '@/lib/schedule'
import { todayET } from '@/lib/dates'
import { NEW_INNOVATIONS_URL } from '@/lib/links'

export const dynamic = 'force-dynamic'

type YearRow = {
  academic_year: string
  is_current: boolean
  config: unknown
  updated_at: string | null
  blocks_published_at: string | null
  blocks_published_by: string | null
  months_published_at: string | null
  months_published_by: string | null
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>
}) {
  const profile = await requireProfile()
  const staff = isStaff(profile.role)
  const { ay } = await searchParams

  const supabase = await createClient()

  // Load every year's metadata (for the switcher) — config is fetched for all rows
  // but only the selected year's config is used.
  const { data: rows, error } = await supabase
    .from('program_schedule')
    .select(
      'academic_year, is_current, config, updated_at, blocks_published_at, blocks_published_by, months_published_at, months_published_by'
    )
    .order('academic_year', { ascending: false })
    .returns<YearRow[]>()

  const loadError = Boolean(error)
  const all = rows ?? []

  // Resolve the selected year: ?ay= → current → newest.
  const selected =
    all.find((r) => r.academic_year === ay) ??
    all.find((r) => r.is_current) ??
    all[0] ??
    null

  const academicYear = selected?.academic_year ?? ''
  const payload: SchedulePayload = selected
    ? { academic_year: academicYear, config: asConfig(selected.config) }
    : { academic_year: academicYear, config: emptyConfig() }

  // Who published (display names) for the publish status line.
  const publisherIds = [
    selected?.blocks_published_by,
    selected?.months_published_by,
  ].filter((v): v is string => Boolean(v))
  const publisherNames = new Map<string, string>()
  if (publisherIds.length > 0) {
    const { data: pubs } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', [...new Set(publisherIds)])
    for (const p of pubs ?? []) publisherNames.set(p.id, p.full_name)
  }

  const today = todayET()
  const currentBlockId = blockForDate(payload.config.blocks, today)?.id ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="" className="w-10 h-10 shrink-0 object-contain" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
                Program Schedule
              </h1>
              <p className="text-sm text-gray-500 truncate">
                {profile.full_name} · {profile.role.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {staff && (
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {!staff && (
              <Link
                href="/log"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Logger
              </Link>
            )}
            <a
              href={NEW_INNOVATIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="New Innovations (opens in a new tab)"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              New Innovations
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <Link
              href={`/schedule/print?ay=${encodeURIComponent(academicYear)}`}
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Print / PDF
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {loadError ? (
          <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            We couldn’t load the schedule right now. Please refresh; if it keeps
            happening, your session may have expired — sign out and back in.
          </div>
        ) : (
          <>
            <YearSwitcher
              years={all.map((r) => ({ academic_year: r.academic_year, is_current: r.is_current }))}
              selected={academicYear}
              canCreate={true}
              canSetCurrent={staff}
            />
            {staff && selected && (
              <PublishControls
                academicYear={academicYear}
                blocks={{
                  publishedAt: selected.blocks_published_at,
                  publishedByName: selected.blocks_published_by
                    ? publisherNames.get(selected.blocks_published_by) ?? null
                    : null,
                }}
                months={{
                  publishedAt: selected.months_published_at,
                  publishedByName: selected.months_published_by
                    ? publisherNames.get(selected.months_published_by) ?? null
                    : null,
                }}
              />
            )}
            {staff ? (
              <ScheduleEditor key={academicYear} initial={payload} />
            ) : (
              <ScheduleView
                key={academicYear}
                config={payload.config}
                academicYear={academicYear}
                today={today}
                currentBlockId={currentBlockId}
                updatedAt={selected?.updated_at ?? null}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
