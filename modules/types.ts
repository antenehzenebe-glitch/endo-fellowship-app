// modules/types.ts
// Row aliases for the educational module system, plus the shape of a single
// self-check question. DB rows come straight from the generated Supabase types
// (type aliases only — never `interface`, which degrades the typed client).
import type { Database } from '@/lib/supabase/database.types'

export type Module = Database['public']['Tables']['modules']['Row']
export type ProgramVideo = Database['public']['Tables']['program_videos']['Row']
export type ModuleProgress = Database['public']['Tables']['module_progress']['Row']

// A single multiple-choice self-check item. This is static teaching content
// (not stored in the DB) — it ships in code with each module's quiz.
export type QuizQuestion = {
  id: string
  tag: string // short topic label, e.g. "TI-RADS scoring"
  vignette?: string // optional clinical stem shown above the question
  stem: string // the actual question
  options: string[] // 2-5 answer choices
  correct: number // index into options
  rationale: string // why the right answer is right
  pearl: string // one-line board pearl
}

// A module joined with its videos and (optionally) the signed-in fellow's
// progress — the shape the module page assembles for rendering.
export type ModuleWithContent = Module & {
  videos: ProgramVideo[]
  progress: ModuleProgress | null
}
