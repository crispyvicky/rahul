-- When user first enables notifications: only alerts/campaigns after this time are delivered in-app

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS notifications_enabled_at TIMESTAMPTZ;
