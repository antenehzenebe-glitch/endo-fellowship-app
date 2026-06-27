// modules/actions.ts
// Server actions for the educational module system (lecture + procedure videos + self-check).
//
// Data model (migration 0015_module_system):
//   modules          - one row per module, keyed by `key` (e.g. 'thyroid_us').
//   program_videos   - procedure clips attached to a module (private bucket: program-videos).
//   module_progress  - one row per (module, fellow); records the self-check result and,
//                      separately, faculty attestation (attested_by / attested_at).
//
// Completion model:
//   - A FELLOW records their own completion by passing the in-app self-check. The action
//     upserts module_progress for (module_id, auth.uid()) with the score. Fellows may
//     retake; the row updates in place (UNIQUE module_id, fellow_id).
//   - Faculty ATTESTATION is a separate, staff-only action that stamps attested_by/at.
//     Fellows can never self-attest (enforced by RLS with_check, re-checked here).
//
// RLS (module_progress): select = own OR is_staff(); insert/update = own-and-unattested
//   OR is_staff(); delete = is_staff(). These actions add role checks on top (defence in depth).
//
// De-identified EDUCATIONAL data only - NO PHI. No service-role key, no raw SQL.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { ok: true } | { ok: false; error: string }

const STAFF_ROLES = ['pd', 'apd', 'coordinator', 'admin']

type Me = { userId: string; role: string }

async function getMe(): Promise<Me | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  return { userId: user.id, role: profile?.role ?? '' }
}

// Record (or update) the signed-in user's completion of a module by passing its
// self-check. Re-takeable: the (module_id, fellow_id) row is upserted in place.
// `moduleKey` is used only to revalidate the module's page after the write.
export async function completeModule(
  moduleId: string,
  moduleKey: string,
  score: number,
  total: number
): Promise<ActionResult> {
  const me = await getMe()
  if (!me) return { ok: false, error: 'Your session has expired. Please sign in again.' }

  if (!moduleId || typeof moduleId !== 'string') {
    return { ok: false, error: 'Missing module reference.' }
  }
  if (
    !Number.isInteger(score) ||
    !Number.isInteger(total) ||
    total <= 0 ||
    score < 0 ||
    score > total
  ) {
    return { ok: false, error: 'Invalid score.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('module_progress').upsert(
    {
      module_id: moduleId,
      fellow_id: me.userId,
      quiz_score: score,
      quiz_total: total,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'module_id,fellow_id' }
  )

  if (error) {
    // A fellow retaking after faculty has already attested will be blocked by RLS
    // (the row is locked once attested) - their attested completion still stands.
    return { ok: false, error: `Could not save your completion: ${error.message}` }
  }

  if (moduleKey) revalidatePath(`/modules/${moduleKey}`)
  revalidatePath('/log')
  revalidatePath('/dashboard')
  return { ok: true }
}

// Faculty attestation (staff only): stamp that a named fellow has completed the module.
// Does not alter the fellow's score. Requires an existing progress row.
export async function attestModule(
  moduleId: string,
  fellowId: string
): Promise<ActionResult> {
  const me = await getMe()
  if (!me) return { ok: false, error: 'Your session has expired. Please sign in again.' }
  if (!STAFF_ROLES.includes(me.role)) {
    return { ok: false, error: 'Only program staff can attest completions.' }
  }
  if (!moduleId || !fellowId) {
    return { ok: false, error: 'Missing module or fellow reference.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('module_progress')
    .update({ attested_by: me.userId, attested_at: new Date().toISOString() })
    .eq('module_id', moduleId)
    .eq('fellow_id', fellowId)
    .select('id')

  if (error) return { ok: false, error: `Could not attest: ${error.message}` }
  if (!data || data.length === 0) {
    return { ok: false, error: 'No completion on record for that fellow yet.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/modules')
  return { ok: true }
}
