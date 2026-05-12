-- Run in Supabase SQL Editor if upsertUserProfile fails for returning Google users.
-- UPDATE was restricted to Supabase JWT email; this app uses NextAuth + anon key only.

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- NOTE: Any client with your anon key can update any profile row.
-- Tighten later with Supabase Auth or a server route + service_role.
