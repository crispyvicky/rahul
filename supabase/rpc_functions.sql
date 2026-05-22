-- Run in Supabase SQL Editor (after migration.sql)
-- Atomic point updates + like decrement

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

CREATE OR REPLACE FUNCTION increment_comments(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = p_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_comments(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$;
