// lib/dates.ts
// Timezone-safe dates for a program that lives in Washington, D.C.
// Server code runs in UTC on most hosts; never derive "today" from
// new Date().toISOString() — it flips to tomorrow at 8pm ET.
export function todayET(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now) // en-CA yields yyyy-mm-dd
}
