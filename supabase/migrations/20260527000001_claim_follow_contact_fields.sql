ALTER TABLE point_claim_requests
  ADD COLUMN IF NOT EXISTS instagram_username TEXT;

ALTER TABLE point_claim_requests
  ADD COLUMN IF NOT EXISTS phone TEXT;
