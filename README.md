# Howard Endocrinology Fellowship App

A lightweight, mobile-responsive internal tool for the Howard University Hospital
Endocrinology, Diabetes & Metabolism fellowship (PGY-4 / PGY-5): program
evaluations, fellow progress tracking, and education & policy materials in one
place.

**Source of truth:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · AI rules:
[`CLAUDE.md`](./CLAUDE.md) · Visual system: [`DESIGN.md`](./DESIGN.md) · Setup:
[`SETUP.md`](./SETUP.md)

### 🛑 Scope & exclusions
Not a replacement for New Innovations or any institutional/ACGME system — this is
the program's day-to-day working copy. **Strictly excludes** duty hours, rotation
scheduling, and vacation tracking (those stay in the institutional RMS).

### 🔒 Privacy
**No PHI, by design.** No patient identifiers exist anywhere in the schema; the
protected data is fellow educational records, isolated with Postgres Row Level
Security.

### ⚙️ Stack
Next.js (App Router) · TypeScript (strict) · Tailwind CSS · Supabase (Postgres,
RLS, Storage) · GitHub Codespaces · Netlify

### 📊 Three pillars
1. **Progress tracking** — de-identified procedure logs vs. program minimums, ITE scores, scholarly activity
2. **Evaluations** — ACGME milestone assessments + assignable evaluation forms
3. **Materials** — education & policy library with read acknowledgments
