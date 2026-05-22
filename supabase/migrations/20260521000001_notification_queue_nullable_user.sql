-- Allow system/marketing emails (pre-book, waitlist, collab) without a logged-in user
ALTER TABLE notification_queue
  ALTER COLUMN user_id DROP NOT NULL;
