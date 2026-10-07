-- =====================================================================
-- AGRI-AURA (Autonomous Agricultural Reasoning & Action System)
-- Production Supabase PostgreSQL Database Schema & Row-Level Security
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
DO $$ BEGIN
  CREATE TYPE advisory_status AS ENUM (
    'DRAFT',
    'ANALYZING',
    'AWAITING_APPROVAL',
    'APPROVED',
    'EXECUTED',
    'REJECTED',
    'FAILED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM (
    'LOW',
    'MODERATE',
    'HIGH',
    'CRITICAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_role AS ENUM (
    'PLANNER',
    'RESEARCHER',
    'DECISION',
    'VERIFIER',
    'EXECUTOR',
    'COMMUNICATOR'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  farm_name TEXT,
  role TEXT DEFAULT 'farm_manager' CHECK (role IN ('farm_manager', 'agronomist', 'field_worker')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Advisories Table (Core Records)
CREATE TABLE IF NOT EXISTS crop_advisories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_size_acres NUMERIC(8, 2) NOT NULL,
  crop_type TEXT NOT NULL,
  growth_stage TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  soil_ph NUMERIC(3, 1) NOT NULL,
  soil_n_status TEXT NOT NULL,
  soil_p_status TEXT NOT NULL,
  soil_k_status TEXT NOT NULL,
  soil_moisture_pct NUMERIC(5, 2) NOT NULL,
  recent_rainfall_mm NUMERIC(6, 2) DEFAULT 0,
  temperature_celsius NUMERIC(4, 1) NOT NULL,
  humidity_pct NUMERIC(4, 1) NOT NULL,
  observed_symptoms TEXT NOT NULL,
  symptom_distribution TEXT NOT NULL,
  status advisory_status DEFAULT 'ANALYZING',
  overall_risk_level risk_level DEFAULT 'LOW',
  requires_human_approval BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approval_timestamp TIMESTAMPTZ,
  final_summary TEXT,
  worker_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agent Execution Events (Decision Trace)
CREATE TABLE IF NOT EXISTS advisory_agent_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisory_id UUID NOT NULL REFERENCES crop_advisories(id) ON DELETE CASCADE,
  agent agent_role NOT NULL,
  step_number INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'WARNING')),
  summary TEXT NOT NULL,
  reasoning_trace JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  latency_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recommended Action Items / Field Tasks
CREATE TABLE IF NOT EXISTS advisory_action_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisory_id UUID NOT NULL REFERENCES crop_advisories(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CHEMICAL_SYNTHETIC', 'ORGANIC_BIOLOGICAL', 'FERTIGATION_MINERAL', 'CULTURAL_MECHANICAL')),
  dosage_or_rate TEXT,
  application_method TEXT NOT NULL,
  scheduled_date DATE,
  pre_harvest_interval_days INT DEFAULT 0,
  is_high_risk BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. System Analytics & Telemetry Log
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key TEXT NOT NULL UNIQUE,
  numeric_value NUMERIC(12, 2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial metrics seed
INSERT INTO system_metrics (metric_key, numeric_value) VALUES
  ('total_advisories_executed', 142.0),
  ('successful_interventions', 137.0),
  ('chemical_risks_prevented', 39.0),
  ('water_cubic_meters_saved', 18450.0)
ON CONFLICT (metric_key) DO NOTHING;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_action_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Crop Advisories Policies
DROP POLICY IF EXISTS "Users can select own crop advisories" ON crop_advisories;
CREATE POLICY "Users can select own crop advisories"
  ON crop_advisories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own crop advisories" ON crop_advisories;
CREATE POLICY "Users can insert own crop advisories"
  ON crop_advisories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own crop advisories" ON crop_advisories;
CREATE POLICY "Users can update own crop advisories"
  ON crop_advisories FOR UPDATE
  USING (auth.uid() = user_id);

-- Agent Events Policies
DROP POLICY IF EXISTS "Users can view agent events for their advisories" ON advisory_agent_events;
CREATE POLICY "Users can view agent events for their advisories"
  ON advisory_agent_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crop_advisories
      WHERE crop_advisories.id = advisory_agent_events.advisory_id
      AND crop_advisories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service backend can insert agent events" ON advisory_agent_events;
CREATE POLICY "Service backend can insert agent events"
  ON advisory_agent_events FOR INSERT
  WITH CHECK (true);

-- Action Tasks Policies
DROP POLICY IF EXISTS "Users can view action tasks for their advisories" ON advisory_action_tasks;
CREATE POLICY "Users can view action tasks for their advisories"
  ON advisory_action_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crop_advisories
      WHERE crop_advisories.id = advisory_action_tasks.advisory_id
      AND crop_advisories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update action tasks for their advisories" ON advisory_action_tasks;
CREATE POLICY "Users can update action tasks for their advisories"
  ON advisory_action_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM crop_advisories
      WHERE crop_advisories.id = advisory_action_tasks.advisory_id
      AND crop_advisories.user_id = auth.uid()
    )
  );

-- System Metrics Policies
DROP POLICY IF EXISTS "Authenticated users can read system metrics" ON system_metrics;
CREATE POLICY "Authenticated users can read system metrics"
  ON system_metrics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read system metrics" ON system_metrics;
CREATE POLICY "Public can read system metrics"
  ON system_metrics FOR SELECT
  TO anon
  USING (true);
