// dashboard/addendumActions.ts
// Server actions for the foot-of-summary faculty note. Singleton per fellow:
// saveFellowAddendum upserts on fellow_id (overwrite), stamping author_id +
// updated_at on every save; clearFellowAddendum removes it. Authorization is
// enforced by RLS — both operations require can_author_eval() (pd / apd /
// admin) — so this never trusts the client. Errors are returned as friendly
// strings for the caller to surface; nothing sensitive is logged.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SaveAddendumResult = { ok: true } | { ok: false; error: string }

export async function saveFellowAddendum(input: {
  fellowId: string
  body: string
}): Promise<SaveAddendumResult> {
  const body = input.body.trim()
  if (!body) return { ok: false, error: 'The note is empty.' }
  if (!input.fellowId) return { ok: false, error: 'Missing the fellow.' }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return { ok: false, error: 'Your session expired — please sign in again.' }

  const { error } = await supabase.from('fellow_addenda').upsert(
    {
      fellow_id: input.fellowId,
      body,
      author_id: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'fellow_id' },
  )

  if (error) {
    return {
      ok: false,
      error: 'Could not save the note. You may not have permission, or the connection dropped.',
    }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function clearFellowAddendum(input: {
  fellowId: string
}): Promise<SaveAddendumResult> {
  if (!input.fellowId) return { ok: false, error: 'Missing the fellow.' }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: false, error: 'Your session expired — please sign in again.' }

  const { error } = await supabase.from('fellow_addenda').delete().eq('fellow_id', input.fellowId)
  if (error) {
    return { ok: false, error: 'Could not remove the note. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
