-- Track in-app prize-unlock toasts (web push is sent separately on unlock)

ALTER TABLE prize_redemption_alerts
  ADD COLUMN IF NOT EXISTS in_app_notified_at TIMESTAMPTZ;

-- Don't toast old backfilled redemptions — only new tier crossings after this deploy
UPDATE prize_redemption_alerts
SET in_app_notified_at = NOW()
WHERE in_app_notified_at IS NULL;
