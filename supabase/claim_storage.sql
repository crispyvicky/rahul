-- IG claim screenshots (optional). Run once in Supabase SQL Editor.
-- Files live in Storage; only a short URL is stored in point_claim_requests.proof_url.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'claim-proofs',
  'claim-proofs',
  true,
  1572864,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 1572864,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Anyone can view proofs (admin “View screenshot” link). Uploads go via service role API.
DROP POLICY IF EXISTS "claim_proofs_public_read" ON storage.objects;
CREATE POLICY "claim_proofs_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'claim-proofs');

-- Optional: delete old proofs after review (run manually or via cron):
-- DELETE FROM storage.objects WHERE bucket_id = 'claim-proofs' AND created_at < now() - interval '90 days';
