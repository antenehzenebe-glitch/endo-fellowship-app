// people/types.ts
// Curated public directory rows (faculty / fellows / program staff) for the Showcase.
// `type` (not interface) so the shape satisfies Supabase's Record<string, unknown>.
export type PersonCategory = 'faculty' | 'fellow' | 'staff'

export type Person = {
  id: string
  category: PersonCategory
  full_name: string
  credentials: string | null
  role_title: string | null
  bio: string | null
  photo_path: string | null
  email: string | null
  sort_order: number
  is_published: boolean
  profile_id: string | null
  created_at: string
  updated_at: string
}

export const CATEGORY_OPTIONS: { value: PersonCategory; label: string }[] = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'fellow', label: 'Fellow' },
  { value: 'staff', label: 'Program Staff' },
]

export const CATEGORY_LABELS: Record<PersonCategory, string> = {
  faculty: 'Faculty',
  fellow: 'Fellow',
  staff: 'Program Staff',
}

export const PEOPLE_BUCKET = 'people-photos'
