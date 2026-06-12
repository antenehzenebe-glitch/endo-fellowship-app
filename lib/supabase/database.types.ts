// This file will be auto-generated from your Supabase schema.
// Run: npx supabase gen types typescript --project-id xousmzkftledlkwtpavb --schema public > lib/supabase/database.types.ts
// For now, we use a basic placeholder.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'fellow' | 'attending' | 'apd'
          pgy_year: '4' | '5' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'fellow' | 'attending' | 'apd'
          pgy_year?: '4' | '5' | null
        }
        Update: {
          full_name?: string
          email?: string
          role?: 'fellow' | 'attending' | 'apd'
          pgy_year?: '4' | '5' | null
        }
      }
      // Add other tables as we build features
      procedure_logs: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
