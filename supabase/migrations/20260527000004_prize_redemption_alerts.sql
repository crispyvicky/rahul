-- Alerts when a user reaches a prize-sheet tier (admin fulfills physical prizes)

CREATE TABLE IF NOT EXISTS prize_redemption_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL,
  prize_name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  user_points_at_unlock INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'fulfilled', 'dismissed')),
  user_note TEXT,
  admin_note TEXT,
  fulfilled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  UNIQUE (user_id, tier_id)
);

CREATE INDEX IF NOT EXISTS idx_prize_redemption_alerts_status
  ON prize_redemption_alerts(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prize_redemption_alerts_user
  ON prize_redemption_alerts(user_id);

ALTER TABLE prize_redemption_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prize_redemption_alerts_select" ON prize_redemption_alerts;
CREATE POLICY "prize_redemption_alerts_select" ON prize_redemption_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "prize_redemption_alerts_insert" ON prize_redemption_alerts;
CREATE POLICY "prize_redemption_alerts_insert" ON prize_redemption_alerts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "prize_redemption_alerts_update" ON prize_redemption_alerts;
CREATE POLICY "prize_redemption_alerts_update" ON prize_redemption_alerts FOR UPDATE USING (true);

-- Backfill: users who already crossed a tier get a pending alert (once per tier)
INSERT INTO prize_redemption_alerts (user_id, tier_id, prize_name, points_required, user_points_at_unlock, status)
SELECT u.id, t.tier_id, t.prize_name, t.points_required, u.giveaway_points, 'pending'
FROM user_profiles u
CROSS JOIN (
  VALUES
    ('t1', 'Shaker Bottle', 300),
    ('t2', 'Gym Gloves', 600),
    ('t3', 'Resistance Bands Set', 1000),
    ('t4', 'Skipping Rope', 1500),
    ('t5', 'Yoga Mat', 2200),
    ('t6', 'Whey Protein (1kg)', 3000),
    ('t7', 'Pre-Workout + Multivitamins', 4500),
    ('t8', 'Foam Roller + Ab Wheel', 6000),
    ('t9', 'Plant Protein + Peanut Butter', 8000),
    ('t10', 'Supplement Stack (Whey + Pre)', 10000)
) AS t(tier_id, prize_name, points_required)
WHERE u.giveaway_points >= t.points_required
ON CONFLICT (user_id, tier_id) DO NOTHING;
