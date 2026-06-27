// dashboard/fellowAddenda.ts
// Faculty notes shown at the foot of the Evaluation Summary (staff dashboard).
// One lightweight, free-text note per active fellow — standalone from the
// period-scoped fellow_evaluations narrative. RLS does the gating: read + write
// on fellow_addenda are restricted to can_author_eval() (pd / apd / admin), so
// the addenda fetch comes back empty for anyone else. Never bypass RLS.
//
// Source of truth: public.fellow_addenda (fellow_id UNIQUE — singleton per
// fellow). Author display name is resolved from public.profiles, mirroring the
// name-resolution pattern used by the module-completion query.
import { createClient } from '@/lib/supabase/server'

export type FellowAddendumNote = {
  body: string
  authorName: string | null
  updatedAt: string
} | null

export type FellowAddendumRow = {
  id: string // the fellow's profile id
  name: string
  pgyLevel: 'PGY-4' | 'PGY-5' | null
  note: FellowAddendumNote
}

export type FellowAddendaData = {
  fellows: FellowAddendumRow[]
}

export async function getFellowAddenda(): Promise<FellowAddendaData> {
  const supabase = await createClient()

  const [fellowsRes, addendaRes, profilesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, pgy_level')
      .eq('role', 'fellow')
      .eq('is_active', true)
      .order('pgy_level', { ascending: true })
      .order('full_name', { ascending: true }),
    supabase.from('fellow_addenda').select('fellow_id, body, author_id, updated_at'),
    supabase.from('profiles').select('id, full_name'),
  ])

  const firstError = fellowsRes.error || addendaRes.error || profilesRes.error
  if (firstError) {
    throw new Error(`Could not load faculty notes: ${firstError.message}`)
  }

  const nameById = new Map<string, string>()
  for (const p of profilesRes.data ?? []) nameById.set(p.id, p.full_name)

  const noteByFellow = new Map<
    string,
    { body: string; author_id: string | null; updated_at: string }
  >()
  for (const a of addendaRes.data ?? []) noteByFellow.set(a.fellow_id, a)

  const fellows: FellowAddendumRow[] = (fellowsRes.data ?? []).map((f) => {
    const a = noteByFellow.get(f.id)
    return {
      id: f.id,
      name: f.full_name,
      pgyLevel: f.pgy_level,
      note: a
        ? {
            body: a.body,
            authorName: a.author_id ? nameById.get(a.author_id) ?? null : null,
            updatedAt: a.updated_at,
          }
        : null,
    }
  })

  return { fellows }
}
