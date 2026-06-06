# Copilot Instructions for Howard Endocrinology Fellowship App

## Project Context

**Repository:** antenehzenebe-glitch/endo-fellowship-app  
**Description:** A mobile-first ACGME metric-tracking and clinical evaluation application engineered specifically for the Howard University Hospital Endocrinology, Diabetes, and Metabolism Fellowship.

This document provides AI assistants (including GitHub Copilot) with essential project context, constraints, and best practices to ensure consistent, compliant, and high-quality contributions.

---

## Project Overview & Scope

### Core Purpose
The Howard Endocrinology Fellowship App tracks:
1. **Procedure Logs** – ACGME-required subspecialty procedures (FNA, thyroid ultrasound, CGM interpretation)
2. **Milestone Evaluations** – Attending evaluations mapped to ACGME sub-competencies
3. **Scholarly Activities** – Longitudinal QI projects and academic deliverables (abstracts, lectures)
4. **Graduation Readiness** – APD dashboard tracking procedural minimums, ITE scores, and compliance

### Architectural Exclusions
**Explicitly NOT handled by this application:**
- ❌ Duty hours tracking
- ❌ Generic rotation scheduling
- ❌ Vacation/time-off tracking
- ❌ General institutional HR systems

**Rationale:** These are covered by institutional compliance systems. Including them risks redundant data entry and accreditation complications.

### Users
- **Fellows (PGY-4 & PGY-5)** – Mobile-first rapid data entry
- **Attending Physicians** – Evaluation input, milestone assessment
- **Program Directors (APDs)** – Dashboard, graduation readiness, compliance tracking

---

## Technical Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Frontend** | Next.js (App Router), React, TypeScript | Strict typing required |
| **Styling** | Tailwind CSS | Utility-first, responsive design |
| **Backend & Auth** | Supabase (PostgreSQL, RLS) | Row Level Security mandatory for data isolation |
| **Environment** | GitHub Codespaces | Primary dev environment |
| **Deployment** | Netlify | Main branch auto-deploys to production |

### Key Dependencies
- **Supabase Client:** For database and authentication
- **React Query:** For efficient data fetching (if needed)
- **Tailwind CSS:** For all styling (no custom CSS unless absolutely necessary)
- **TypeScript:** All code must be typed; no `any` types

---

## Code Standards & Best Practices

### TypeScript
- ✅ **Required:** Explicit type annotations for all functions, parameters, and return types
- ✅ **Required:** No `any` types; use `unknown` and type guards instead
- ✅ **Required:** Interface definitions for all data models (align with Supabase schema)
- ✅ **Preferred:** Strict mode enabled (`"strict": true` in `tsconfig.json`)

```typescript
// ✅ Good
interface ProcedureLog {
  id: string;
  fellowshipId: string;
  procedureType: 'FNA' | 'THYROID_US' | 'CGM_INTERP';
  datePerformed: Date;
  outcome: 'successful' | 'learning' | 'incomplete';
  notes: string;
}

async function logProcedure(data: ProcedureLog): Promise<void> {
  // Implementation
}

// ❌ Bad
function logProcedure(data: any) {
  // No type safety
}
```

### Component Structure
- ✅ **Functional components** with React hooks only (no class components)
- ✅ **One component per file** (unless small shared sub-components)
- ✅ **Organized by feature:** `src/procedures/`, `src/evaluations/`, `src/scholarly/`, `src/dashboard/`
- ✅ **Separate concerns:** UI components, data fetching (hooks), utilities
- ✅ **Props interfaces** always defined explicitly

```typescript
// ✅ Good structure
// src/procedures/ProcedureLogForm.tsx
interface ProcedureLogFormProps {
  onSubmit: (data: ProcedureLog) => Promise<void>;
  isLoading?: boolean;
}

export function ProcedureLogForm({ onSubmit, isLoading = false }: ProcedureLogFormProps) {
  // Component code
}
```

### Mobile-First Development
- ✅ **Design for 320px first** – All layouts must work on small phones
- ✅ **Responsive breakpoints:** Use Tailwind's `sm:`, `md:`, `lg:` prefixes
- ✅ **Touch targets:** Minimum 44×44px for all interactive elements
- ✅ **One-handed operation:** Keep forms and buttons reachable with thumb on phone
- ✅ **Test on real devices** – Emulators are useful, but test on actual phones when possible

```tsx
// ✅ Good mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4 py-6">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

<button className="w-full px-4 py-3 sm:px-6 sm:py-2">
  {/* Full-width on mobile, auto on larger screens */}
</button>
```

### Database & Security

#### Row Level Security (RLS) – CRITICAL
- ✅ **All queries must respect RLS policies**
- ✅ **Never bypass RLS** – Always use authenticated Supabase client
- ✅ **Verify RLS policies** before merging PRs with data access changes
- ✅ **Test RLS locally** in development and on staging

```typescript
// ✅ Good – RLS enforced by Supabase client
const { data, error } = await supabase
  .from('procedure_logs')
  .select('*')
  .eq('fellowship_id', fellowshipId);

// ❌ Bad – Direct SQL that could bypass RLS
const result = await fetch('/api/raw-sql', {
  body: JSON.stringify({ query: 'SELECT * FROM procedure_logs' })
});
```

#### Data Privacy
- ✅ Procedure logs and evaluations contain **PII (Personally Identifiable Information)**
- ✅ Always verify RLS policies isolate data by fellowship
- ✅ Don't log sensitive data (procedure details, patient names) to console in production
- ✅ Document all data retention policies aligned with institutional requirements

### Error Handling
- ✅ **Never generic errors** – Provide specific, actionable messages
- ✅ **User-friendly messages** – Avoid technical jargon for non-technical users
- ✅ **Error boundaries** – Wrap feature sections in error boundaries

```typescript
// ✅ Good
if (!result.data) {
  return <div className="text-red-600">Failed to load procedure history. Please refresh.</div>;
}

// ❌ Bad
if (!result.data) {
  return <div>Error: {result.error}</div>;
}
```

---

## ACGME Compliance & Domain Logic

### Key Principles
- ✅ All **procedure tracking** must map to ACGME minimum requirements
- ✅ **Milestone evaluations** must align with current ACGME competency framework
- ✅ **Graduation readiness** must account for both competency and procedural minimums
- ✅ **Scholarly activities** must separate QI projects from deliverable outputs

### Procedure Categories (ACGME Endocrinology)
- Fine Needle Aspiration (FNA)
- Thyroid Ultrasound
- CGM Interpretation
- *(Additional procedures per program requirements)*

**When adding new procedures:** Document ACGME requirement mapping in code comments.

### Competency Framework
- Patient Care
- Medical Knowledge
- Interpersonal Communication
- Professionalism
- Systems-Based Practice
- Practice-Based Learning
- Personal Improvement

**When adding evaluations:** Map attending observations to these competencies explicitly.

### Documentation Requirements
- Include **ACGME references** in code comments for business logic
- Document **minimum requirements** (e.g., "FNA minimum: 10 per year")
- Explain **versioning strategy** if competency frameworks change

```typescript
// ✅ Good – ACGME context documented
/**
 * Tracks Fine Needle Aspiration procedures per ACGME Endocrinology milestones.
 * Minimum: 10 procedures per PGY-4/5 year
 * Reference: ACGME Endocrinology Milestones, Patient Care 2
 */
interface FNALog extends ProcedureLog {
  procedureType: 'FNA';
  noduleSize: number; // mm
  cellularity: 'diagnostic' | 'non-diagnostic' | 'learning';
}
```

---

## Mobile & UX Standards

### Mobile-First Checklist
- [ ] Layout works on 320px portrait screens
- [ ] All buttons and links are 44×44px minimum (with padding)
- [ ] Forms use native inputs on mobile (native date picker, etc.)
- [ ] Single-column layout on mobile; expand on tablets/desktop
- [ ] No hover-only interactions; all features accessible via tap
- [ ] Touch targets have sufficient spacing (8px gap minimum)

### Accessibility (WCAG 2.1 AA Minimum)
- ✅ **Semantic HTML:** Use `<button>`, `<a>`, `<form>`, `<label>`, not generic divs
- ✅ **Color + Icons:** Never use color alone to indicate status (pair with icons/text)
- ✅ **Contrast Ratios:** Text on background 4.5:1, UI components 3:1
- ✅ **Keyboard Navigation:** All features accessible via Tab key
- ✅ **Screen Readers:** Test with NVDA or VoiceOver; proper ARIA labels
- ✅ **Focus Indicators:** Visible focus on all interactive elements

```tsx
// ✅ Good – Accessible
<label htmlFor="procedure-date" className="block text-sm font-semibold mb-2">
  Procedure Date
</label>
<input
  id="procedure-date"
  type="date"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

// ❌ Bad – Not accessible
<input type="date" placeholder="Date" />
```

---

## Git & PR Workflow

### Branch Naming
- `feature/procedure-logging` – New feature
- `fix/rls-policy-bug` – Bug fix
- `docs/update-acgme-refs` – Documentation
- `refactor/component-structure` – Code refactoring

### Commit Messages
```
format: type(scope): brief description

feature(procedures): add FNA procedure logging form
fix(dashboard): correct ITE score calculation
docs(acgme): update competency framework references
```

### PR Requirements
- ✅ **Title:** Clear, descriptive (not "Fix stuff")
- ✅ **Description:** What, why, how. Link related issues.
- ✅ **Mobile verification:** PR author tested on mobile/responsive design
- ✅ **RLS review:** Any data access changes require security review
- ✅ **Tests pass:** All CI checks green before merge
- ✅ **Code review:** At least one approval before merging

### PR Checklist (for contributors)
```markdown
## Changes
- [ ] Feature/fix described in detail
- [ ] Related issues linked

## Testing
- [ ] Mobile responsive tested (320px+)
- [ ] Form validation works
- [ ] RLS policies verified (if data access changed)
- [ ] Error handling tested
- [ ] Accessibility checked (keyboard nav, screen reader)

## Code Quality
- [ ] TypeScript types are explicit
- [ ] No `console.log()` in production code
- [ ] ACGME references documented (if business logic)
- [ ] Component follows project structure

## Deployment
- [ ] `.env` variables documented
- [ ] Netlify preview tested
```

---

## Testing & QA

### Testing Approach
- ✅ **Unit tests** for utilities, hooks, complex logic
- ✅ **Integration tests** for data fetching and RLS scenarios
- ✅ **Mobile testing** on real devices (at least iOS and Android)
- ✅ **Accessibility testing** with keyboard and screen readers
- ✅ **ACGME validation** by domain expert

### Testing Commands
```bash
# Run tests
npm test

# Test coverage
npm test -- --coverage

# Mobile/responsive testing
# Manual: Use browser DevTools responsive design mode
# Or: Use device/emulator directly

# Accessibility audit
# Run in DevTools Lighthouse
```

### RLS Policy Testing
```typescript
// Test RLS isolation
1. Create test user A (fellowship_id_a)
2. Log procedure as user A
3. Switch to test user B (fellowship_id_b)
4. Verify user B cannot see user A's procedures
5. Verify user A can still see their own procedures
```

---

## Common Patterns & Anti-Patterns

### ✅ Good Patterns

**1. Feature-based folder structure**
```
src/
  procedures/
    components/
    hooks/
    types.ts
  evaluations/
    components/
    hooks/
    types.ts
```

**2. Custom hooks for data fetching**
```typescript
export function useProcedureLogs(fellowshipId: string) {
  const [data, setData] = useState<ProcedureLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch with RLS
  }, [fellowshipId]);
  
  return { data, loading };
}
```

**3. Type-safe form handling**
```typescript
interface FormData extends ProcedureLog {
  // ...
}

function handleSubmit(data: FormData) {
  // Validated & typed
}
```

### ❌ Anti-Patterns (Avoid)

**1. Inline RLS bypasses**
```typescript
// ❌ NEVER do this
const data = await fetch('/api/procedures?user=1234'); // Manual auth check
```

**2. Generic error handling**
```typescript
// ❌ Bad
catch (error) {
  console.log(error);
  setError('Something went wrong');
}

// ✅ Good
catch (error) {
  console.error('Failed to save procedure:', error);
  setError('Failed to save procedure. Please check your connection and try again.');
}
```

**3. Mixing concerns**
```typescript
// ❌ Bad – API logic in component
function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
}

// ✅ Good – Extract to hook
function useData() {
  // Data fetching logic
}

function MyComponent() {
  const data = useData();
}
```

---

## Performance & Optimization

### Frontend Performance
- ✅ **Lazy loading** for images (use Next.js `<Image>`)
- ✅ **Code splitting** for large features (Next.js automatic)
- ✅ **Minimize re-renders** – Use `useMemo`, `useCallback` judiciously
- ✅ **Bundle size** – Monitor with `next/bundle-analyzer`

### Database Performance
- ✅ **Query optimization** – Add indexes on frequently filtered columns
- ✅ **Pagination** for large lists (don't fetch all 10k procedures at once)
- ✅ **Aggregation** for dashboard (pre-compute counts if expensive)
- ✅ **Monitor slow queries** in Supabase dashboard

```typescript
// ✅ Good – Paginated query
const { data } = await supabase
  .from('procedure_logs')
  .select('*')
  .eq('fellowship_id', fellowshipId)
  .order('date_performed', { ascending: false })
  .range(0, 49) // First 50
  .limit(50);
```

---

## Deployment & Environment

### Environment Variables
```env
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Netlify (production)
# Configure in Netlify dashboard → Build & Deploy → Environment
```

### Deployment Checklist
- [ ] All RLS policies reviewed and enabled in production
- [ ] Environment variables configured in Netlify
- [ ] Mobile responsiveness verified
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] HTTPS enabled (automatic on Netlify)

### Rollback Strategy
If production issue:
1. Revert commit or deploy previous version from Netlify
2. Investigate root cause
3. Fix locally, test thoroughly
4. Create PR with fix and additional test coverage
5. Merge and redeploy

---

## When to Ask for Help

### Escalation Path
- **TypeScript/React questions** → Check CLAUDE.md & SKILLS.md first
- **ACGME/domain questions** → Consult with domain expert (QA & Compliance Lead)
- **Database/RLS questions** → Consult Backend Developer / Database Specialist
- **Mobile/UX questions** → Check DESIGN.md, then consult Frontend Developer
- **Architecture decisions** → Consult Technical Lead (team discussion)

### Common Questions
**Q: Where should I put this new file?**  
A: Follow the feature-based structure. If it's part of procedures, put it in `src/procedures/`.

**Q: Do I need to write tests?**  
A: Yes, for business logic, utilities, and complex components. UI components can have snapshot tests.

**Q: How do I verify RLS is working?**  
A: Test with multiple user accounts; verify data isolation in Supabase editor.

**Q: What if ACGME requirements change?**  
A: Document changes in a migration. Version competency frameworks. Notify APD.

---

## Resources & Documentation

### Project Documentation
- **README.md** – Project overview and setup
- **CLAUDE.md** – AI development guidelines
- **DESIGN.md** – UI/UX system and components
- **SKILLS.md** – Team expertise and learning paths
- **.github/copilot-instructions.md** – This file

### External Resources
- **ACGME Endocrinology Milestones:** https://www.acgme.org/specialties/milestones
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

### Testing & Tools
- **Lighthouse (DevTools)** – Performance & accessibility audits
- **NVDA** – Screen reader (Windows)
- **VoiceOver** – Screen reader (Mac)
- **WebAIM Contrast Checker** – Color accessibility
- **Supabase Dashboard** – Database management, RLS policy testing

---

## Final Guidelines

### Before You Start Coding
1. ✅ Read this file and CLAUDE.md
2. ✅ Check if your change falls within project scope
3. ✅ Verify you understand the ACGME requirement (if applicable)
4. ✅ Plan mobile-first design and RLS implications
5. ✅ Create a PR early for feedback if it's a large feature

### During Development
- ✅ Use TypeScript strictly; no `any` types
- ✅ Test on mobile (actual device or emulator)
- ✅ Verify RLS policies protect data
- ✅ Write error messages for users, not developers
- ✅ Document ACGME context in code comments

### Before You Submit a PR
- ✅ Mobile responsive? (tested on 320px+)
- ✅ Accessible? (keyboard nav, screen reader)
- ✅ RLS verified? (if data access changed)
- ✅ TypeScript strict? (no `any` types)
- ✅ Tests pass? (CI/CD green)
- ✅ ACGME requirement documented? (if business logic)

### After PR Approval
- ✅ Merge with clear commit message
- ✅ Netlify preview builds and deploys
- ✅ Verify production deployment
- ✅ Monitor for errors in production
- ✅ Celebrate! 🎉

---

## Questions?

If anything is unclear:
1. Check the relevant documentation file (CLAUDE.md, DESIGN.md, SKILLS.md)
2. Look for similar patterns in existing code
3. Ask in GitHub discussion or team channel
4. Create an issue if it's a gap in documentation

---

**Last Updated:** June 2026  
**Maintained By:** [Project Lead]  
**Next Review:** [Quarterly]
