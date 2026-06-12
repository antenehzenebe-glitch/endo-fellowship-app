// =====================================================
// Howard Endocrinology Fellowship App - Database Types
// Comprehensive types based on schema (manual for now)
// You can replace later with: npx supabase gen types ...
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'fellow' | 'attending' | 'apd'
export type PgyYear = '4' | '5'
export type ProcedureCategory =
  | 'Diagnostic Procedure'
  | 'Therapeutic Procedure'
  | 'Interpretation & Management'
  | 'Point-of-Care Ultrasound'
  | 'Other'
export type EndoProcedureType =
  | 'Thyroid FNA Biopsy'
  | 'Neck/Thyroid Ultrasound'
  | 'Fine Needle Aspiration (Other)'
  | 'CGM Data Interpretation & Report'
  | 'Insulin Pump Initiation / Management'
  | 'Continuous Glucose Monitor Placement/Interpretation'
  | 'Thyroid Nodule Evaluation'
  | 'Adrenal Vein Sampling'
  | 'Pituitary Dynamic Testing Interpretation'
  | 'Bone Density (DEXA) Interpretation'
  | 'Other Endocrine Procedure'
export type EvaluationRating =
  | 'Not Yet Competent'
  | 'Developing'
  | 'Proficient'
  | 'Advanced'
  | 'Expert / Independent'
export type ScholarlyActivityType =
  | 'Quality Improvement Project'
  | 'Research Project'
  | 'Abstract / Poster Presentation'
  | 'Oral Presentation / Lecture'
  | 'Peer-Reviewed Publication'
  | 'Case Report'
  | 'Grand Rounds Presentation'
  | 'Other Scholarly Activity'
export type ActivityStatus = 'In Progress' | 'Completed' | 'Submitted' | 'Published'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: UserRole
          pgy_year: PgyYear | null
          fellowship_cohort: string | null
          start_date: string | null
          end_date: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: UserRole
          pgy_year?: PgyYear | null
          fellowship_cohort?: string | null
          start_date?: string | null
          end_date?: string | null
          phone?: string | null
        }
        Update: {
          full_name?: string
          email?: string
          role?: UserRole
          pgy_year?: PgyYear | null
          fellowship_cohort?: string | null
          start_date?: string | null
          end_date?: string | null
          phone?: string | null
        }
      }
      procedure_logs: {
        Row: {
          id: string
          fellow_id: string
          procedure_date: string
          procedure_type: EndoProcedureType
          category: ProcedureCategory
          attending_id: string | null
          location: string | null
          outcome_notes: string | null
          complications: string | null
          competency_tags: string[] | null
          is_supervised: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          fellow_id: string
          procedure_date: string
          procedure_type: EndoProcedureType
          category: ProcedureCategory
          attending_id?: string | null
          location?: string | null
          outcome_notes?: string | null
          complications?: string | null
          competency_tags?: string[] | null
          is_supervised?: boolean
        }
        Update: {
          procedure_date?: string
          procedure_type?: EndoProcedureType
          category?: ProcedureCategory
          attending_id?: string | null
          location?: string | null
          outcome_notes?: string | null
          complications?: string | null
          competency_tags?: string[] | null
          is_supervised?: boolean
        }
      }
      milestone_evaluations: {
        Row: {
          id: string
          fellow_id: string
          evaluator_id: string
          evaluation_date: string
          milestone_code: string
          milestone_description: string | null
          rating: EvaluationRating
          narrative_feedback: string | null
          strengths: string | null
          areas_for_improvement: string | null
          created_at: string
        }
        Insert: {
          fellow_id: string
          evaluator_id: string
          evaluation_date: string
          milestone_code: string
          milestone_description?: string | null
          rating: EvaluationRating
          narrative_feedback?: string | null
          strengths?: string | null
          areas_for_improvement?: string | null
        }
        Update: {
          evaluation_date?: string
          milestone_code?: string
          milestone_description?: string | null
          rating?: EvaluationRating
          narrative_feedback?: string | null
          strengths?: string | null
          areas_for_improvement?: string | null
        }
      }
      scholarly_activities: {
        Row: {
          id: string
          fellow_id: string
          activity_type: ScholarlyActivityType
          title: string
          description: string | null
          start_date: string | null
          completion_date: string | null
          status: ActivityStatus
          outcome: string | null
          url_or_doi: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          fellow_id: string
          activity_type: ScholarlyActivityType
          title: string
          description?: string | null
          start_date?: string | null
          completion_date?: string | null
          status?: ActivityStatus
          outcome?: string | null
          url_or_doi?: string | null
        }
        Update: {
          activity_type?: ScholarlyActivityType
          title?: string
          description?: string | null
          start_date?: string | null
          completion_date?: string | null
          status?: ActivityStatus
          outcome?: string | null
          url_or_doi?: string | null
        }
      }
      onboarding_tasks: {
        Row: {
          id: string
          fellow_id: string
          task_name: string
          description: string | null
          due_date: string | null
          is_completed: boolean
          completed_at: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          fellow_id: string
          task_name: string
          description?: string | null
          due_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          category?: string | null
        }
        Update: {
          task_name?: string
          description?: string | null
          due_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          category?: string | null
        }
      }
    }
    Views: {
      fellow_procedure_counts: {
        Row: {
          fellow_id: string
          procedure_type: EndoProcedureType
          count: number
          first_date: string | null
          last_date: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      pgy_year: PgyYear
      procedure_category: ProcedureCategory
      endo_procedure_type: EndoProcedureType
      evaluation_rating: EvaluationRating
      scholarly_activity_type: ScholarlyActivityType
      activity_status: ActivityStatus
    }
  }
}
