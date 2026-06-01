/**
 * Giveaway points economy (client + server).
 * IG follow + story alone ≈ 150 pts — not enough for first physical prize (~650).
 * Users need streak, gym, referrals, and community to redeem.
 */

export type PointPolicy = "day" | "lifetime" | "none";

export const GIVEAWAY_POINT_ACTIONS = {
  follow: { points: 100, policy: "lifetime" as PointPolicy },
  share_story: { points: 50, policy: "lifetime" as PointPolicy },
  refer: { points: 125, policy: "none" as PointPolicy },
  streak: { points: 8, policy: "day" as PointPolicy },
  workout: { points: 20, policy: "day" as PointPolicy },
  checkin: { points: 12, policy: "day" as PointPolicy },
  share_post: { points: 50, policy: "day" as PointPolicy },
} as const;

export type GiveawayPointActionKey = keyof typeof GIVEAWAY_POINT_ACTIONS;

/** One-time IG tasks combined (for UI copy). */
export const IG_ONE_TIME_POINTS_TOTAL =
  GIVEAWAY_POINT_ACTIONS.follow.points + GIVEAWAY_POINT_ACTIONS.share_story.points;
