-- 0017_meeting_minutes.sql
-- Monthly meeting minutes in the materials library.
-- Adds a 'minutes' resource category plus meeting_year / meeting_month columns
-- so minutes can be organized folder-style by year and month in the UI.

ALTER TYPE resource_category ADD VALUE IF NOT EXISTS 'minutes';

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS meeting_year smallint,
  ADD COLUMN IF NOT EXISTS meeting_month smallint
    CHECK (meeting_month IS NULL OR meeting_month BETWEEN 1 AND 12);

COMMENT ON COLUMN resources.meeting_year IS
  'Calendar year of the meeting (only set when category = ''minutes''). NULL for all other categories.';
COMMENT ON COLUMN resources.meeting_month IS
  'Calendar month of the meeting, 1-12 (only set when category = ''minutes''). NULL for all other categories.';

-- Speeds up the grouped listing of minutes by year/month.
CREATE INDEX IF NOT EXISTS resources_minutes_year_month_idx
  ON resources (meeting_year, meeting_month)
  WHERE category = 'minutes';
