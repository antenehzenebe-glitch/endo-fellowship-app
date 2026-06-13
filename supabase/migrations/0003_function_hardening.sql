-- Security-advisor hardening (all WARN-level findings).
-- ✅ APPLIED to production on 2026-06-12 via MCP. Repo record — do not re-run.

-- 1) Pin search_path on the trigger helper.
alter function public.set_updated_at() set search_path = public;

-- 2) SECURITY DEFINER functions should not be callable via the REST RPC surface.
--    is_staff/is_evaluator keep EXECUTE for `authenticated` because RLS policy
--    expressions evaluate them under the caller's role. The only thing a signed-in
--    user can learn by calling them is their own role status — acceptable.
revoke execute on function public.is_staff()           from public, anon;
revoke execute on function public.is_evaluator()       from public, anon;
revoke execute on function public.guard_profile_role() from public, anon, authenticated;
revoke execute on function public.set_updated_at()     from public, anon, authenticated;

-- 3) rls_auto_enable() is a pre-existing event-trigger safety net (auto-enables
--    RLS on new public tables via event trigger `ensure_rls`). Kept deliberately;
--    documented here so it is no longer unmanaged residue.
revoke execute on function public.rls_auto_enable()    from public, anon, authenticated;

-- ROLLBACK:
-- grant execute on function public.is_staff(), public.is_evaluator(),
--   public.guard_profile_role(), public.set_updated_at(), public.rls_auto_enable()
--   to public, anon, authenticated;
