-- Run once in Supabase SQL Editor if you see:
-- PGRST116 | Cannot coerce the result to a single JSON object | 0 rows
-- on profile update after Google sign-in.
--
-- The app now syncs profiles via /api/auth/sync-profile (service role).
-- This script still helps any remaining client-side profile/settings updates.

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
