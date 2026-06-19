// dashboard/queries.ts
// Data layer for the staff dashboards. Three "centers" (APD readiness,
// PD program oversight, coordinator operations) share this layer.
//
// SCOPE: the formal ACGME milestone evaluation lives in New Innovations — this
// app does not reproduce it, so milestone_assessments is intentionally NOT
// aggregated here. We track procedures, ITE, scholarly activity, the program's
// own evaluations (run/track/complete), onboarding, and materials.
//
// All reads go through the authenticated server client, so Row Level Security
// does the filtering: staff see across the program via the is_staff() branch in
// each table's SELECT policy. Never bypass RLS.
//
// Scale: ~3 fellows, hundreds of lifetime rows. Fetch each table once, aggregate
// in TypeScript — no pagination needed (see CLAUDE.md / ARCHITECTURE.md).
import { createClient } from '@/lib/supabase/server'

export type ReadinessStatus = 'on_track' | 'at_risk' | 'behind'

export type ProcedureProgress = {
  code: string
  label: string
  done: number
  min: number // 0 means "no program minimum set"
}

export type FellowReadiness = {
  id: string
  name: string
  pgyLevel: 'PGY-4' | 'PGY-5' | null
  status: ReadinessStatus
  blockers: string[]
  procedures: ProcedureProgress[]
  proceduresMet: number
  proceduresWithTarget: number
  latestIte: { examYear: number; percentile: number | null } | null
  scholarlyCompleted: number
  scholarlyActive: number
  onboardingDone: number
  onboardingTotal: number
}

export type ReadinessOverview = {
  fellows: FellowReadiness[]
  procedureTypes: ProcedureProgress[] // program template (label + min), done=0
}
// Expected fraction of each cumulative procedure minimum a fellow should have
// reached *by their PGY level* — used only to set readiness status, never the
// progress bars (those always show progress toward the full minimum). Graduating
// fellows are held to the full target; first-years are given the year to reach it.
// Tune freely: e.g. set 'PGY-4' to 0.4 to make first-years start flagging at ~40%.
const EXPECTED_PROCEDURE_FRACTION: Record<'PGY-4' | 'PGY-5', number> = {
  'PGY-4': 0,
  'PGY-5': 1,
}
// Unknown PGY → conservative: hold to the full minimum so gaps aren't hidden.
const DEFAULT_EXPECTED_FRACTION = 1
export async function getReadinessOverview(): Promise<ReadinessOverview> {
  const supabase = await createClient()

  const [
    fellowsRes,
    typesRes,
    targetsRes,
    logsRes,
    iteRes,
    scholarlyRes,
    onboardingRes,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, pgy_level')
      .eq('role', 'fellow')
      .eq('is_active', true)
      .order('pgy_level', { ascending: true })
      .order('full_name', { ascending: true }),
    supabase
      .from('procedure_types')
      .select('code, label, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('procedure_targets').select('procedure_type, min_total'),
    supabase.from('procedure_logs').select('fellow_id, procedure_type'),
    supabase.from('ite_scores').select('fellow_id, exam_year, percentile'),
    supabase.from('scholarly_activities').select('fellow_id, status'),
    supabase.from('onboarding_tasks').select('fellow_id, status'),
  ])

  const firstError =
    fellowsRes.error ||
    typesRes.error ||
    targetsRes.error ||
    logsRes.error ||
    iteRes.error ||
    scholarlyRes.error ||
    onboardingRes.error
  if (firstError) {
    throw new Error(`Could not load the readiness overview: ${firstError.message}`)
  }

  const fellows = fellowsRes.data ?? []
  const types = typesRes.data ?? []
  const targets = targetsRes.data ?? []
  const logs = logsRes.data ?? []
  const ite = iteRes.data ?? []
  const scholarly = scholarlyRes.data ?? []
  const onboarding = onboardingRes.data ?? []

  const minByType = new Map<string, number>(
    targets.map((t) => [t.procedure_type, t.min_total]),
  )

  const procedureTemplate: ProcedureProgress[] = types.map((t) => ({
    code: t.code,
    label: t.label,
    done: 0,
    min: minByType.get(t.code) ?? 0,
  }))

  const fellowReadiness: FellowReadiness[] = fellows.map((fellow) => {
    // Procedures: count every logged procedure of each type (a logged attempt
    // counts as procedural experience toward the minimum).
    const procedures: ProcedureProgress[] = types.map((t) => ({
      code: t.code,
      label: t.label,
      done: logs.filter(
        (l) => l.fellow_id === fellow.id && l.procedure_type === t.code,
      ).length,
      min: minByType.get(t.code) ?? 0,
    }))
    // Pace readiness to the fellow's year: graduating fellows (PGY-5) are held
    // to the full minimum; first-years (PGY-4) are given the year to get there,
    // so procedures stay informational until then. The bars still show progress
    // toward the full minimum — only status/blockers are paced.
    const expectedFraction =
      fellow.pgy_level === 'PGY-4' || fellow.pgy_level === 'PGY-5'
        ? EXPECTED_PROCEDURE_FRACTION[fellow.pgy_level]
        : DEFAULT_EXPECTED_FRACTION
    const withTarget = procedures.filter((p) => p.min > 0)
    const proceduresMet = withTarget.filter((p) => p.done >= p.min).length
    const proceduresBehindPace = withTarget.filter(
      (p) => p.done < Math.ceil(p.min * expectedFraction),
    ).length

    // ITE: most recent exam year on record.
    const fellowIte = ite
      .filter((s) => s.fellow_id === fellow.id)
      .sort((a, b) => b.exam_year - a.exam_year)
    const latestIte =
      fellowIte.length > 0
        ? { examYear: fellowIte[0].exam_year, percentile: fellowIte[0].percentile }
        : null

    // Scholarly counts.
    const fellowScholarly = scholarly.filter((s) => s.fellow_id === fellow.id)
    const scholarlyCompleted = fellowScholarly.filter(
      (s) => s.status === 'completed',
    ).length
    const scholarlyActive = fellowScholarly.filter(
      (s) => s.status === 'in_progress' || s.status === 'planned',
    ).length

    // Onboarding checklist.
    const fellowTasks = onboarding.filter((o) => o.fellow_id === fellow.id)
    const onboardingTotal = fellowTasks.length
    const onboardingDone = fellowTasks.filter((o) => o.status === 'completed').length
    const onboardingIncomplete =
      onboardingTotal > 0 && onboardingDone < onboardingTotal

    // Human-readable blockers (thresholds are placeholders the APD can tune).
    const blockers: string[] = []
    if (proceduresBehindPace > 0) {
      const paceLabel = expectedFraction < 1 ? 'behind pace' : 'below minimum'
      blockers.push(
        `${proceduresBehindPace} procedure ${proceduresBehindPace === 1 ? 'type' : 'types'} ${paceLabel}`,
      )
    }
    if (onboardingIncomplete) {
      blockers.push(`${onboardingTotal - onboardingDone} onboarding tasks open`)
    }

    let status: ReadinessStatus = 'on_track'
    if (proceduresBehindPace >= 3) status = 'behind'
    else if (blockers.length > 0) status = 'at_risk'

    return {
      id: fellow.id,
      name: fellow.full_name,
      pgyLevel: fellow.pgy_level,
      status,
      blockers,
      procedures,
      proceduresMet,
      proceduresWithTarget: withTarget.length,
      latestIte,
      scholarlyCompleted,
      scholarlyActive,
      onboardingDone,
      onboardingTotal,
    }
  })

  return {
    fellows: fellowReadiness,
    procedureTypes: procedureTemplate,
  }
}

// ---------------------------------------------------------------------------
// Coordinator operations worklist — "what needs chasing this week"
// ---------------------------------------------------------------------------
export type OnboardingProgress = {
  fellowId: string
  fellowName: string
  pgyLevel: 'PGY-4' | 'PGY-5' | null
  pending: number
  total: number
}

export type RequiredAck = {
  id: string
  title: string
  acknowledged: number
  totalFellows: number
  missingNames: string[]
}

export type CoordinatorWorklist = {
  onboarding: OnboardingProgress[]
  requiredAcks: RequiredAck[]
  missingIteNames: string[]
  totalFellows: number
}

export async function getCoordinatorWorklist(): Promise<CoordinatorWorklist> {
  const supabase = await createClient()

  const [
    profilesRes,
    onboardingRes,
    resourcesRes,
    acksRes,
    iteRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role, pgy_level, is_active'),
    supabase.from('onboarding_tasks').select('fellow_id, status'),
    supabase
      .from('resources')
      .select('id, title')
      .eq('requires_ack', true)
      .eq('is_active', true),
    supabase.from('resource_acknowledgments').select('resource_id, fellow_id'),
    supabase.from('ite_scores').select('fellow_id'),
  ])

  const firstError =
    profilesRes.error ||
    onboardingRes.error ||
    resourcesRes.error ||
    acksRes.error ||
    iteRes.error
  if (firstError) {
    throw new Error(`Could not load the operations worklist: ${firstError.message}`)
  }

  const profiles = profilesRes.data ?? []
  const onboarding = onboardingRes.data ?? []
  const resources = resourcesRes.data ?? []
  const acks = acksRes.data ?? []
  const ite = iteRes.data ?? []

  const activeFellows = profiles.filter((p) => p.role === 'fellow' && p.is_active)

  const onboardingProgress: OnboardingProgress[] = activeFellows.map((f) => {
    const tasks = onboarding.filter((o) => o.fellow_id === f.id)
    return {
      fellowId: f.id,
      fellowName: f.full_name,
      pgyLevel: f.pgy_level,
      pending: tasks.filter((o) => o.status !== 'completed').length,
      total: tasks.length,
    }
  })

  const requiredAcks: RequiredAck[] = resources.map((r) => {
    const ackedFellowIds = new Set(
      acks.filter((a) => a.resource_id === r.id).map((a) => a.fellow_id),
    )
    const missing = activeFellows.filter((f) => !ackedFellowIds.has(f.id))
    return {
      id: r.id,
      title: r.title,
      acknowledged: activeFellows.length - missing.length,
      totalFellows: activeFellows.length,
      missingNames: missing.map((f) => f.full_name),
    }
  })

  const fellowsWithIte = new Set(ite.map((s) => s.fellow_id))
  const missingIteNames = activeFellows
    .filter((f) => !fellowsWithIte.has(f.id))
    .map((f) => f.full_name)

  return {
    onboarding: onboardingProgress,
    requiredAcks,
    missingIteNames,
    totalFellows: activeFellows.length,
  }
}
