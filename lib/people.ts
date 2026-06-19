// lib/people.ts
// Server-side reader for the public-facing program directory (public.people).
// Returns only published rows, ordered by sort_order, each with a resolved
// public photo URL (or null -> the card shows an initials placeholder).
// Grouping into the three display tiers lives here so the landing stays
// presentational. Models use `type` aliases (never interface) per the typed
// PostgREST client requirement.
import { createClient } from '@/lib/supabase/server'

export type PersonCategory = 'faculty' | 'fellow' | 'staff'

export type DirectoryPerson = {
  id: string
  category: PersonCategory
  fullName: string
  credentials: string | null
  roleTitle: string | null
  isLeadership: boolean
  photoUrl: string | null
}

export type DirectoryGroups = {
  leadership: DirectoryPerson[] // Chief / PD / APD / Coordinator (is_leadership)
  faculty: DirectoryPerson[]    // attendings (faculty, not leadership)
  fellows: DirectoryPerson[]    // current fellows
}

// Local row shape. Declared here (not via the generated Row) so is_leadership —
// added in migration 0014, ahead of the next database.types regeneration — is
// fully typed. `type`, never interface.
type PeopleRow = {
  id: string
  category: string
  full_name: string
  credentials: string | null
  role_title: string | null
  is_leadership: boolean
  photo_path: string | null
}

const PHOTO_BUCKET = 'people-photos'

export async function getPublishedPeople(): Promise<DirectoryPerson[]> {
  const supabase = await createClient()
  // select('*') + returns<>() keeps this compiling even though the generated
  // types predate the is_leadership column; regenerate database.types to tidy.
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .returns<PeopleRow[]>()

  if (error || !data) {
    if (error) console.error('getPublishedPeople:', error.message)
    return []
  }

  return data.map((p) => ({
    id: p.id,
    category: p.category as PersonCategory,
    fullName: p.full_name,
    credentials: p.credentials,
    roleTitle: p.role_title,
    isLeadership: p.is_leadership,
    photoUrl: p.photo_path
      ? supabase.storage.from(PHOTO_BUCKET).getPublicUrl(p.photo_path).data.publicUrl
      : null,
  }))
}

// Split the flat published list into the landing's three display tiers.
export function groupDirectory(people: DirectoryPerson[]): DirectoryGroups {
  return {
    leadership: people.filter((p) => p.isLeadership),
    faculty: people.filter((p) => !p.isLeadership && p.category === 'faculty'),
    fellows: people.filter((p) => p.category === 'fellow'),
  }
}
