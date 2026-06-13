# ARCHITECTURE.md — Source of Truth

Internal program tool for the **Howard University Hospital Endocrinology, Diabetes & Metabolism fellowship**. Read this before anything else; `CLAUDE.md` (AI-contributor rules) and `DESIGN.md` (visual system) build on it.

## What this is

A small, local tool for one program — **3 fellows, 5 attendings (incl. PD and APD), ~8 users total** — with three jobs (the three pillars):

1. **Progress tracking** — de-identified procedure logs vs. program minimums, ITE scores, scholarly activity.
2. **Evaluations** — structured ACGME milestone assessments plus a flexible assign→complete evaluation engine (rotation, 360, faculty-of-fellow, fellow-of-faculty, self, program).
3. **Education & policy materials** — a catalog over Supabase Storage with read-acknowledgment tracking, replacing paper files.

## What this is not

- **Not** a replacement for New Innovations / MedHub / any institutional or ACGME system. It does **not** submit to ACGME. It is the program's day-to-day working copy; the institutional RMS remains the system of record.
- **Excluded by design:** duty hours, rotation scheduling, vacation tracking. Those belong to the institutional RMS; duplicating them creates redundant data entry and accreditation risk.

## Privacy posture: NO PHI

There are **no patient identifiers anywhere** — no name, MRN, or DOB columns exist, and none may be added. Procedure notes are teaching context only. The sensitive data here is **fellow educational records**, protected by Row Level Security. Keeping PHI out keeps the app out of HIPAA scope entirely. (Earlier docs that framed this as "PII/HIPAA" are superseded.)

## Stack

Next.js (App Router) + TypeScript (strict) + Tailwind CSS, on Supabase (Postgres 17, RLS, Storage). Developed in GitHub Codespaces, deployed on Netlify. Only the anon key appears in app code — RLS does the enforcing; the service-role key is never used by the app.

## Data model (deployed 2026-06-12)

Eleven tables, all RLS-enabled, defined in `supabase/migrations/0001_initial_schema.sql` (with `0000` reset, `0002` storage bucket, `0003` hardening). Types mirror it 1:1 in `lib/supabase/database.types.ts`.

| Pillar | Tables |
|---|---|
| Identity | `profiles` (role, pgy_level for fellows, role-change guard trigger) |
| 1 — Progress | `procedure_logs`, `procedure_targets`, `ite_scores`, `scholarly_activities` |
| 2 — Evaluations | `milestone_assessments`, `evaluation_forms`, `evaluations` |
| 3 — Materials | `resources`, `resource_acknowledgments`, `onboarding_tasks` |

Key invariants enforced in the database:
- Milestones use the **ACGME 1.0–5.0 scale, half-steps only** (check constraints), across the 7 competency enum values.
- `procedure_logs.date_performed` cannot be in the future.
- A fellow must have a `pgy_level`; non-fellows must not.
- Only staff can change a profile's `role` (trigger `trg_guard_profile_role`).
- An event trigger (`ensure_rls` → `rls_auto_enable()`) auto-enables RLS on any new `public` table — a deliberate safety net.

## Roles & access

| Role | Access pattern |
|---|---|
| `fellow` | Owns their procedures/scholarly work; completes assigned evals; sees completed evals about them; reads materials; acknowledges policies. |
| `attending` | Authors milestone assessments and evaluations; reads procedures they supervised. |
| `pd`, `apd`, `coordinator`, `admin` (**staff**) | Provision accounts, manage targets/forms/materials, see across the program. |

SQL helpers `is_staff()` / `is_evaluator()` mirror to `STAFF_ROLES` / `EVALUATOR_ROLES` in `lib/supabase/database.types.ts` and `roleHome()` in `lib/auth.ts`. 33 RLS policies on `public`, 4 on `storage` (private `resources` bucket: authenticated read, staff write).

## Auth

Invite-only magic links. Staff invite the email (Supabase → Authentication → Users) **and** create the profile row; the login form uses `shouldCreateUser: false`, so uninvited emails get a clear error instead of a stray account. The link verifies via token hash at `/auth/confirm` (the Magic Link email template must point there — see `SETUP.md`). The root page routes by role: fellow → `/log`, everyone else → `/dashboard`. The first PD/APD row is the only manually seeded profile (RLS makes profile inserts staff-only).

## App layout

Feature folders at the repo root (`@/*` maps to `./*`):

```
app/            routes only (login, auth/confirm, auth/signout, log, dashboard)
lib/            supabase clients, auth helpers, database.types.ts
components/     shared UI
procedures/     feature: logger form, recent list, server action
evaluations/    feature (planned)
resources/      feature (planned)
```

New feature folders must be added to `tailwind.config.ts` `content` or their classes get purged.

## Scale honesty

Lifetime row counts are in the hundreds. Indexes exist for correctness and clarity, not load. No pagination machinery, no offline sync, no caching layers — do not add infrastructure this program will never need.

## Status (2026-06-12)

Done: schema + RLS deployed and advisor-hardened; storage bucket; invite-only auth; Mobile Procedure Logger; staff dashboard v1 (fellow roster vs. minimums).
Next: seed `procedure_targets`, bootstrap the first PD/APD profile, Netlify deploy; then evaluation assignment UI, materials library UI, ITE/milestone views.
