-- Reset: remove the partial v1/hybrid schema before deploying the validated v2.
-- All tables verified empty (0 rows) on 2026-06-12. Approved by program lead.
-- ✅ APPLIED to production (project xousmzkftledlkwtpavb) on 2026-06-12 via MCP.
-- Kept in the repo as the migration record — do not re-run.

drop view if exists public.fellow_procedure_counts cascade;

drop table if exists
  public.resource_acknowledgments, public.resources, public.onboarding_tasks,
  public.evaluations, public.evaluation_forms, public.milestone_assessments,
  public.milestone_evaluations, public.scholarly_activities, public.ite_scores,
  public.procedure_targets, public.procedure_logs, public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_updated_at_column() cascade;
drop function if exists public.guard_profile_role() cascade;
drop function if exists public.is_evaluator() cascade;
drop function if exists public.is_staff() cascade;
drop function if exists public.set_updated_at() cascade;

drop type if exists
  public.user_role, public.pgy_year, public.pgy_level,
  public.procedure_category, public.endo_procedure_type, public.procedure_type,
  public.procedure_outcome, public.evaluation_rating, public.task_status,
  public.acgme_competency, public.evaluation_type, public.resource_category,
  public.scholarly_activity_type, public.scholarly_type, public.scholarly_status,
  public.activity_status cascade;
