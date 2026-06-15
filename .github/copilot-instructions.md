# GitHub Copilot instructions — Howard Endocrinology Fellowship App

Self-contained working rules for AI assistants in this repo. Copilot loads this file
automatically and does **not** reliably open linked docs, so the operative rules are
restated here. For anything not covered, the canonical sources win:

- `ARCHITECTURE.md` — scope, data model, privacy posture, roles (**read first** for context)
- `CLAUDE.md` — the same hard rules, in contributor form
- `DESIGN.md` — visual system and component patterns

## What this app is

Internal tool for the Howard University Hospital Endocrinology, Diabetes & Metabolism
fellowship — **3 fellows, 5 attendings** (incl. one PD and one APD). Three jobs:

1. **Evaluations** — attendings assess fellows against ACGME milestones.
2. **Progress tracking** — fellows log procedures and scholarly work against program minimums.
3. **Materials** — education and policy documents in one place.

**Not** a replacement for New Innovations / MedHub / any ACGME/GME system. It does **not**
handle duty hours, scheduling, or vacation — those belong to the institutional RMS.

## Hard rules (do not break)

1. **No PHI. Ever.** No patient name, MRN, DOB, or any patient identifier — not in columns,
   values, logs, comments, or test data. Procedure notes are *teaching context only*
   ("3 cm nodule, cystic"), never tied to a patient. This is a deliberate design choice that
   keeps the app **out of HIPAA scope**. The sensitive data here is **fellow educational
   records** (FERPA-flavored), protected by RLS — not patient health data. If a request
   implies storing patient data, stop and flag it.

2. **Model types are `type` aliases, never `interface`.** The Supabase typed client
   (`@supabase/postgrest-js`) requires each row type to satisfy `Record<string, unknown>`.
   A TypeScript `interface` does **not** implicitly satisfy that constraint, which silently
   degrades the entire typed client to `never` — every query loses its types, with no error.
   So anything that feeds the Supabase `Database` type (row / insert / update / model shapes)
   **must** be written as `type X = { … }`. Pull these from `lib/supabase/database.types.ts`;
   they map 1:1 to the schema. (Plain React `Props` may use `interface` — only DB/model types
   are affected.)

3. **Never bypass RLS.** Use the authenticated Supabase client and let row-level security do
   the filtering. No service-role key in app code, no raw-SQL endpoints, no "fetch with a user
   id" shortcuts. The first APD is the only hand-seeded row; everything else is RLS-governed.

4. **TypeScript strict, no `any`.** Use `unknown` + narrowing instead. Types live with the
   schema in `lib/supabase/database.types.ts`.

5. **Mobile-first and accessible.** Two real surfaces: a fellow on a phone, staff on a desktop.
   Layouts must work at **320px**; interactive targets **≥44×44px**; semantic HTML with real
   `<label>`s; **never** signal status by color alone (pair an icon or text). Follow `DESIGN.md`
   tokens (Howard blue `#0066CC`, system fonts).

6. **Honest errors.** User-facing messages are specific and actionable
   ("That sign-in link expired — request a new one"), never "Something went wrong."

## Project layout (this repo has **no `src/`**)

Routes live in `app/`. Feature folders live at the **repo root** alongside `app/`:

- `app/` — App Router routes (`app/login`, `app/auth/callback`, `app/log`, `app/dashboard`, …)
- `procedures/` — procedure-logging feature (`actions.ts`, `ProcedureLogForm.tsx`, `RecentProcedures.tsx`)
- `lib/` — `auth.ts` (`getProfile`, `requireProfile`, `roleHome`, `STAFF_ROLES`) and
  `supabase/` (`client.ts`, `server.ts`, `middleware.ts`, `database.types.ts`)
- `components/` — shared UI
- `supabase/migrations/` — the SQL record (numbered, each with a rollback block)

New features (`evaluations/`, `resources/`, …) follow the same pattern: a root-level feature
folder holding its UI, server actions, and types; its route under `app/`. Import via the `@/`
alias (`@/lib/...`), which points at the repo root.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS ·
Supabase (Postgres + RLS + Storage) via `@supabase/ssr`. Dev in GitHub Codespaces;
deploy on Netlify (**`main` auto-deploys to production** — keep `main` releasable).

## Auth (how it actually works)

Invite-only magic link. The login form calls `signInWithOtp` with `shouldCreateUser: false`
and `emailRedirectTo = <origin>/auth/callback`. The `app/auth/callback` route completes
sign-in (handles both the default `?code=` link and the custom `?token_hash=` style),
**never creates a profile**, and signs out anyone who authenticates without a provisioned
`profiles` row. New users are added by staff; the first PD/APD is seeded by hand in SQL.
Do not add self-signup or profile auto-creation.

## Roles & access (mirror in code)

- **Fellows** — own their procedures / scholarly work; complete assigned evaluations; read materials.
- **Attendings** — author evaluations and milestone assessments.
- **Staff** (`pd | apd | coordinator | admin`) — provision accounts, manage materials, see across the program.

SQL helpers: `is_staff()`, `is_evaluator()`. App helpers: `STAFF_ROLES`, `roleHome()` in `lib/auth.ts`.

## ACGME domain notes

- Procedures map to program minimums in `procedure_targets`; note the minimum in a comment when
  it's relevant to logic (the target lives in data, not hardcoded).
- Milestones use the ACGME **1.0–5.0** scale, **half-steps only** (DB-enforced), across the
  **7 competency domains**.
- This app is the working copy; the **institutional system remains the system of record**.

## Conventions

- **Branches:** `feature/…`, `fix/…`, `docs/…`, `refactor/…`
- **Commits:** `type(scope): summary` — e.g. `feat(procedures): add FNA logging form`,
  `fix(auth): handle expired magic link`, `docs(setup): correct magic-link template`.

## Before opening a PR (small team — keep it light)

- [ ] Works at 320px; keyboard + screen-reader sane; touch targets ≥44px.
- [ ] No `any`; model / row types are `type` aliases; no `console.log` in committed code.
- [ ] **No PHI** anywhere — code, comments, fixtures.
- [ ] RLS unaffected, or re-verified with a second account if you touched data access.
- [ ] Schema change → numbered migration **with a rollback block** + regenerate
      `lib/supabase/database.types.ts` in the same PR.
- [ ] `main` stays deployable (it auto-deploys to Netlify).
