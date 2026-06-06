# CLAUDE.md – AI Development Guide

## Project Overview

**Howard Endocrinology Fellowship App** is a lightweight, mobile-responsive web application designed to track ACGME-required metrics, scholarly activities, and procedural competence for PGY-4 and PGY-5 Endocrinology fellows.

### Core Purpose
- **Procedure Logs:** Mobile-first rapid entry for subspecialty procedures (FNA, Thyroid Ultrasound, CGM Interpretation)
- **Milestone Evaluations:** Attending evaluations dynamically linked to current ACGME sub-competencies
- **Scholarly Tracking:** Longitudinal QI projects and deliverable academic activities (abstracts, internal lectures)
- **Graduation Readiness:** APD dashboard tracking longitudinal ITE scores, procedural minimums, and compliance

### Architectural Scope & Exclusions
This system **strictly excludes**:
- Duty hours tracking
- Generic rotation scheduling
- Vacation tracking

These are handled by institutional compliance systems to prevent redundant data entry and mitigate accreditation risk.

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js (App Router), React, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend & Auth** | Supabase (PostgreSQL, Row Level Security) |
| **Environment** | GitHub Codespaces |
| **Deployment** | Netlify |

---

## Development Guidelines

### 1. Code Style & Standards
- **Language:** TypeScript throughout (no JavaScript)
- **Component Framework:** React functional components with hooks
- **Routing:** Next.js App Router conventions
- **Styling:** Tailwind CSS utility-first approach
- **File Organization:** Organize by feature modules, not generic types (e.g., `procedures/`, `evaluations/`, `scholarly/`)

### 2. Mobile-First Design
- All features must be mobile-responsive
- Test layouts on small screens first (320px+)
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) consistently
- Prioritize touch-friendly interactions on forms and buttons

### 3. Database & Security
- **ORM:** Use Supabase client libraries
- **Authentication:** Leverage Supabase Row Level Security (RLS) policies
- **Data Access:** Never bypass RLS; ensure all queries respect user context
- **Sensitive Data:** Procedure logs and evaluations contain PII—verify RLS policies are in place
- **Schema Migrations:** Document all schema changes with rollback procedures

### 4. Feature Development Workflow

#### Before Starting
1. Check if the feature falls within **Scope** (procedure tracking, evaluations, scholarly activities, graduation readiness)
2. Verify it doesn't duplicate institutional compliance tracking (duty hours, scheduling, vacation)
3. Identify which core module it belongs to

#### During Development
- Write TypeScript types for all data models (align with Supabase schema)
- Test RLS policies locally before merging
- Ensure mobile responsiveness
- Add error boundaries for graceful failure handling
- Document ACGME-related business logic in code comments

#### Before Merge
- Verify mobile layout on small screens
- Test Supabase query performance (especially for dashboard aggregations)
- Review RLS policies for data isolation
- Test on different network conditions (important for mobile fellows)

### 5. Common Patterns

#### Procedure Logging
- Rapid mobile entry → minimize form fields
- Include procedure category, date, and outcome
- Support offline drafts (consider local storage for connectivity interruptions)

#### Milestone Evaluations
- Dynamically map attending evaluations to current ACGME sub-competencies
- Version competency frameworks when ACGME updates occur
- Calculate aggregated competency progress for APD dashboard

#### Scholarly Activities
- Separate QI projects (ongoing) from deliverables (abstracts, lectures)
- Track completion status and dates
- Support export functionality for accreditation reviews

#### Dashboard & Reporting
- Aggregate procedural counts per category
- Track longitudinal ITE score trends
- Highlight graduation readiness blockers
- Filter data by academic year / rotation block

---

## Deployment & Environment

- **Local Development:** GitHub Codespaces with Node.js 18+
- **Staging:** Deploy via Netlify branch previews
- **Production:** Netlify main branch deployment
- **Database:** Supabase hosted PostgreSQL
- **Secrets:** Use `.env.local` for sensitive credentials (Supabase URL, API key)

### Deployment Checklist
- [ ] All RLS policies reviewed and enabled
- [ ] Environment variables configured in Netlify
- [ ] Mobile responsiveness verified
- [ ] Database backups configured
- [ ] Error logging set up

---

## Common Gotchas & Solutions

| Issue | Solution |
|-------|----------|
| RLS policies blocking queries in production | Verify policies in Supabase dashboard; check JWT tokens include correct user context |
| Mobile forms feel slow | Minimize re-renders; use React Query for efficient data fetching |
| ACGME competency mappings change | Version competency frameworks; include migration guide for existing fellows |
| Offline procedure entries lost | Implement local storage or service worker caching |
| Dashboard slow with large datasets | Add database indexes on fellowship_id, date fields; consider pagination |

---

## Resources & References

- **ACGME Endocrinology Milestones:** Integrated into feature business logic
- **Supabase Docs:** https://supabase.com/docs
- **Next.js App Router:** https://nextjs.org/docs/app
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Questions to Ask Before Changes

1. **Scope:** Does this feature track ACGME metrics, scholarly activities, or procedural competence?
2. **Users:** Who is the primary user (fellow, attending, APD), and how do they access it?
3. **Data Privacy:** Does this involve PII? If yes, verify RLS policies are adequate.
4. **Mobile:** Does this work smoothly on a phone (the fellowship's primary use case)?
5. **Institutional Fit:** Does this duplicate any institutional compliance systems?

---

## Feedback Loop

When working with AI assistants on this project:
- Always reference the **core modules** and **scope exclusions**
- Provide context about ACGME requirements if relevant
- Verify mobile responsiveness is maintained
- Request RLS policy reviews for data-access changes
- Ask for TypeScript types to be explicit and well-documented
