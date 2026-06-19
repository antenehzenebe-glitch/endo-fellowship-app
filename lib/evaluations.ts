// lib/evaluations.ts
// Shared types + helpers for the fellow evaluation feature.
// De-identified educational records only — NO PHI.
import type { Database } from '@/lib/supabase/database.types'

export type EvalPeriod = Database['public']['Enums']['eval_period'] // 'mid_year' | 'end_of_year'
export type EvalRating = 'below' | 'at' | 'above'
export type EvalStatus = 'draft' | 'final'

export type FellowEvaluation = Database['public']['Tables']['fellow_evaluations']['Row']

// A row enriched with display names for fellow + evaluator.
export type EvalRow = FellowEvaluation & {
  fellowName: string
  evaluatorName: string
}

export const PERIODS: { value: EvalPeriod; label: string }[] = [
  { value: 'mid_year', label: 'Mid-year' },
  { value: 'end_of_year', label: 'End-of-year' },
]

export const RATINGS: { value: EvalRating; label: string; tone: string }[] = [
  { value: 'below', label: 'Below level', tone: '#b45309' }, // amber-700
  { value: 'at', label: 'At level', tone: '#15803d' }, // green-700
  { value: 'above', label: 'Above level', tone: '#003a63' }, // Howard navy
]

export function periodLabel(p: string): string {
  return PERIODS.find((x) => x.value === p)?.label ?? p
}
export function ratingLabel(r: string): string {
  return RATINGS.find((x) => x.value === r)?.label ?? r
}
export function ratingTone(r: string): string {
  return RATINGS.find((x) => x.value === r)?.tone ?? '#475569'
}

// Current academic year as "YYYY-YYYY" (July–June). June 2026 -> "2025-2026".
export function currentAcademicYear(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = d.getMonth() // 0 = Jan
  return m >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

// Roles permitted to AUTHOR evaluations (mirror of DB can_author_eval()).
export function canAuthorEval(role: string): boolean {
  return ['attending', 'pd', 'apd', 'admin'].includes(role)
}

// 'pgy_4' -> 'PGY-4'
export function formatPgy(p?: string | null): string {
  return p ? p.replace(/_/g, '-').toUpperCase() : ''
}
