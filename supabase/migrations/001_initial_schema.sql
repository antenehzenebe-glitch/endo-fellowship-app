-- Howard University Hospital Endocrinology Fellowship App
-- Initial Database Schema Migration
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('fellow', 'attending', 'apd');
CREATE TYPE pgy_year AS ENUM ('4', '5');
CREATE TYPE procedure_category AS ENUM (
  'Diagnostic Procedure',
  'Therapeutic Procedure',
  'Interpretation & Management',
  'Point-of-Care Ultrasound',
  'Other'
);

-- Common Endocrinology procedures for the fellowship (expandable)
CREATE TYPE endo_procedure_type AS ENUM (
  'Thyroid FNA Biopsy',
  'Neck/Thyroid Ultrasound',
  'Fine Needle Aspiration (Other)',
  'CGM Data Interpretation & Report',
  'Insulin Pump Initiation / Management',
  'Continuous Glucose Monitor Placement/Interpretation',
  'Thyroid Nodule Evaluation',
  'Adrenal Vein Sampling',
  'Pituitary Dynamic Testing Interpretation',
  'Bone Density (DEXA) Interpretation',
  'Other Endocrine Procedure'
);

CREATE TYPE evaluation_rating AS ENUM (
  'Not Yet Competent',
  'Developing',
  'Proficient',
  'Advanced',
  'Expert / Independent'
);

CREATE TYPE scholarly_activity_type AS ENUM (
  'Quality Improvement Project',
  'Research Project',
  'Abstract / Poster Presentation',
  'Oral Presentation / Lecture',
  'Peer-Reviewed Publication',
  'Case Report',
  'Grand Rounds Presentation',
  'Other Scholarly Activity'
);

CREATE TYPE activity_status AS ENUM ('In Progress', 'Completed', 'Submitted', 'Published');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'fellow',
  pgy_year pgy_year,
  fellowship_cohort TEXT, -- e.g. '2025-2027'
  start_date DATE,
  end_date DATE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_fellow_pgy CHECK (
    (role = 'fellow' AND pgy_year IS NOT NULL) OR (role != 'fellow')
  )
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PROCEDURE LOGS
-- ============================================

CREATE TABLE procedure_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fellow_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  procedure_date DATE NOT NULL,
  procedure_type endo_procedure_type NOT NULL,
  category procedure_category NOT NULL,
  attending_id UUID REFERENCES profiles(id), -- supervising attending
  location TEXT,
  outcome_notes TEXT,
  complications TEXT,
  competency_tags TEXT[], -- e.g. {'PC-2', 'MK-1'} or ACGME codes
  is_supervised BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_procedure_logs_updated_at
  BEFORE UPDATE ON procedure_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_procedure_logs_fellow_date ON procedure_logs(fellow_id, procedure_date DESC);
CREATE INDEX idx_procedure_logs_attending ON procedure_logs(attending_id);

-- ============================================
-- MILESTONE EVALUATIONS (ACGME aligned)
-- ============================================

CREATE TABLE milestone_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fellow_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES profiles(id), -- attending or apd
  evaluation_date DATE NOT NULL,
  milestone_code TEXT NOT NULL, -- e.g. 'PC-1 Patient Care', 'MK-3 Medical Knowledge' (use ACGME Endo milestones)
  milestone_description TEXT,
  rating evaluation_rating NOT NULL,
  narrative_feedback TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestone_evals_fellow ON milestone_evaluations(fellow_id, evaluation_date DESC);
CREATE INDEX idx_milestone_evals_evaluator ON milestone_evaluations(evaluator_id);

-- ============================================
-- SCHOLARLY ACTIVITIES
-- ============================================

CREATE TABLE scholarly_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fellow_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type scholarly_activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  completion_date DATE,
  status activity_status DEFAULT 'In Progress',
  outcome TEXT, -- e.g. 'Presented at ENDO 2026', 'Published in JCEM'
  url_or_doi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_scholarly_updated_at
  BEFORE UPDATE ON scholarly_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ONBOARDING / GRADUATION TASKS (for APD dashboard)
-- ============================================

CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fellow_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  category TEXT, -- 'Credentialing', 'Compliance', 'Procedural Minimums', 'Scholarly', 'ITE/Exam'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarly_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
-- Users can view/update their own profile. APDs can view all profiles in the program.
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "APDs can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'apd')
  );

-- PROCEDURE LOGS RLS
-- Fellows: full access to own logs
CREATE POLICY "Fellows manage own procedure logs" ON procedure_logs
  FOR ALL USING (fellow_id = auth.uid());

-- Attendings: can view logs they supervised or all if APD
CREATE POLICY "Attendings view supervised or own program logs" ON procedure_logs
  FOR SELECT USING (
    attending_id = auth.uid() OR 
    fellow_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'apd')
  );

-- Attendings/APD can insert evaluations? Wait, for logs, fellows insert, attendings can update if supervisor?
-- For simplicity, fellows primarily log; attendings can add notes later if needed.

-- MILESTONE EVALUATIONS RLS
-- Evaluators (attendings/APD) can create/update their evaluations
CREATE POLICY "Evaluators manage their evaluations" ON milestone_evaluations
  FOR ALL USING (evaluator_id = auth.uid());

-- Fellows can view evaluations about them
CREATE POLICY "Fellows view own evaluations" ON milestone_evaluations
  FOR SELECT USING (fellow_id = auth.uid());

-- APDs can view all evaluations in program
CREATE POLICY "APDs view all evaluations" ON milestone_evaluations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'apd')
  );

-- SCHOLARLY ACTIVITIES RLS (similar to procedures)
CREATE POLICY "Fellows manage own scholarly activities" ON scholarly_activities
  FOR ALL USING (fellow_id = auth.uid());

CREATE POLICY "APDs and evaluators view program scholarly" ON scholarly_activities
  FOR SELECT USING (
    fellow_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('apd', 'attending'))
  );

-- ONBOARDING TASKS RLS
CREATE POLICY "Fellows view own tasks" ON onboarding_tasks
  FOR SELECT USING (fellow_id = auth.uid());

CREATE POLICY "APDs manage all onboarding tasks" ON onboarding_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'apd')
  );

-- ============================================
-- HELPER FUNCTIONS / VIEWS (for dashboards)
-- ============================================

-- Example: Procedure count per fellow per type (for graduation readiness)
CREATE OR REPLACE VIEW fellow_procedure_counts AS
SELECT 
  fellow_id,
  procedure_type,
  COUNT(*) as count,
  MIN(procedure_date) as first_date,
  MAX(procedure_date) as last_date
FROM procedure_logs
GROUP BY fellow_id, procedure_type;

-- Grant access to views
GRANT SELECT ON fellow_procedure_counts TO authenticated;

-- ============================================
-- SEED DATA (example - remove or adapt for production)
-- ============================================

-- Note: In production, profiles are created via auth signup + trigger.
-- This is for testing only.

-- Example trigger for auto-creating profile on signup (recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, 'fellow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger (uncomment after testing)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TABLE profiles IS 'User profiles with role-based access for Howard Endo Fellowship';
COMMENT ON TABLE procedure_logs IS 'Subspecialty procedure tracking for ACGME compliance';
COMMENT ON TABLE milestone_evaluations IS 'Attending evaluations mapped to ACGME milestones';
COMMENT ON TABLE scholarly_activities IS 'QI, research, presentations tracking';
COMMENT ON TABLE onboarding_tasks IS 'Graduation readiness checklist managed by APD';
