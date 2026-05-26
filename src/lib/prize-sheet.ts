/** Giveaway points → unlockable prizes (fitness gear + supplements). */
export type PrizeTier = {
  id: string;
  points: number;
  prize: string;
  emoji: string;
  tag?: "hot" | "elite";
};

export const PRIZE_SHEET: PrizeTier[] = [
  { id: "t1", points: 300, prize: "Shaker Bottle", emoji: "🥤" },
  { id: "t2", points: 600, prize: "Gym Gloves", emoji: "🧤" },
  { id: "t3", points: 1000, prize: "Resistance Bands Set", emoji: "🎯", tag: "hot" },
  { id: "t4", points: 1500, prize: "Skipping Rope", emoji: "⏭️" },
  { id: "t5", points: 2200, prize: "Yoga Mat", emoji: "🧘" },
  { id: "t6", points: 3000, prize: "Whey Protein (1kg)", emoji: "💪", tag: "hot" },
  { id: "t7", points: 4500, prize: "Pre-Workout + Multivitamins", emoji: "💊" },
  { id: "t8", points: 6000, prize: "Foam Roller + Ab Wheel", emoji: "🔄" },
  { id: "t9", points: 8000, prize: "Plant Protein + Peanut Butter", emoji: "🥜", tag: "elite" },
  {
    id: "t10",
    points: 10000,
    prize: "Supplement Stack (Whey + Pre)",
    emoji: "🏆",
    tag: "elite",
  },
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

/** Default grand campaign prize (admin winner picker). */
export const DEFAULT_GRAND_PRIZE = "Whey Protein (2kg)";
