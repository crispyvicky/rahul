/** Giveaway points → unlockable prizes (leaderboard winner gets campaign grand prize). */
export type PrizeTier = {
  id: string;
  points: number;
  prize: string;
  emoji: string;
  tag?: "hot" | "elite";
};

export const PRIZE_SHEET: PrizeTier[] = [
  { id: "t1", points: 250, prize: "RF Sticker Pack", emoji: "🏷️" },
  { id: "t2", points: 500, prize: "Shaker Bottle", emoji: "🥤" },
  { id: "t3", points: 800, prize: "Gym Towel", emoji: "🧴", tag: "hot" },
  { id: "t4", points: 1200, prize: "Resistance Bands Set", emoji: "🎯" },
  { id: "t5", points: 1800, prize: "Branded Tee", emoji: "👕" },
  { id: "t6", points: 2500, prize: "Whey Sample Box", emoji: "💪", tag: "hot" },
  { id: "t7", points: 3500, prize: "Lifting Belt", emoji: "🏋️" },
  { id: "t8", points: 5000, prize: "1 Month Premium", emoji: "👑" },
  { id: "t9", points: 7500, prize: "1-on-1 Check-in Call", emoji: "📞", tag: "elite" },
  { id: "t10", points: 10000, prize: "Grand Draw Entry", emoji: "🎁", tag: "elite" },
];

/** How to earn giveaway points (matches giveaways page). */
export const POINT_EARN_HINTS = [
  { label: "Follow on Instagram", points: 200 },
  { label: "Refer a friend", points: 150 },
  { label: "Daily streak", points: 10 },
  { label: "Finish Gym Mode workout", points: 25 },
  { label: "Community post", points: 75 },
  { label: "Challenge check-in", points: 15 },
];

export function getNextPrizeTier(giveawayPoints: number): PrizeTier | null {
  return PRIZE_SHEET.find((t) => t.points > giveawayPoints) ?? null;
}

export function getUnlockedTiers(giveawayPoints: number): PrizeTier[] {
  return PRIZE_SHEET.filter((t) => giveawayPoints >= t.points);
}
