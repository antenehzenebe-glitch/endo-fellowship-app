# SETUP.md — Current State & Remaining Steps

Updated 2026-06-12 after the reconciliation. The **database work is already done in
production** (project `xousmzkftledlkwtpavb`) — migrations `0000`–`0003` were applied
via MCP and live in `supabase/migrations/` as the record. What remains is applying
this code bundle and three one-time manual steps.

## 1. Apply the bundle (Codespaces)

From the repo root:

```bash
unzip -o endo-reconciliation-bundle.zip -d .   # overwrites changed files
bash reconcile.sh                              # deletes the stale v1 files
rm -rf node_modules package-lock.json && npm install
npm run typecheck                              # should be clean
npm run dev
```

`reconcile.sh` removes: the old destructive migrations (`001`, `002`), the old
interface-based `database.types.ts` remnants, and the auto-provisioning
`app/auth/callback/` route. Review it before running — it only deletes files this
bundle replaces or retires.

## 2. Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

Values: Supabase dashboard → Project Settings → API. Only the anon key is used in
app code — never the service-role key. RLS does the enforcing.

> The previously committed `.env.example` contained the real URL and anon key.
> The anon key is RLS-guarded, but since the repo's audience may change, rotate it
> once (Project Settings → API → regenerate anon key) and update `.env.local`.

## 3. Magic-link email template (one-time, Supabase dashboard)

Authentication → Email Templates → **Magic Link** — point the link at the confirm
route:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
```

Also add your site URL(s) under Authentication → URL Configuration → Redirect URLs
(Codespaces preview URL now; Netlify URL at deploy).

## 4. Bootstrap the first account (one-time)

Accounts are invite-only, so the first PD/APD is seeded by hand:

1. Authentication → Users → **Invite user** (their email).
2. SQL editor (service role bypasses RLS — this is the only manual row ever):

```sql
insert into public.profiles (id, role, full_name, email)
values ('<that-user-uuid>', 'apd', 'Program Director', 'pd@example.org');
```

That person then provisions the other 7 users from inside Supabase (invite + insert
profile) until an admin UI exists.

## 5. Seed procedure minimums (one-time, APD decision)

The graduation-readiness math needs targets. As the seeded staff user (or SQL
editor):

```sql
insert into public.procedure_targets (procedure_type, min_total) values
  ('FNA', 10), ('THYROID_US', 20), ('CGM_INTERP', 15)
on conflict (procedure_type) do update set min_total = excluded.min_total;
```

Adjust numbers to the program's actual minimums.

## 6. Deploy (Netlify)

New site → import the GitHub repo → framework auto-detects Next.js. Set the two
env vars in Site configuration → Environment variables. Add the production URL to
Supabase redirect URLs (step 3).

## Verified

- `tsc --noEmit` clean against Next 15.5 / React 19.2 / @supabase/ssr 0.10 / supabase-js 2.108.
- Typed client probe: row types infer correctly (no `never` degradation); invalid
  enum literals rejected at compile time.
- Production database: 11 tables, 33 public RLS policies, 4 storage policies,
  RLS enabled on all tables, security advisors clear of actionable warnings.

## File inventory (this bundle)

```
ARCHITECTURE.md / CLAUDE.md / SKILLS.md / SETUP.md     canonical docs
.github/copilot-instructions.md                        thin redirect
supabase/migrations/0000–0003                          applied migration record
middleware.ts                                          session refresh + auth gate
lib/supabase/{client,server,middleware}.ts             Supabase clients
lib/supabase/database.types.ts                         v2 types (type aliases!)
lib/auth.ts                                            getProfile/requireProfile/roleHome
app/page.tsx                                           role router
app/login/{page,LoginForm}.tsx                         magic-link-only sign-in
app/auth/confirm/route.ts                              token-hash verification
app/auth/signout/route.ts                              sign out
app/log/page.tsx                                       Mobile Procedure Logger
app/dashboard/page.tsx                                 staff dashboard v1
procedures/{actions,ProcedureLogForm,RecentProcedures} logger feature
components/SignOutButton.tsx                           shared UI
package.json / tsconfig / tailwind / postcss / next    aligned configs
.env.example (scrubbed) / .gitignore / reconcile.sh
```
