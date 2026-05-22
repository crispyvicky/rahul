-- ================================================================
-- Gym Mode tables — run in Supabase SQL Editor or via CLI
-- ================================================================

-- Exercise catalog (seeded from EXERCISE_LIBRARY in app)
CREATE TABLE IF NOT EXISTS exercise_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'workout'
    CHECK (category IN ('workout', 'warmup', 'cooldown')),
  target_sets INTEGER NOT NULL DEFAULT 3,
  target_reps TEXT NOT NULL DEFAULT '10',
  tip TEXT DEFAULT '',
  steps JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name, muscle_group, category)
);

-- Weekly gym plans per user
CREATE TABLE IF NOT EXISTS gym_weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai')),
  ai_plan_id UUID REFERENCES ai_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for exercise swaps
CREATE TABLE IF NOT EXISTS exercise_swaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  weekly_plan_id UUID REFERENCES gym_weekly_plans(id) ON DELETE SET NULL,
  day_name TEXT NOT NULL,
  exercise_index INTEGER NOT NULL DEFAULT 0,
  section TEXT DEFAULT 'workout' CHECK (section IN ('warmup', 'workout', 'cooldown')),
  from_exercise JSONB NOT NULL,
  to_exercise JSONB NOT NULL,
  swap_type TEXT NOT NULL DEFAULT 'shuffle'
    CHECK (swap_type IN ('shuffle', 'manual', 'ai_suggestion', 'reorder')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily completion / set logs snapshot
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_name TEXT,
  completion_pct INTEGER DEFAULT 0 CHECK (completion_pct >= 0 AND completion_pct <= 100),
  exercises_completed INTEGER DEFAULT 0,
  exercises_total INTEGER DEFAULT 0,
  set_logs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, progress_date)
);

-- Push / email notification queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'reminder',
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_weekly_plans_user ON gym_weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_weekly_plans_active ON gym_weekly_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_exercise_library_group ON exercise_library(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercise_swaps_user ON exercise_swaps(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, progress_date);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, scheduled_for);
