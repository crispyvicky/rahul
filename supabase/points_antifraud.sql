-- Optional: run after migration.sql for stronger duplicate protection at DB level.
-- Prevents two identical point_logs rows in the same UTC day for the same action.

CREATE UNIQUE INDEX IF NOT EXISTS idx_point_logs_user_action_day
  ON point_logs (user_id, action, ((created_at AT TIME ZONE 'UTC')::date));
