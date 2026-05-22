-- RLS for gym mode tables (anon + NextAuth pattern — permissive like existing tables)
-- Also run: supabase/fix_user_profiles_rls.sql, supabase/fix_ai_plans_rls.sql

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Public read catalog; service can insert via migration seed
DROP POLICY IF EXISTS "exercise_library_select" ON exercise_library;
CREATE POLICY "exercise_library_select" ON exercise_library FOR SELECT USING (true);

DROP POLICY IF EXISTS "exercise_library_insert" ON exercise_library;
CREATE POLICY "exercise_library_insert" ON exercise_library FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "gym_weekly_plans_select" ON gym_weekly_plans;
CREATE POLICY "gym_weekly_plans_select" ON gym_weekly_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "gym_weekly_plans_insert" ON gym_weekly_plans;
CREATE POLICY "gym_weekly_plans_insert" ON gym_weekly_plans FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "gym_weekly_plans_update" ON gym_weekly_plans;
CREATE POLICY "gym_weekly_plans_update" ON gym_weekly_plans FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "exercise_swaps_select" ON exercise_swaps;
CREATE POLICY "exercise_swaps_select" ON exercise_swaps FOR SELECT USING (true);

DROP POLICY IF EXISTS "exercise_swaps_insert" ON exercise_swaps;
CREATE POLICY "exercise_swaps_insert" ON exercise_swaps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "daily_progress_select" ON daily_progress;
CREATE POLICY "daily_progress_select" ON daily_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_progress_insert" ON daily_progress;
CREATE POLICY "daily_progress_insert" ON daily_progress FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "daily_progress_update" ON daily_progress;
CREATE POLICY "daily_progress_update" ON daily_progress FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notification_queue_select" ON notification_queue;
CREATE POLICY "notification_queue_select" ON notification_queue FOR SELECT USING (true);

DROP POLICY IF EXISTS "notification_queue_insert" ON notification_queue;
CREATE POLICY "notification_queue_insert" ON notification_queue FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notification_queue_update" ON notification_queue;
CREATE POLICY "notification_queue_update" ON notification_queue FOR UPDATE USING (true) WITH CHECK (true);
