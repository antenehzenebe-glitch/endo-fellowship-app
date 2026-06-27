// dashboard/moduleAttest.ts
// Server action: a faculty member attests a fellow's module self-check and,
// optionally, records feedback for the fellow. Staff-only — enforced by the
// module_progress UPDATE policy, whose only branch that may set attested_* is
// is_staff(). The update targets the fellow's existing completion row; if the
// fellow has not completed the self-check there is no row to attest, so the
// row count comes back zero and we surface a friendly message.
// De-identified educational feedback only. NO PHI.
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AttestResult = { ok: true } | { ok: false; error: string }

export async function attestModule(input: {
  moduleId: string
  fellowId: string
  note: string | null
}): Promise<AttestResult> {
  const moduleId = input.moduleId?.trim()
  const fellowId = input.fellowId?.trim()
  if (!moduleId || !fellowId) {
    return { ok: false, error: 'Missing module or fellow.' }
  }

  const note = input.note && input.note.trim() ? input.note.trim() : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'Your session has expired — please sign in again.' }
  }

  const { error, count } = await supabase
    .from('module_progress')
    .update(
      {
        attested_by: user.id,
        attested_at: new Date().toISOString(),
        attestation_note: note,
      },
      { count: 'exact' },
    )
    .eq('module_id', moduleId)
    .eq('fellow_id', fellowId)

  if (error) {
    return { ok: false, error: `Could not save the attestation: ${error.message}` }
  }
  if (!count) {
    return {
      ok: false,
      error:
        'No completed self-check found for this fellow, or you do not have permission to attest.',
    }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
