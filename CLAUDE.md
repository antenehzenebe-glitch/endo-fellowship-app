# CLAUDE.md — AI Contributor Guide

Canonical guidance for AI assistants (Claude, Copilot, etc.) working on this repo.
**Scope, data model, and privacy posture live in [`ARCHITECTURE.md`](./ARCHITECTURE.md). Read it first.**
Visual system lives in [`DESIGN.md`](./DESIGN.md). This file only adds rules specific to writing code here.

## The 30-second version
Internal tool for the HUH Endocrinology fellowship (**3 fellows, 5 attendings incl. PD + APD**).
Three jobs: run evaluations, track fellow progress, hold education/policy materials in one place.
**Not** a replacement for New Innovations / ACGME systems. Excludes duty hours, scheduling, vacation.

## Hard rules
1. **No PHI, ever.** No patient name / MRN / DOB columns or values. Procedure notes are teaching context only. This keeps us out of HIPAA scope — don't break it.
2. **Never bypass RLS.** Use the authenticated Supabase client; let row-level security do the filtering. No service-role key in app code, no raw-SQL endpoints. The first APD is the only manually-seeded row.
3. **TypeScript strict, no `any`.** Use the generated/maintained types in `src/lib/database.types.ts`. Models align 1:1 with the schema.
4. **Feature folders.** `src/procedures/`, `src/evaluations/`, `src/resources/`, `src/dashboard/`. Routes in `src/app/`. UI components, server actions, and types stay with their feature.
5. **Mobile-first, accessible.** Two real surfaces: fellow-on-phone, staff-on-desktop. 320px works; 44×44px touch targets; semantic HTML + labels; never color-only status. Follow DESIGN.md tokens.
6. **Honest errors.** User-facing messages are specific and actionable, not "something went wrong."

## Roles & access (mirror in code)
- **Fellows** — own their procedures/scholarly work; complete assigned evals; read materials.
- **Attendings** — author evaluations & milestone assessments.
- **Staff** = `pd | apd | coordinator | admin` — provision accounts, manage materials, see across the program.
Helpers: `is_staff()`, `is_evaluator()` in SQL; `STAFF_ROLES`, `roleHome()` in `src/lib/auth.ts`.

## ACGME notes
- Procedures map to program minimums (`procedure_targets`). Document the minimum in a comment when relevant.
- Milestones use the ACGME 1.0–5.0 scale, half-steps only (DB-enforced) across the 7 competency domains.
- This app is the working copy; the institutional system remains the system of record.

## Before a PR (solo/small team — keep it light)
- Works at 320px; keyboard + screen-reader sane.
- RLS unaffected or re-verified if you touched data access.
- No `any`, no `console.log` in committed code, no PHI.
- Schema change? Add a numbered migration with a rollback block and update `database.types.ts` in the same PR.

## Build status
Schema + RLS: done & validated. Auth (magic-link, role redirect) + Mobile Procedure Logger: in progress.
Next: APD dashboard, materials library UI, evaluation assignment UI.
