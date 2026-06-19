// app/schedule/page.tsx
// Program schedule — DB-backed (program_schedule, id='current') and staff-editable.
// Any signed-in user can VIEW; staff (is_staff) get the editor, everyone else a
// read-only view. "Today" (America/New_York) is computed here on the server and
// passed down so the current block + current month + today's cell are stable
// across hydration.
//
// Educational schedule only — continuity clinic, didactics, training, rotation
// blocks, monthly didactic calendar. Not duty hours, not time-off. NO PHI.
import Link from 'next/link'
import { requireProfile, isStaff, roleHome } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import ScheduleEditor from './ScheduleEditor'
import ScheduleView from './ScheduleView'
import { asConfig, blockForDate, type SchedulePayload } from '@/lib/schedule'

export const dynamic = 'force-dynamic'

// Today's date in America/New_York (Howard / D.C.) as yyyy-mm-dd.
function todayInDC(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()) // en-CA yields yyyy-mm-dd
}

export default async function SchedulePage() {
  const profile = await requireProfile()
  const staff = isStaff(profile.role)
  // Fellows on the Consult rotation maintain the monthly calendar, so they also
  // get the editor — but structure-locked (the action limits them to months).
  const canEditSchedule = staff || profile.role === 'fellow'

  const supabase = await createClient()
  const { data: row } = await supabase
    .from('program_schedule')
    .select('academic_year, config, updated_at')
    .eq('id', 'current')
    .maybeSingle()

  const academicYear = row?.academic_year ?? '2026-2027'
  const config = asConfig(row?.config)
  const updatedAt = row?.updated_at ?? null

  const today = todayInDC()
  const currentBlockId = blockForDate(config.blocks, today)?.id ?? null

  // Back link goes where the user actually has a home (mirrors roleHome):
  // staff → dashboard, attending → faculty home, fellow → logger.
  const homeHref = roleHome(profile.role)
  const homeLabel = staff
    ? 'Dashboard'
    : profile.role === 'attending'
      ? 'Faculty home'
      : 'Logger'

  const initial: SchedulePayload = { academic_year: academicYear, config }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5"
              />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight truncate">Program Schedule</h1>
                <p className="text-sm text-white/70">Rotations, didactics &amp; coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/schedule/print"
                className="px-3 py-2 text-sm font-medium rounded-md bg-[#c8102e] text-white hover:bg-[#a50d26] transition-colors"
              >
                <span aria-hidden="true">🖨</span>
                <span className="hidden sm:inline"> Print / PDF</span>
              </Link>
              <Link
                href={homeHref}
                className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                {homeLabel}
              </Link>
              <SignOutButton variant="onDark" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <p className="sr-only">Signed in as {profile.full_name}</p>
        {canEditSchedule ? (
          <ScheduleEditor initial={initial} />
        ) : (
          <ScheduleView
            config={config}
            academicYear={academicYear}
            today={today}
            currentBlockId={currentBlockId}
            updatedAt={updatedAt}
          />
        )}
      </main>
    </div>
  )
}
