-- Run this in Supabase → SQL Editor if AI plan save/load fails.
-- The app uses NEXT_PUBLIC_SUPABASE_ANON_KEY from the browser with NextAuth,
-- not Supabase Auth, so auth.uid() and JWT email claims are empty.
-- The original policies block SELECT; INSERT may still hit FK/RLS edge cases.

DROP POLICY IF EXISTS "Users view own ai plans" ON ai_plans;
DROP POLICY IF EXISTS "Users insert own ai plans" ON ai_plans;
DROP POLICY IF EXISTS "ai_plans_select" ON ai_plans;
DROP POLICY IF EXISTS "ai_plans_insert" ON ai_plans;

CREATE POLICY "ai_plans_select" ON ai_plans FOR SELECT USING (true);
CREATE POLICY "ai_plans_insert" ON ai_plans FOR INSERT WITH CHECK (true);

-- NOTE: SELECT USING (true) allows anyone with the anon key to read all rows.
-- For production, replace with a server route + service role and tighter RLS.
