-- 0016_schedule_publish_flags.sql
-- Per-scope publish state for the program schedule.
--
-- The schedule has two SEPARATELY-publishable views per academic year:
--   • the yearly block grid   -> config.blocks   -> *_blocks_published_*
--   • the monthly didactic cal -> config.months  -> *_months_published_*
-- Publishing a view stamps WHEN and BY WHOM, drives the app-wide
-- "schedule published" banner, and (in 4b) will trigger the roster email.
--
-- These are TOP-LEVEL columns, NOT inside config, on purpose: saveSchedule()
-- overwrites the entire config jsonb on every edit, which would clobber publish
-- state if it lived there. This mirrors is_current / updated_by, which are also
-- top-level. All nullable; NULL = not yet published.
--
-- Access: no new policy needed. Existing program_schedule RLS already grants
-- read = true (everyone can see publish state for the banner) and
-- update = is_staff() OR is_fellow(); the publishSchedule() server action adds a
-- staff-only check on top (defence in depth), exactly like setCurrentYear().

alter table public.program_schedule
  add column if not exists blocks_published_at timestamptz,
  add column if not exists blocks_published_by uuid,
  add column if not exists months_published_at timestamptz,
  add column if not exists months_published_by uuid;
