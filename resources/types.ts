// resources/types.ts
// Material catalog row + the friendly category labels used in the UI.
import type { Database } from '@/lib/supabase/database.types'

export type Resource = Database['public']['Tables']['resources']['Row']
export type ResourceCategory = Database['public']['Enums']['resource_category']

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  policy: 'Policy',
  curriculum: 'Curriculum',
  didactic: 'Didactic',
  onboarding: 'Onboarding',
  board_prep: 'Board prep',
  form: 'Form',
  other: 'Other',
}

export const CATEGORY_OPTIONS: { value: ResourceCategory; label: string }[] = (
  Object.keys(CATEGORY_LABELS) as ResourceCategory[]
).map((value) => ({ value, label: CATEGORY_LABELS[value] }))
