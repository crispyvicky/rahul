-- Run in Supabase SQL Editor to update active campaign (replaces iPhone with supplement prize)
UPDATE giveaways
SET
  title = 'Win a Whey Protein Stack',
  description = 'Top leaderboard athletes this month can win a premium whey protein stack. Earn points from workouts, streaks, and community — climb the ranks.',
  prize = 'Whey Protein (2kg)'
WHERE is_active = true;
