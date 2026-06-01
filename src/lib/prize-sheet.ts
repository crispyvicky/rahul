/** Giveaway points → unlockable prizes (fitness gear + supplements). */
import { GIVEAWAY_POINT_ACTIONS } from "./giveaway-points-config";

export type PrizeTier = {
  id: string;
  points: number;
  prize: string;
  emoji: string;
  tag?: "hot" | "elite";
};

/** Redemption thresholds (raised so follow+story alone cannot claim ₹500+ prizes). */
export const PRIZE_SHEET: PrizeTier[] = [
  { id: "t1", points: 650, prize: "Shaker Bottle", emoji: "🥤" },
  { id: "t2", points: 1100, prize: "Gym Gloves", emoji: "🧤" },
  { id: "t3", points: 1750, prize: "Resistance Bands Set", emoji: "🎯", tag: "hot" },
  { id: "t4", points: 2500, prize: "Skipping Rope", emoji: "⏭️" },
  { id: "t5", points: 3400, prize: "Yoga Mat", emoji: "🧘" },
  { id: "t6", points: 4500, prize: "Whey Protein (1kg)", emoji: "💪", tag: "hot" },
  { id: "t7", points: 6000, prize: "Pre-Workout + Multivitamins", emoji: "💊" },
  { id: "t8", points: 7800, prize: "Foam Roller + Ab Wheel", emoji: "🔄" },
  { id: "t9", points: 10000, prize: "Plant Protein + Peanut Butter", emoji: "🥜", tag: "elite" },
  {
    id: "t10",
    points: 13000,
    prize: "Supplement Stack (Whey + Pre)",
    emoji: "🏆",
    tag: "elite",
  },
];

/** How to earn giveaway points (matches giveaways page). */
export const POINT_EARN_HINTS = [
  { label: "Follow on Instagram", points: GIVEAWAY_POINT_ACTIONS.follow.points },
  { label: "Share on Instagram Story", points: GIVEAWAY_POINT_ACTIONS.share_story.points },
  { label: "Refer a friend", points: GIVEAWAY_POINT_ACTIONS.refer.points },
  { label: "Daily streak", points: GIVEAWAY_POINT_ACTIONS.streak.points },
  { label: "Finish Gym Mode workout", points: GIVEAWAY_POINT_ACTIONS.workout.points },
  { label: "Community post", points: GIVEAWAY_POINT_ACTIONS.share_post.points },
  { label: "Challenge check-in", points: GIVEAWAY_POINT_ACTIONS.checkin.points },
];

export function getNextPrizeTier(giveawayPoints: number): PrizeTier | null {
  return PRIZE_SHEET.find((t) => t.points > giveawayPoints) ?? null;
}

export function getUnlockedTiers(giveawayPoints: number): PrizeTier[] {
  return PRIZE_SHEET.filter((t) => giveawayPoints >= t.points);
}

/** Default grand campaign prize (admin winner picker). */
export const DEFAULT_GRAND_PRIZE = "Whey Protein (2kg)";
