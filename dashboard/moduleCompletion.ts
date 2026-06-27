// dashboard/moduleCompletion.ts
// Data layer for the staff "Education" center: who has completed each published
// learning module, and whether faculty has attested. Mirrors dashboard/queries.ts
// conventions — one fetch per table through the authenticated server client (RLS
// gives staff the cross-program view via the is_staff() branch in each SELECT
// policy), then aggregate in TypeScript. Scale is ~3 fellows; no pagination.
//
// Profiles are fetched in full (not just fellows) so we can resolve the name of
// the attesting faculty member — who may hold any staff role, not only a fellow.
// De-identified educational records only. NO PHI.
import { createClient } from '@/lib/supabase/server'

export type ModuleFellowStatus = {
  fellowId: string
  fellowName: string
  pgyLevel: 'PGY-4' | 'PGY-5' | null
  completedAt: string | null
  quizScore: number | null
  quizTotal: number | null
  attestedAt: string | null
  attestedByName: string | null
  attestationNote: string | null
}

export type ModuleCompletion = {
  id: string
  key: string
  title: string
  requiresAttestation: boolean
  passPct: number
  completedCount: number
  attestedCount: number
  totalFellows: number
  fellows: ModuleFellowStatus[]
}

export type ModuleCompletionOverview = {
  modules: ModuleCompletion[]
  totalFellows: number
}

export async function getModuleCompletion(): Promise<ModuleCompletionOverview> {
  const supabase = await createClient()

  const [profilesRes, modulesRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role, pgy_level, is_active'),
    supabase
      .from('modules')
      .select('id, key, title, requires_attestation, pass_pct')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('module_progress')
      .select(
        'module_id, fellow_id, completed_at, quiz_score, quiz_total, attested_at, attested_by, attestation_note',
      ),
  ])

  const firstError = profilesRes.error || modulesRes.error || progressRes.error
  if (firstError) {
    throw new Error(`Could not load module completion: ${firstError.message}`)
  }

  const profiles = profilesRes.data ?? []
  const modules = modulesRes.data ?? []
  const progress = progressRes.data ?? []

  // Name lookup for the attesting faculty (any staff role), not just fellows.
  const nameById = new Map<string, string>(profiles.map((p) => [p.id, p.full_name]))

  // Active fellows, ordered by PGY then name (matches the prior query ordering).
  const fellows = profiles
    .filter((p) => p.role === 'fellow' && p.is_active)
    .sort(
      (a, b) =>
        (a.pgy_level ?? '').localeCompare(b.pgy_level ?? '') ||
        a.full_name.localeCompare(b.full_name),
    )

  const modulesOut: ModuleCompletion[] = modules.map((m) => {
    const rows = progress.filter((p) => p.module_id === m.id)
    const byFellow = new Map<string, (typeof rows)[number]>(rows.map((r) => [r.fellow_id, r]))

    const fellowStatuses: ModuleFellowStatus[] = fellows.map((f) => {
      const r = byFellow.get(f.id)
      return {
        fellowId: f.id,
        fellowName: f.full_name,
        pgyLevel: f.pgy_level,
        completedAt: r?.completed_at ?? null,
        quizScore: r?.quiz_score ?? null,
        quizTotal: r?.quiz_total ?? null,
        attestedAt: r?.attested_at ?? null,
        attestedByName: r?.attested_by ? nameById.get(r.attested_by) ?? null : null,
        attestationNote: r?.attestation_note ?? null,
      }
    })

    return {
      id: m.id,
      key: m.key,
      title: m.title,
      requiresAttestation: m.requires_attestation,
      passPct: m.pass_pct,
      completedCount: fellowStatuses.filter((s) => s.completedAt).length,
      attestedCount: fellowStatuses.filter((s) => s.attestedAt).length,
      totalFellows: fellows.length,
      fellows: fellowStatuses,
    }
  })

  return { modules: modulesOut, totalFellows: fellows.length }
}
