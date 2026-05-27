-- Admin push campaigns (delivered when users open the app with notification permission)

CREATE TABLE IF NOT EXISTS notification_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'active_7d', 'top_20', 'streak_users', 'zero_points')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'ended')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notification_campaign_seen (
  campaign_id UUID NOT NULL REFERENCES notification_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status
  ON notification_campaigns(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_notification_campaign_seen_user
  ON notification_campaign_seen(user_id);

ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_campaign_seen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_select" ON notification_campaigns;
CREATE POLICY "campaigns_select" ON notification_campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "campaigns_insert" ON notification_campaigns;
CREATE POLICY "campaigns_insert" ON notification_campaigns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "campaigns_update" ON notification_campaigns;
CREATE POLICY "campaigns_update" ON notification_campaigns FOR UPDATE USING (true);

DROP POLICY IF EXISTS "campaign_seen_select" ON notification_campaign_seen;
CREATE POLICY "campaign_seen_select" ON notification_campaign_seen FOR SELECT USING (true);

DROP POLICY IF EXISTS "campaign_seen_insert" ON notification_campaign_seen;
CREATE POLICY "campaign_seen_insert" ON notification_campaign_seen FOR INSERT WITH CHECK (true);
