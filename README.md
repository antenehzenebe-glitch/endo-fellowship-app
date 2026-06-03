# Howard Endocrinology Fellowship App

A lightweight, mobile-responsive web application designed to track ACGME-required metrics, scholarly activities, and procedural competence for the two-year (PGY-4 and PGY-5) Endocrinology, Diabetes, and Metabolism fellowship program at Howard University Hospital.

### 🛑 Architectural Scope & Exclusions
To prevent redundant data entry and mitigate accreditation risk, **this system strictly excludes duty hours, generic rotation scheduling, and vacation tracking.** Those institutional compliance metrics remain managed by the hospital's enterprise Residency Management System (RMS). This application functions exclusively as a highly targeted, subspecialty-specific academic and clinical companion.

### ⚙️ Technical Stack
* **Frontend:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS
* **Backend & Auth:** Supabase (PostgreSQL, Row Level Security)
* **Environment:** GitHub Codespaces
* **Deployment:** Netlify

### 📊 Core Modules
1. **Procedure Logs:** Rapid mobile-entry for subspecialty procedures (e.g., FNA, Thyroid Ultrasound, CGM Interpretation).
2. **Milestone Evaluations:** Attending evaluations dynamically linked to current ACGME sub-competencies.
3. **Scholarly Tracking:** Separation of longitudinal QI projects and deliverable academic activities (abstracts, internal lectures).
4. **Graduation Readiness:** APD dashboard tracking longitudinal ITE scores, procedural minimums, and onboarding compliance.