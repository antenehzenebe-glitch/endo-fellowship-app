// =============================================================================
// Database types — HUH Endocrinology Fellowship App
// Matches supabase/migrations/0001_initial_schema.sql exactly (deployed 2026-06-12).
//
// ⚠️ IMPORTANT: every model here is declared with `type`, NOT `interface`.
// @supabase/postgrest-js requires each table's Row type to satisfy
// `Record<string, unknown>`. TypeScript interfaces do NOT implicitly satisfy
// that constraint, which silently degrades the entire typed client to `never`.
// Keep these as type aliases. (Documented project learning — do not "clean up".)
//
// If the schema changes: add a numbered migration AND update this file in the
// same PR. You can also regenerate with:
//   npx supabase gen types typescript --project-id xousmzkftledlkwtpavb
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------------------------------------------------------------------------
// Enums (mirror public.* enum types)
// ---------------------------------------------------------------------------
export type UserRole =
  | 'fellow'
  | 'attending'
  | 'pd'
  | 'apd'
  | 'coordinator'
  | 'admin'

export type PgyLevel = 'PGY-4' | 'PGY-5'

export type ProcedureType = 'FNA' | 'THYROID_US' | 'CGM_INTERP'

export type ProcedureOutcome = 'successful' | 'learning' | 'incomplete'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export type AcgmeCompetency =
  | 'patient_care'
  | 'medical_knowledge'
  | 'interpersonal_communication'
  | 'professionalism'
  | 'systems_based_practice'
  | 'practice_based_learning'
  | 'personal_improvement'

export type EvaluationType =
  | 'faculty_of_fellow'
  | 'fellow_of_faculty'
  | 'rotation'
  | 'self'
  | '360'
  | 'program'

export type ResourceCategory =
  | 'policy'
  | 'curriculum'
  | 'didactic'
  | 'onboarding'
  | 'board_prep'
  | 'form'
  | 'other'

export type ScholarlyType =
  | 'qi_project'
  | 'abstract'
  | 'publication'
  | 'poster'
  | 'lecture'
  | 'presentation'
  | 'other'

export type ScholarlyStatus = 'planned' | 'in_progress' | 'completed'

// Roles with program-wide access (mirror of public.is_staff()).
export const STAFF_ROLES = ['pd', 'apd', 'coordinator', 'admin'] as const satisfies readonly UserRole[]
// Roles that may author evaluations (mirror of public.is_evaluator()).
export const EVALUATOR_ROLES = ['attending', 'pd', 'apd', 'coordinator', 'admin'] as const satisfies readonly UserRole[]

// Human-readable labels for the short procedure codes.
export const PROCEDURE_LABELS: Record<ProcedureType, string> = {
  FNA: 'Thyroid FNA',
  THYROID_US: 'Thyroid Ultrasound',
  CGM_INTERP: 'CGM Interpretation',
}

// ---------------------------------------------------------------------------
// Table row models (type aliases — see header note)
// ---------------------------------------------------------------------------
export type Profile = {
  id: string
  role: UserRole
  full_name: string
  email: string | null
  pgy_level: PgyLevel | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProcedureLog = {
  id: string
  fellow_id: string
  procedure_type: ProcedureType
  date_performed: string // ISO date
  outcome: ProcedureOutcome
  supervising_attending_id: string | null
  notes: string | null // teaching context only — never PHI
  created_at: string
  updated_at: string
}

export type ProcedureTarget = {
  procedure_type: ProcedureType
  min_total: number
  updated_at: string
}

export type IteScore = {
  id: string
  fellow_id: string
  exam_year: number
  percentile: number | null
  scaled_score: number | null
  notes: string | null
  created_at: string
}

export type ScholarlyActivity = {
  id: string
  fellow_id: string
  activity_type: ScholarlyType
  title: string
  status: ScholarlyStatus
  started_on: string | null
  completed_on: string | null
  details: string | null
  created_at: string
  updated_at: string
}

export type MilestoneAssessment = {
  id: string
  fellow_id: string
  attending_id: string
  competency: AcgmeCompetency
  sub_competency: string | null
  level: number // ACGME 1.0–5.0, half-steps (DB-enforced)
  comments: string | null
  assessment_date: string
  academic_year: string | null
  created_at: string
  updated_at: string
}

export type EvaluationForm = {
  id: string
  name: string
  description: string | null
  type: EvaluationType
  questions: Json
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Evaluation = {
  id: string
  form_id: string
  evaluator_id: string
  subject_id: string | null
  period_label: string | null
  status: TaskStatus
  responses: Json
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type Resource = {
  id: string
  title: string
  description: string | null
  category: ResourceCategory
  storage_path: string | null
  external_url: string | null
  file_type: string | null
  requires_ack: boolean
  is_active: boolean
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export type ResourceAcknowledgment = {
  id: string
  resource_id: string
  fellow_id: string
  acknowledged_at: string
}

export type OnboardingTask = {
  id: string
  fellow_id: string
  task_name: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Supabase Database shape
// ---------------------------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          email?: string | null
          pgy_level?: PgyLevel | null
          is_active?: boolean
        }
        Update: {
          role?: UserRole
          full_name?: string
          email?: string | null
          pgy_level?: PgyLevel | null
          is_active?: boolean
        }
        Relationships: []
      }
      procedure_logs: {
        Row: ProcedureLog
        Insert: {
          id?: string
          fellow_id: string
          procedure_type: ProcedureType
          date_performed: string
          outcome?: ProcedureOutcome
          supervising_attending_id?: string | null
          notes?: string | null
        }
        Update: {
          procedure_type?: ProcedureType
          date_performed?: string
          outcome?: ProcedureOutcome
          supervising_attending_id?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      procedure_targets: {
        Row: ProcedureTarget
        Insert: { procedure_type: ProcedureType; min_total: number }
        Update: { min_total?: number }
        Relationships: []
      }
      ite_scores: {
        Row: IteScore
        Insert: {
          id?: string
          fellow_id: string
          exam_year: number
          percentile?: number | null
          scaled_score?: number | null
          notes?: string | null
        }
        Update: {
          exam_year?: number
          percentile?: number | null
          scaled_score?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      scholarly_activities: {
        Row: ScholarlyActivity
        Insert: {
          id?: string
          fellow_id: string
          activity_type: ScholarlyType
          title: string
          status?: ScholarlyStatus
          started_on?: string | null
          completed_on?: string | null
          details?: string | null
        }
        Update: {
          activity_type?: ScholarlyType
          title?: string
          status?: ScholarlyStatus
          started_on?: string | null
          completed_on?: string | null
          details?: string | null
        }
        Relationships: []
      }
      milestone_assessments: {
        Row: MilestoneAssessment
        Insert: {
          id?: string
          fellow_id: string
          attending_id: string
          competency: AcgmeCompetency
          sub_competency?: string | null
          level: number
          comments?: string | null
          assessment_date?: string
          academic_year?: string | null
        }
        Update: {
          competency?: AcgmeCompetency
          sub_competency?: string | null
          level?: number
          comments?: string | null
          assessment_date?: string
          academic_year?: string | null
        }
        Relationships: []
      }
      evaluation_forms: {
        Row: EvaluationForm
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: EvaluationType
          questions?: Json
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          type?: EvaluationType
          questions?: Json
          is_active?: boolean
        }
        Relationships: []
      }
      evaluations: {
        Row: Evaluation
        Insert: {
          id?: string
          form_id: string
          evaluator_id: string
          subject_id?: string | null
          period_label?: string | null
          status?: TaskStatus
          responses?: Json
          due_date?: string | null
          completed_at?: string | null
        }
        Update: {
          period_label?: string | null
          status?: TaskStatus
          responses?: Json
          due_date?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: Resource
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: ResourceCategory
          storage_path?: string | null
          external_url?: string | null
          file_type?: string | null
          requires_ack?: boolean
          is_active?: boolean
          uploaded_by?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          category?: ResourceCategory
          storage_path?: string | null
          external_url?: string | null
          file_type?: string | null
          requires_ack?: boolean
          is_active?: boolean
        }
        Relationships: []
      }
      resource_acknowledgments: {
        Row: ResourceAcknowledgment
        Insert: { id?: string; resource_id: string; fellow_id: string; acknowledged_at?: string }
        Update: Record<string, never>
        Relationships: []
      }
      onboarding_tasks: {
        Row: OnboardingTask
        Insert: {
          id?: string
          fellow_id: string
          task_name: string
          description?: string | null
          status?: TaskStatus
          due_date?: string | null
          completed_at?: string | null
        }
        Update: {
          task_name?: string
          description?: string | null
          status?: TaskStatus
          due_date?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean }
      is_evaluator: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      pgy_level: PgyLevel
      procedure_type: ProcedureType
      procedure_outcome: ProcedureOutcome
      task_status: TaskStatus
      acgme_competency: AcgmeCompetency
      evaluation_type: EvaluationType
      resource_category: ResourceCategory
      scholarly_type: ScholarlyType
      scholarly_status: ScholarlyStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
