-- IG claim screenshots (required for follow / share_story). Run once in Supabase SQL Editor.
-- Files live in Storage; proof_url is stored on point_claim_requests until admin approves/denies,
-- then the app deletes the file and clears proof_url to save storage.

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

-- Orphan cleanup (only if something failed during review):
-- DELETE FROM storage.objects WHERE bucket_id = 'claim-proofs' AND created_at < now() - interval '30 days';
