# SKILLS.md — Maintainers & Onboarding

This is a small internal project. This file replaces the earlier six-role team
matrix (which described a team that doesn't exist) with something honest.

## Maintainer(s)
| Name | Role | Owns |
|------|------|------|
| [Add name] | Lead / physician-developer | Everything: scope, code, schema, deploy, ACGME domain |

If/when others join, add a row and the area they own. Don't add process that
exceeds the size of the team.

## What you need to know to contribute
- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres/RLS/Storage), deployed on Netlify. See `ARCHITECTURE.md`.
- **Domain:** ACGME Endocrinology fellowship requirements — procedures, milestones (1.0–5.0, 7 competencies), ITE, scholarly activity. The physician-developer is the domain authority.
- **The two things that will bite you:** (1) Row Level Security — test data access with a non-staff account; (2) the no-PHI rule — never add patient-identifying data.

## Getting oriented (a day, not six weeks)
1. Read `ARCHITECTURE.md`, then `CLAUDE.md`, then `DESIGN.md`.
2. Run the app locally (Codespaces): set `.env.local`, `npm install`, `npm run dev`.
3. Open `supabase/migrations/0001_initial_schema.sql` to see the data model and RLS policies.
4. Pick a small slice of an existing feature folder and follow its pattern.

## Free references
- ACGME Endocrinology Milestones — https://www.acgme.org/specialties/milestones
- Next.js — https://nextjs.org/docs · Supabase — https://supabase.com/docs · Tailwind — https://tailwindcss.com/docs
