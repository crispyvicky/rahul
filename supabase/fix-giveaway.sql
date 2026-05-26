-- Fix: Enable read access on giveaways table and re-seed
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Giveaways are public" ON giveaways FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admin can manage giveaways" ON giveaways FOR INSERT WITH CHECK (true);

-- Re-seed giveaway
INSERT INTO giveaways (title, description, prize, ends_at, is_active)
VALUES (
  'Win a Whey Protein Stack',
  'Top leaderboard athletes this month can win a premium whey protein stack. Earn points from workouts, streaks, and community — climb the ranks.',
  'Whey Protein (2kg)',
  NOW() + INTERVAL '30 days',
  TRUE
)
ON CONFLICT DO NOTHING;
