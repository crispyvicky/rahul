-- Run this ONLY if apply_all_gym_sprint.sql stopped with "policy already exists".
-- Safe to re-run anytime.

-- Fix ai_plans policies (idempotent)
DROP POLICY IF EXISTS "Users view own ai plans" ON ai_plans;
DROP POLICY IF EXISTS "Users insert own ai plans" ON ai_plans;
DROP POLICY IF EXISTS "ai_plans_select" ON ai_plans;
DROP POLICY IF EXISTS "ai_plans_insert" ON ai_plans;

CREATE POLICY "ai_plans_select" ON ai_plans FOR SELECT USING (true);
CREATE POLICY "ai_plans_insert" ON ai_plans FOR INSERT WITH CHECK (true);

-- Gym pre-bookings (if Section 6 never ran)
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

-- Point / like RPCs (giveaways + community)
CREATE OR REPLACE FUNCTION increment_points(
  p_user_id UUID,
  p_giveaway_points INTEGER,
  p_xp_points INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET
    giveaway_points = COALESCE(giveaway_points, 0) + p_giveaway_points,
    xp_points = COALESCE(xp_points, 0) + p_xp_points,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_likes(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$;
