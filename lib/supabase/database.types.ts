// lib/supabase/database.types.ts
// Generated from the live Supabase schema (the source of truth). Models use
// `type` aliases — never `interface` — so they satisfy Record<string, unknown>
// for the PostgREST typed client. Regenerate after any schema change; never
// convert these to interfaces.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      evaluation_forms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          questions: Json
          type: Database["public"]["Enums"]["evaluation_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          questions?: Json
          type: Database["public"]["Enums"]["evaluation_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          questions?: Json
          type?: Database["public"]["Enums"]["evaluation_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          academic_year: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          evaluator_id: string
          form_id: string
          id: string
          period: Database["public"]["Enums"]["eval_period"] | null
          period_label: string | null
          responses: Json
          status: Database["public"]["Enums"]["task_status"]
          subject_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          evaluator_id: string
          form_id: string
          id?: string
          period?: Database["public"]["Enums"]["eval_period"] | null
          period_label?: string | null
          responses?: Json
          status?: Database["public"]["Enums"]["task_status"]
          subject_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          evaluator_id?: string
          form_id?: string
          id?: string
          period?: Database["public"]["Enums"]["eval_period"] | null
          period_label?: string | null
          responses?: Json
          status?: Database["public"]["Enums"]["task_status"]
          subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "evaluation_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fellow_evaluations: {
        Row: {
          academic_year: string
          created_at: string
          evaluator_id: string
          fellow_id: string
          finalized_at: string | null
          id: string
          narrative: string
          overall_rating: string
          period: Database["public"]["Enums"]["eval_period"]
          status: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          evaluator_id: string
          fellow_id: string
          finalized_at?: string | null
          id?: string
          narrative: string
          overall_rating: string
          period: Database["public"]["Enums"]["eval_period"]
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          evaluator_id?: string
          fellow_id?: string
          finalized_at?: string | null
          id?: string
          narrative?: string
          overall_rating?: string
          period?: Database["public"]["Enums"]["eval_period"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fellow_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fellow_evaluations_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ite_scores: {
        Row: {
          created_at: string
          exam_year: number
          fellow_id: string
          id: string
          notes: string | null
          percentile: number | null
          scaled_score: number | null
        }
        Insert: {
          created_at?: string
          exam_year: number
          fellow_id: string
          id?: string
          notes?: string | null
          percentile?: number | null
          scaled_score?: number | null
        }
        Update: {
          created_at?: string
          exam_year?: number
          fellow_id?: string
          id?: string
          notes?: string | null
          percentile?: number | null
          scaled_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ite_scores_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_assessments: {
        Row: {
          academic_year: string | null
          assessment_date: string
          attending_id: string
          comments: string | null
          competency: Database["public"]["Enums"]["acgme_competency"]
          created_at: string
          fellow_id: string
          id: string
          level: number
          sub_competency: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          assessment_date?: string
          attending_id: string
          comments?: string | null
          competency: Database["public"]["Enums"]["acgme_competency"]
          created_at?: string
          fellow_id: string
          id?: string
          level: number
          sub_competency?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          assessment_date?: string
          attending_id?: string
          comments?: string | null
          competency?: Database["public"]["Enums"]["acgme_competency"]
          created_at?: string
          fellow_id?: string
          id?: string
          level?: number
          sub_competency?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_assessments_attending_id_fkey"
            columns: ["attending_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_assessments_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          fellow_id: string
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_name: string
          updated_at: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          fellow_id: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          fellow_id?: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          credentials: string | null
          email: string | null
          full_name: string
          id: string
          is_leadership: boolean
          is_published: boolean
          photo_path: string | null
          profile_id: string | null
          role_title: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          category: string
          created_at?: string
          credentials?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_leadership?: boolean
          is_published?: boolean
          photo_path?: string | null
          profile_id?: string | null
          role_title?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          credentials?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_leadership?: boolean
          is_published?: boolean
          photo_path?: string | null
          profile_id?: string | null
          role_title?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_logs: {
        Row: {
          created_at: string
          date_performed: string
          fellow_id: string
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["procedure_outcome"]
          procedure_type: string
          supervising_attending_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_performed: string
          fellow_id: string
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["procedure_outcome"]
          procedure_type: string
          supervising_attending_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_performed?: string
          fellow_id?: string
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["procedure_outcome"]
          procedure_type?: string
          supervising_attending_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_logs_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedure_logs_supervising_attending_id_fkey"
            columns: ["supervising_attending_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedure_logs_type_fk"
            columns: ["procedure_type"]
            isOneToOne: false
            referencedRelation: "procedure_types"
            referencedColumns: ["code"]
          },
        ]
      }
      procedure_targets: {
        Row: {
          min_total: number
          procedure_type: string
          updated_at: string
        }
        Insert: {
          min_total: number
          procedure_type: string
          updated_at?: string
        }
        Update: {
          min_total?: number
          procedure_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_targets_type_fk"
            columns: ["procedure_type"]
            isOneToOne: true
            referencedRelation: "procedure_types"
            referencedColumns: ["code"]
          },
        ]
      }
      procedure_types: {
        Row: {
          code: string
          created_at: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          pgy_level: Database["public"]["Enums"]["pgy_level"] | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          pgy_level?: Database["public"]["Enums"]["pgy_level"] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          pgy_level?: Database["public"]["Enums"]["pgy_level"] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      program_schedule: {
        Row: {
          academic_year: string
          config: Json
          id: string
          is_current: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_year?: string
          config?: Json
          id: string
          is_current?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_year?: string
          config?: Json
          id?: string
          is_current?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_schedule_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_acknowledgments: {
        Row: {
          acknowledged_at: string
          fellow_id: string
          id: string
          resource_id: string
        }
        Insert: {
          acknowledged_at?: string
          fellow_id: string
          id?: string
          resource_id: string
        }
        Update: {
          acknowledged_at?: string
          fellow_id?: string
          id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_acknowledgments_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_acknowledgments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string
          description: string | null
          external_url: string | null
          file_type: string | null
          id: string
          is_active: boolean
          requires_ack: boolean
          storage_path: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_type?: string | null
          id?: string
          is_active?: boolean
          requires_ack?: boolean
          storage_path?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_type?: string | null
          id?: string
          is_active?: boolean
          requires_ack?: boolean
          storage_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarly_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["scholarly_type"]
          completed_on: string | null
          created_at: string
          details: string | null
          fellow_id: string
          id: string
          started_on: string | null
          status: Database["public"]["Enums"]["scholarly_status"]
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["scholarly_type"]
          completed_on?: string | null
          created_at?: string
          details?: string | null
          fellow_id: string
          id?: string
          started_on?: string | null
          status?: Database["public"]["Enums"]["scholarly_status"]
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["scholarly_type"]
          completed_on?: string | null
          created_at?: string
          details?: string | null
          fellow_id?: string
          id?: string
          started_on?: string | null
          status?: Database["public"]["Enums"]["scholarly_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarly_activities_fellow_id_fkey"
            columns: ["fellow_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_author_eval: { Args: never; Returns: boolean }
      is_evaluator: { Args: never; Returns: boolean }
      is_fellow: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      acgme_competency:
        | "patient_care"
        | "medical_knowledge"
        | "interpersonal_communication"
        | "professionalism"
        | "systems_based_practice"
        | "practice_based_learning"
        | "personal_improvement"
      eval_period: "mid_year" | "end_of_year"
      evaluation_type:
        | "faculty_of_fellow"
        | "fellow_of_faculty"
        | "rotation"
        | "self"
        | "360"
        | "program"
      pgy_level: "PGY-4" | "PGY-5"
      procedure_outcome: "successful" | "learning" | "incomplete"
      resource_category:
        | "policy"
        | "curriculum"
        | "didactic"
        | "onboarding"
        | "board_prep"
        | "form"
        | "other"
      scholarly_status: "planned" | "in_progress" | "completed"
      scholarly_type:
        | "qi_project"
        | "abstract"
        | "publication"
        | "poster"
        | "lecture"
        | "presentation"
        | "other"
      task_status: "pending" | "in_progress" | "completed"
      user_role: "fellow" | "attending" | "pd" | "apd" | "coordinator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acgme_competency: [
        "patient_care",
        "medical_knowledge",
        "interpersonal_communication",
        "professionalism",
        "systems_based_practice",
        "practice_based_learning",
        "personal_improvement",
      ],
      eval_period: ["mid_year", "end_of_year"],
      evaluation_type: [
        "faculty_of_fellow",
        "fellow_of_faculty",
        "rotation",
        "self",
        "360",
        "program",
      ],
      pgy_level: ["PGY-4", "PGY-5"],
      procedure_outcome: ["successful", "learning", "incomplete"],
      resource_category: [
        "policy",
        "curriculum",
        "didactic",
        "onboarding",
        "board_prep",
        "form",
        "other",
      ],
      scholarly_status: ["planned", "in_progress", "completed"],
      scholarly_type: [
        "qi_project",
        "abstract",
        "publication",
        "poster",
        "lecture",
        "presentation",
        "other",
      ],
      task_status: ["pending", "in_progress", "completed"],
      user_role: ["fellow", "attending", "pd", "apd", "coordinator", "admin"],
    },
  },
} as const
