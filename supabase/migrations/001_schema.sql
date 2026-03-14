-- ============================================================
-- Real Holat: Complete Database Schema
-- Tables, Views, RLS Policies, and Storage
-- ============================================================

-- 1. Cached school data from GEOASR government API
CREATE TABLE IF NOT EXISTS schools_cache (
  id SERIAL PRIMARY KEY,
  api_uid INTEGER UNIQUE,
  name TEXT NOT NULL,
  name_ru TEXT,
  district TEXT,
  region TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  student_count INTEGER,
  built_year TEXT,
  last_renovation TEXT,
  image_url TEXT,
  sport_hall TEXT,
  cafeteria TEXT,
  internet TEXT,
  water_supply TEXT,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User profiles with roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'government')),
  district TEXT,
  school_id INTEGER REFERENCES schools_cache(id),
  inspection_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Government promises per school
CREATE TABLE IF NOT EXISTS promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INTEGER NOT NULL REFERENCES schools_cache(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'fulfilled', 'problematic')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Citizen inspections (core feature)
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promise_id UUID NOT NULL REFERENCES promises(id),
  school_id INTEGER NOT NULL REFERENCES schools_cache(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  is_fulfilled BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Government responses
CREATE TABLE IF NOT EXISTS gov_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id),
  responder_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('acknowledged', 'in_progress', 'resolved')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Dashboard Stats View
-- ============================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(DISTINCT school_id) FROM inspections) as schools_inspected,
  (SELECT COUNT(*) FROM inspections) as total_inspections,
  (SELECT ROUND(AVG(CASE WHEN is_fulfilled THEN 1.0 ELSE 0.0 END) * 100) FROM inspections) as fulfillment_pct,
  (SELECT COUNT(*) FROM inspections WHERE NOT is_fulfilled) as total_issues,
  (SELECT COUNT(DISTINCT user_id) FROM inspections) as total_inspectors,
  (SELECT COUNT(*) FROM gov_responses) as total_responses;

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE schools_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov_responses ENABLE ROW LEVEL SECURITY;

-- Schools: anyone can read
CREATE POLICY "Anyone can read schools" ON schools_cache FOR SELECT USING (true);

-- Profiles: anyone can read, users can insert/update own
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Promises: anyone can read, authenticated can insert/update
CREATE POLICY "Anyone can read promises" ON promises FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert promises" ON promises FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update promises" ON promises FOR UPDATE USING (auth.role() = 'authenticated');

-- Inspections: anyone can read, authenticated can insert (own)
CREATE POLICY "Anyone can read inspections" ON inspections FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert inspections" ON inspections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gov responses: anyone can read, authenticated can insert (own)
CREATE POLICY "Anyone can read gov_responses" ON gov_responses FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert gov_responses" ON gov_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);

-- ============================================================
-- Storage: inspection photos bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read photos" ON storage.objects FOR SELECT USING (bucket_id = 'inspection-photos');
CREATE POLICY "Authenticated can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');
