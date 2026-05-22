-- Run in Supabase SQL Editor (after migration.sql)

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (
    char_length(trim(content)) >= 1 AND char_length(content) <= 2000
  ),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are public" ON post_comments;
CREATE POLICY "Comments are public" ON post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add comments" ON post_comments;
CREATE POLICY "Users can add comments" ON post_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete comments" ON post_comments;
CREATE POLICY "Users can delete comments" ON post_comments FOR DELETE USING (true);

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
