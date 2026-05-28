-- Phone on profile + contact snapshot on prize redemption alerts (admin reach-out)

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE prize_redemption_alerts
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE prize_redemption_alerts
  ADD COLUMN IF NOT EXISTS contact_instagram TEXT;

-- Backfill contact on existing redemption rows (profile, then latest IG-follow claim)
UPDATE prize_redemption_alerts a
SET
  contact_phone = COALESCE(
    NULLIF(TRIM(a.contact_phone), ''),
    NULLIF(TRIM(p.phone), ''),
    (
      SELECT NULLIF(TRIM(c.phone), '')
      FROM point_claim_requests c
      WHERE c.user_id = a.user_id AND c.action = 'follow' AND c.phone IS NOT NULL
      ORDER BY c.created_at DESC
      LIMIT 1
    )
  ),
  contact_instagram = COALESCE(
    NULLIF(TRIM(a.contact_instagram), ''),
    NULLIF(TRIM(REPLACE(p.instagram_handle, '@', '')), ''),
    (
      SELECT NULLIF(TRIM(REPLACE(c.instagram_username, '@', '')), '')
      FROM point_claim_requests c
      WHERE c.user_id = a.user_id AND c.action = 'follow' AND c.instagram_username IS NOT NULL
      ORDER BY c.created_at DESC
      LIMIT 1
    )
  )
FROM user_profiles p
WHERE p.id = a.user_id;
