# CLAUDE.md — AI Contributor Rules

Internal tool for the HUH Endocrinology, Diabetes & Metabolism fellowship (3 fellows, 5 attendings).
Three jobs: run evaluations, track fellow progress, hold education/policy materials.

Read when relevant (do not duplicate here): **ARCHITECTURE.md** (scope, data model, roles/RLS — read it first) · **DESIGN.md** (visual system) · **SETUP.md** (env, deploy, project state).

## Commands
- `npm run typecheck` — strict TS gate. YOU MUST keep it clean after every change series.
- `npm run build` — production build (Netlify runs this on merge to main).
- `npm run lint` · `npm run check:no-hex` (no canonical hexes outside `lib/tokens`).
- `npm run dev` — local dev (needs `.env.local`, see SETUP.md).

## Hard rules
1. IMPORTANT: **No PHI, ever.** No patient name / MRN / DOB columns or values. Procedure notes are teaching context only — this keeps the app out of HIPAA scope.
2. YOU MUST NOT bypass RLS. Authenticated Supabase client only; no service-role key in app code; no raw-SQL endpoints.
3. TypeScript strict, no `any`. DB models: `type` aliases (never `interface`) mirroring `lib/supabase/database.types.ts` 1:1.
4. Feature folders at repo root (`procedures/`, `evaluations/`, `resources/`, `dashboard/`); routes in `app/`. UI, server actions, and types stay with their feature.
5. Mobile-first: works at 320px; 44×44px touch targets; semantic HTML + labels; never color-only status; DESIGN.md tokens only.
6. Honest errors: user-facing messages are specific and actionable, never "something went wrong".
7. No `console.log` in committed code.
8. Procedures map to program minimums (`procedure_targets`) — document the minimum in a comment when relevant.

## Repo etiquette
- Branch → PR → squash-merge to `main`; Netlify auto-deploys `main`.
- Schema change? Add a numbered migration with a rollback block and update `database.types.ts` in the same PR.
- Before a PR: works at 320px; keyboard + screen-reader sane; RLS unaffected or re-verified if you touched data access.
