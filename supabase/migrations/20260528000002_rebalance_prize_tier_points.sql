-- Align stored tier thresholds with src/lib/prize-sheet.ts (economy rebalance)

UPDATE prize_redemption_alerts SET points_required = 650 WHERE tier_id = 't1';
UPDATE prize_redemption_alerts SET points_required = 1100 WHERE tier_id = 't2';
UPDATE prize_redemption_alerts SET points_required = 1750 WHERE tier_id = 't3';
UPDATE prize_redemption_alerts SET points_required = 2500 WHERE tier_id = 't4';
UPDATE prize_redemption_alerts SET points_required = 3400 WHERE tier_id = 't5';
UPDATE prize_redemption_alerts SET points_required = 4500 WHERE tier_id = 't6';
UPDATE prize_redemption_alerts SET points_required = 6000 WHERE tier_id = 't7';
UPDATE prize_redemption_alerts SET points_required = 7800 WHERE tier_id = 't8';
UPDATE prize_redemption_alerts SET points_required = 10000 WHERE tier_id = 't9';
UPDATE prize_redemption_alerts SET points_required = 13000 WHERE tier_id = 't10';
