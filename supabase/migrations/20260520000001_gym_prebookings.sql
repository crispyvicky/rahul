-- Gym pre-bookings (physical RahulFitzz training hub — opening later 2026)
CREATE TABLE IF NOT EXISTS gym_prebookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gym_prebookings_email_lower_idx
  ON gym_prebookings (lower(trim(email)));

ALTER TABLE gym_prebookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gym_prebookings_insert_public" ON gym_prebookings;
CREATE POLICY "gym_prebookings_insert_public"
  ON gym_prebookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "gym_prebookings_no_public_read" ON gym_prebookings;
CREATE POLICY "gym_prebookings_no_public_read"
  ON gym_prebookings FOR SELECT
  USING (false);
