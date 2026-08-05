// lib/endocrine-emergencies/types.ts
// Fellows' Survival Guide — shared types + category metadata.
// EDUCATIONAL QUICK-REFERENCE ONLY. No PHI. This is teaching content for the
// fellowship, not a clinical decision tool: it does not replace attending
// judgment or your institution's protocols, and every drug/dose must be
// verified against current local guidelines before use.
//
// Content is plain data so it renders identically on phone and desktop and is
// trivial for faculty to edit. `type` aliases (not interfaces) per CLAUDE.md.

export type EmergencyCategory =
  | 'glucose'
  | 'inpatient'
  | 'adrenal'
  | 'thyroid'
  | 'calcium'
  | 'sodium'
  | 'potassium'
  | 'catecholamine'
  | 'pituitary'

// One authoritative citation backing a topic (guideline, consensus report, or
// landmark review). Rendered as an external link list at the foot of each card.
export type EmergencyReference = {
  label: string // short title, e.g. 'Hyperglycemic Crises in Adults With Diabetes: A Consensus Report'
  source: string // organization, e.g. 'ADA/EASD/JBDS/AACE/DTS'
  year: string // e.g. '2024'
  url: string // verified live link (guideline PDF, PubMed, or journal page)
}

export type Emergency = {
  id: string
  name: string
  category: EmergencyCategory
  summary: string // one-line orientation
  firstActions: string[] // "First 10 minutes" — ordered immediate actions, rendered on top
  features: string[] // clinical features
  diagnosis: string[] // how it's confirmed / key labs
  management: string[] // ordered steps
  followUp: string[] // disposition + after-care
  pearls: string[] // high-yield "don't miss / don't do" points
  tables?: EmergencyTable[] // optional structured tables (severity grids, scoring scales)
  references: EmergencyReference[] // societal/authoritative sources behind the topic
  lastReviewed: string // 'YYYY-MM' — when content was last reconciled with guidelines
}

// Optional structured table for an emergency (e.g. DKA severity grading or the
// Burch–Wartofsky Point Scale). Rendered after the diagnosis section. `type` per CLAUDE.md.
export type EmergencyTable = {
  title: string
  columns: string[]
  rows: string[][]
  note?: string
}

// Category → label + accessible color tokens (color is paired with a text
// label everywhere, never used alone — DESIGN.md / WCAG).
export const EMERGENCY_CATEGORIES: Record<
  EmergencyCategory,
  { label: string; chip: string; bar: string }
> = {
  glucose: { label: 'Glucose', chip: 'bg-amber-100 text-amber-900 border-amber-200', bar: 'bg-amber-500' },
  inpatient: { label: 'Inpatient DM', chip: 'bg-emerald-100 text-emerald-900 border-emerald-200', bar: 'bg-emerald-500' },
  adrenal: { label: 'Adrenal', chip: 'bg-rose-100 text-rose-900 border-rose-200', bar: 'bg-rose-500' },
  thyroid: { label: 'Thyroid', chip: 'bg-violet-100 text-violet-900 border-violet-200', bar: 'bg-violet-500' },
  calcium: { label: 'Calcium', chip: 'bg-teal-100 text-teal-900 border-teal-200', bar: 'bg-teal-500' },
  sodium: { label: 'Sodium', chip: 'bg-sky-100 text-sky-900 border-sky-200', bar: 'bg-sky-500' },
  potassium: { label: 'Potassium', chip: 'bg-indigo-100 text-indigo-900 border-indigo-200', bar: 'bg-indigo-500' },
  catecholamine: { label: 'Catecholamine', chip: 'bg-orange-100 text-orange-900 border-orange-200', bar: 'bg-orange-500' },
  pituitary: { label: 'Pituitary', chip: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200', bar: 'bg-fuchsia-500' },
}
