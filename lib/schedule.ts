// lib/schedule.ts
// Shared types + helpers for the program schedule (the DB-backed, staff-editable
// educational calendar). The single source of truth is the program_schedule row
// (id = 'current'); its `config` JSONB matches the shape below EXACTLY, so the
// migration seed and a Save from the editor are interchangeable.
//
// This models the program's two paper artifacts faithfully:
//   1. the annual BLOCK GRID  — attending-of-the-month + each fellow's rotation
//      per month (free text, because real cells read e.g. "Vacation (19-30)").
//   2. the monthly DIDACTIC CALENDAR — recurring weekly skeleton + dated sessions
//      (Grand Rounds, CCC Meeting, Graduation, …) + the coverage footer.
//
// De-identified PROGRAM data only (rotation names, dates, times). NO PHI. This is
// an educational schedule — NOT a duty-hours tracker and NOT vacation approval;
// vacation shown here is a faithful display of the paper sheet, nothing more.
//
// Convention: `type` aliases, never `interface`, for anything that travels
// through the Supabase typed client (interfaces don't satisfy the JSON Record
// constraint and silently degrade the typed client to `never`).

export type WeeklyKind =
  | 'clinic'
  | 'didactic'
  | 'training'
  | 'lecture'
  | 'meeting'
  | 'other'

// --- recurring weekly skeleton (the grey header rows on the monthly sheet) ---
export type ScheduleWeekly = {
  id: string
  activity: string
  days: string[] // subset of ['Mon','Tue','Wed','Thu','Fri']
  start: string // 'HH:MM'
  end: string // 'HH:MM'
  kind: WeeklyKind
  note?: string
}

// --- annual block grid ---
export type ScheduleFellow = {
  id: string
  name: string
  pgy: string
}

export type ScheduleBlock = {
  id: string
  label: string // month name, e.g. 'July'
  start: string // 'YYYY-MM-DD'
  end: string // 'YYYY-MM-DD'
  attending: string // attending-of-the-month (free text, '' allowed)
  assignments: Record<string, string> // fellowId -> rotation/vacation (free text)
}

// --- monthly didactic calendar + coverage ---
export type CalendarSession = {
  id: string
  date: string // 'YYYY-MM-DD'
  title: string
  badge?: string // optional short tag/emoji, e.g. '🎓'
}

export type WeekendCoverage = {
  id: string
  who: string
  dates: string // free text, e.g. 'June 13-14, 27-28'
}

export type MonthCoverage = {
  consultAttending: string
  consultFellows: string
  weekend: WeekendCoverage[]
  procedureFellow: string
}

export type ScheduleMonth = {
  id: string
  ym: string // 'YYYY-MM'
  label: string // 'June 2026'
  subtitle?: string // e.g. 'Images, Genetics and Transplant Medicine'
  sessions: CalendarSession[]
  coverage: MonthCoverage
}

export type ScheduleConfig = {
  version: number
  weekly: ScheduleWeekly[]
  rotations: string[] // suggestion vocabulary for block cells (datalist)
  fellows: ScheduleFellow[]
  blocks: ScheduleBlock[]
  months: ScheduleMonth[]
}

// What the editor saves and the page reads: the JSONB config + its sibling column.
export type SchedulePayload = {
  academic_year: string
  config: ScheduleConfig
}

export const WEEKLY_KINDS: WeeklyKind[] = [
  'clinic',
  'didactic',
  'training',
  'lecture',
  'meeting',
  'other',
]

export const KIND_COLOR: Record<WeeklyKind, string> = {
  clinic: '#0369a1',
  didactic: '#003a63',
  training: '#047857',
  lecture: '#c8102e',
  meeting: '#7c3aed',
  other: '#475569',
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function emptyCoverage(): MonthCoverage {
  return { consultAttending: '', consultFellows: '', weekend: [], procedureFellow: '' }
}

// Fallback when the row is somehow empty.
export const EMPTY_CONFIG: ScheduleConfig = {
  version: 2,
  weekly: [],
  rotations: [],
  fellows: [],
  blocks: [],
  months: [],
}

// ---- helpers ----

// The block whose [start,end] range contains ymd ('YYYY-MM-DD'), or null. String
// comparison is valid because the dates are zero-padded ISO. Ends are inclusive.
export function blockForDate(
  blocks: ScheduleBlock[],
  ymd: string
): ScheduleBlock | null {
  for (const b of blocks) {
    if (b.start && b.end && b.start <= ymd && ymd <= b.end) return b
  }
  return null
}

// Format a 'YYYY-MM' as a human label, e.g. '2026-06' -> 'June 2026'.
export function ymToLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ym
  const name = new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  })
  return `${name} ${y}`
}

// Pick the month to show by default: exact match for today's 'YYYY-MM', else the
// nearest upcoming month, else the most recent past month, else null.
export function pickMonth(
  months: ScheduleMonth[],
  ymd: string
): ScheduleMonth | null {
  if (months.length === 0) return null
  const cur = ymd.slice(0, 7)
  const exact = months.find((mo) => mo.ym === cur)
  if (exact) return exact
  const sorted = [...months].sort((a, b) => a.ym.localeCompare(b.ym))
  const upcoming = sorted.find((mo) => mo.ym >= cur)
  if (upcoming) return upcoming
  return sorted[sorted.length - 1]
}

// Mon–Fri week rows for a month grid (weekends omitted, like the paper sheet).
// Empty column positions are returned as { day: 0, ymd: '' } so callers can keep
// the Mon–Fri column alignment.
export function monthGridWeeks(ym: string): { day: number; ymd: string }[][] {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return []
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const blank = (): ({ day: number; ymd: string } | null)[] => [null, null, null, null, null]
  const weeks: ({ day: number; ymd: string } | null)[][] = []
  let week = blank()
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 Sun .. 6 Sat
    if (dow === 0 || dow === 6) continue
    const col = dow - 1 // Mon=0 .. Fri=4
    if (col === 0 && week.some((c) => c)) {
      weeks.push(week)
      week = blank()
    }
    const mm = String(m).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    week[col] = { day: d, ymd: `${y}-${mm}-${dd}` }
    if (col === 4) {
      weeks.push(week)
      week = blank()
    }
  }
  if (week.some((c) => c)) weeks.push(week)
  return weeks.map((w) => w.map((c) => c ?? { day: 0, ymd: '' }))
}

// Coerce the DB `config` (typed as Json) into a fully-formed ScheduleConfig with
// safe defaults, so a malformed/partial/older row never crashes the page.
export function asConfig(raw: unknown): ScheduleConfig {
  const c = (raw ?? {}) as Partial<ScheduleConfig>
  const blocks: ScheduleBlock[] = Array.isArray(c.blocks)
    ? c.blocks.map((b) => ({
        id: String(b?.id ?? ''),
        label: String(b?.label ?? ''),
        start: String(b?.start ?? ''),
        end: String(b?.end ?? ''),
        attending: String((b as ScheduleBlock)?.attending ?? ''),
        assignments:
          b?.assignments && typeof b.assignments === 'object'
            ? (b.assignments as Record<string, string>)
            : {},
      }))
    : []
  const months: ScheduleMonth[] = Array.isArray(c.months)
    ? c.months.map((mo) => ({
        id: String(mo?.id ?? ''),
        ym: String(mo?.ym ?? ''),
        label: String(mo?.label ?? ''),
        subtitle: mo?.subtitle ? String(mo.subtitle) : undefined,
        sessions: Array.isArray(mo?.sessions)
          ? mo.sessions.map((s) => ({
              id: String(s?.id ?? ''),
              date: String(s?.date ?? ''),
              title: String(s?.title ?? ''),
              badge: s?.badge ? String(s.badge) : undefined,
            }))
          : [],
        coverage: {
          consultAttending: String(mo?.coverage?.consultAttending ?? ''),
          consultFellows: String(mo?.coverage?.consultFellows ?? ''),
          weekend: Array.isArray(mo?.coverage?.weekend)
            ? mo.coverage.weekend.map((w) => ({
                id: String(w?.id ?? ''),
                who: String(w?.who ?? ''),
                dates: String(w?.dates ?? ''),
              }))
            : [],
          procedureFellow: String(mo?.coverage?.procedureFellow ?? ''),
        },
      }))
    : []
  return {
    version: typeof c.version === 'number' ? c.version : 2,
    weekly: Array.isArray(c.weekly) ? c.weekly : [],
    rotations: Array.isArray(c.rotations) ? c.rotations : [],
    fellows: Array.isArray(c.fellows) ? c.fellows : [],
    blocks,
    months,
  }
}