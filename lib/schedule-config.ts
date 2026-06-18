// lib/schedule-config.ts
// Rotation / continuity-clinic / coverage REFERENCE for the fellowship.
//
// SCOPE NOTE: This is a read-only reference view — "where am I this block, when is
// my continuity clinic, who's covering consults." It is NOT a duty-hours tracker,
// NOT an ACGME system of record, and NOT a vacation/scheduling tool. Those live in
// the institutional systems (New Innovations, etc.), per CLAUDE.md. Keeping the
// schedule as plain config (not a DB table) keeps it out of the data model and RLS
// surface entirely — edit this file and redeploy to update.
//
// `type` aliases (not interfaces) per CLAUDE.md.

export const ACADEMIC_YEAR = '2026–2027'

/* ----------------------------------------------------------------- types -- */
export type RotationKey =
  | 'consults'
  | 'ambulatory'
  | 'diabetes'
  | 'thyroid'
  | 'bone'
  | 'repro'
  | 'research'
  | 'elective'

export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'

export type Fellow = {
  id: string
  name: string
  pgy: 'PGY-4' | 'PGY-5'
  continuityDay: Weekday // weekly half-day continuity clinic
}

export type Block = {
  id: string
  label: string
  start: string // ISO yyyy-mm-dd (inclusive)
  end: string // ISO yyyy-mm-dd (inclusive)
}

export type Coverage = {
  primary: string // fellow id on the consult service this block
  backup: string // fellow id designated for cross-cover
}

// Rotation metadata. `kind` distinguishes clinical service from protected
// educational time; color is always paired with the text label (never alone).
export const ROTATIONS: Record<
  RotationKey,
  { label: string; short: string; kind: 'clinical' | 'educational'; chip: string }
> = {
  consults: { label: 'Inpatient Endocrine Consults', short: 'Consults', kind: 'clinical', chip: 'bg-rose-100 text-rose-900 border-rose-200' },
  ambulatory: { label: 'Ambulatory Endocrinology', short: 'Ambulatory', kind: 'clinical', chip: 'bg-sky-100 text-sky-900 border-sky-200' },
  diabetes: { label: 'Inpatient Diabetes & Glucose Management', short: 'Diabetes', kind: 'clinical', chip: 'bg-amber-100 text-amber-900 border-amber-200' },
  thyroid: { label: 'Thyroid & Nuclear Medicine', short: 'Thyroid', kind: 'clinical', chip: 'bg-violet-100 text-violet-900 border-violet-200' },
  bone: { label: 'Metabolic Bone & Mineral', short: 'Bone', kind: 'clinical', chip: 'bg-teal-100 text-teal-900 border-teal-200' },
  repro: { label: 'Reproductive Endocrinology', short: 'Repro', kind: 'clinical', chip: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200' },
  research: { label: 'Research & Scholarly', short: 'Research', kind: 'educational', chip: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
  elective: { label: 'Elective', short: 'Elective', kind: 'educational', chip: 'bg-gray-100 text-gray-700 border-gray-200' },
}

/* --------------------------------------------------------------- fellows -- */
// EDIT HERE — roster + each fellow's continuity-clinic weekday.
export const FELLOWS: Fellow[] = [
  { id: 'beg', name: 'Sofia Beg, MD', pgy: 'PGY-5', continuityDay: 'Tuesday' },
  { id: 'khan', name: 'Rumana Khan, MD', pgy: 'PGY-5', continuityDay: 'Wednesday' },
  { id: 'adeleye', name: 'Folake Adeleye, MD', pgy: 'PGY-4', continuityDay: 'Thursday' },
]

/* ---------------------------------------------------------------- blocks -- */
// EDIT HERE — 13 four-week blocks for AY 2026–2027 (Jul 1 2026 → Jun 29 2027).
export const BLOCKS: Block[] = [
  { id: 'b1', label: 'Block 1', start: '2026-07-01', end: '2026-07-28' },
  { id: 'b2', label: 'Block 2', start: '2026-07-29', end: '2026-08-25' },
  { id: 'b3', label: 'Block 3', start: '2026-08-26', end: '2026-09-22' },
  { id: 'b4', label: 'Block 4', start: '2026-09-23', end: '2026-10-20' },
  { id: 'b5', label: 'Block 5', start: '2026-10-21', end: '2026-11-17' },
  { id: 'b6', label: 'Block 6', start: '2026-11-18', end: '2026-12-15' },
  { id: 'b7', label: 'Block 7', start: '2026-12-16', end: '2027-01-12' },
  { id: 'b8', label: 'Block 8', start: '2027-01-13', end: '2027-02-09' },
  { id: 'b9', label: 'Block 9', start: '2027-02-10', end: '2027-03-09' },
  { id: 'b10', label: 'Block 10', start: '2027-03-10', end: '2027-04-06' },
  { id: 'b11', label: 'Block 11', start: '2027-04-07', end: '2027-05-04' },
  { id: 'b12', label: 'Block 12', start: '2027-05-05', end: '2027-06-01' },
  { id: 'b13', label: 'Block 13', start: '2027-06-02', end: '2027-06-29' },
]

/* ------------------------------------------------------ rotation matrix -- */
// EDIT HERE — each fellow's rotation for each block. Keys are fellow id → block
// id → RotationKey. Exactly one fellow should hold 'consults' per block (see
// COVERAGE below, which must stay consistent with this matrix).
export const ASSIGNMENTS: Record<string, Record<string, RotationKey>> = {
  beg: {
    b1: 'consults', b2: 'ambulatory', b3: 'thyroid', b4: 'consults', b5: 'diabetes',
    b6: 'bone', b7: 'consults', b8: 'ambulatory', b9: 'research', b10: 'consults',
    b11: 'repro', b12: 'ambulatory', b13: 'consults',
  },
  khan: {
    b1: 'ambulatory', b2: 'consults', b3: 'diabetes', b4: 'thyroid', b5: 'consults',
    b6: 'ambulatory', b7: 'bone', b8: 'consults', b9: 'ambulatory', b10: 'research',
    b11: 'consults', b12: 'diabetes', b13: 'ambulatory',
  },
  adeleye: {
    b1: 'thyroid', b2: 'diabetes', b3: 'consults', b4: 'ambulatory', b5: 'bone',
    b6: 'consults', b7: 'ambulatory', b8: 'diabetes', b9: 'consults', b10: 'ambulatory',
    b11: 'research', b12: 'consults', b13: 'elective',
  },
}

/* -------------------------------------------------------------- coverage -- */
// EDIT HERE — per block, the consult-service fellow (primary) + designated
// cross-cover (backup). `primary` should match whoever has 'consults' above.
export const COVERAGE: Record<string, Coverage> = {
  b1: { primary: 'beg', backup: 'khan' },
  b2: { primary: 'khan', backup: 'adeleye' },
  b3: { primary: 'adeleye', backup: 'beg' },
  b4: { primary: 'beg', backup: 'khan' },
  b5: { primary: 'khan', backup: 'adeleye' },
  b6: { primary: 'adeleye', backup: 'beg' },
  b7: { primary: 'beg', backup: 'khan' },
  b8: { primary: 'khan', backup: 'adeleye' },
  b9: { primary: 'adeleye', backup: 'beg' },
  b10: { primary: 'beg', backup: 'khan' },
  b11: { primary: 'khan', backup: 'adeleye' },
  b12: { primary: 'adeleye', backup: 'beg' },
  b13: { primary: 'beg', backup: 'khan' },
}

/* ----------------------------------------------------------------- utils -- */
export function fellowById(id: string): Fellow | undefined {
  return FELLOWS.find((f) => f.id === id)
}

// Which block contains a given date (yyyy-mm-dd compared as strings, safe for ISO).
export function blockForDate(isoDate: string): Block | null {
  for (const b of BLOCKS) {
    if (isoDate >= b.start && isoDate <= b.end) return b
  }
  return null
}