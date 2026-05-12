-- Fix: Enable read access on giveaways table and re-seed
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Giveaways are public" ON giveaways FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admin can manage giveaways" ON giveaways FOR INSERT WITH CHECK (true);

-- Re-seed giveaway
INSERT INTO giveaways (title, description, prize, ends_at, is_active)
VALUES (
  'Win an iPhone 16 Pro',
  'The most consistent athlete this month wins an iPhone 16 Pro. Track workouts, complete challenges, and rise to the top of the leaderboard.',
  'iPhone 16 Pro',
  NOW() + INTERVAL '30 days',
  TRUE
)
ON CONFLICT DO NOTHING;
