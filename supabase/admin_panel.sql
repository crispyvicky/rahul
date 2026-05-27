-- Admin panel tables — run in Supabase SQL Editor after migration.sql + finish_setup.sql

-- Instagram / story claim approval queue
CREATE TABLE IF NOT EXISTS point_claim_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('follow', 'share_story')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  proof_url TEXT,
  instagram_username TEXT,
  phone TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE point_claim_requests
  ADD COLUMN IF NOT EXISTS instagram_username TEXT;

ALTER TABLE point_claim_requests
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Partial unique: only one pending per user+action (Postgres 15+ use partial index)
DROP INDEX IF EXISTS point_claim_requests_one_pending;
CREATE UNIQUE INDEX point_claim_requests_one_pending
  ON point_claim_requests (user_id, action)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON point_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_user ON point_claim_requests(user_id);

-- Record giveaway winners
CREATE TABLE IF NOT EXISTS giveaway_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL DEFAULT 1,
  prize TEXT,
  notes TEXT,
  announced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (giveaway_id, user_id)
);

ALTER TABLE point_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "claim_requests_select" ON point_claim_requests;
CREATE POLICY "claim_requests_select" ON point_claim_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "claim_requests_insert" ON point_claim_requests;
CREATE POLICY "claim_requests_insert" ON point_claim_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "claim_requests_update" ON point_claim_requests;
CREATE POLICY "claim_requests_update" ON point_claim_requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "giveaway_winners_select" ON giveaway_winners;
CREATE POLICY "giveaway_winners_select" ON giveaway_winners FOR SELECT USING (true);

DROP POLICY IF EXISTS "giveaway_winners_insert" ON giveaway_winners;
CREATE POLICY "giveaway_winners_insert" ON giveaway_winners FOR INSERT WITH CHECK (true);
