-- Fix for existing custom types (user_role, etc.)
-- Run this FIRST if you got 'type already exists' errors

-- Drop existing types if they exist (safe because we're in early development)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS pgy_year CASCADE;
DROP TYPE IF EXISTS procedure_category CASCADE;
DROP TYPE IF EXISTS endo_procedure_type CASCADE;
DROP TYPE IF EXISTS evaluation_rating CASCADE;
DROP TYPE IF EXISTS scholarly_activity_type CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;

-- Now re-create them cleanly
CREATE TYPE user_role AS ENUM ('fellow', 'attending', 'apd');
CREATE TYPE pgy_year AS ENUM ('4', '5');
CREATE TYPE procedure_category AS ENUM (
  'Diagnostic Procedure',
  'Therapeutic Procedure',
  'Interpretation & Management',
  'Point-of-Care Ultrasound',
  'Other'
);
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

COMMENT ON TYPE user_role IS 'User roles for Howard Endo Fellowship access control';
