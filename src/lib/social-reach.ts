/** Public follower/subscriber counts (thousands) — update here only. */
export const SOCIAL_REACH = {
  instagramK: 162,
  youtubeK: 101,
  facebookK: 87,
} as const;

export const SOCIAL_REACH_TOTAL_K =
  SOCIAL_REACH.instagramK + SOCIAL_REACH.youtubeK + SOCIAL_REACH.facebookK;

export function formatReachK(k: number): string {
  return `${k}K+`;
}

/** Short labels for hero / banners (e.g. "162K+"). */
export const SOCIAL_REACH_DISPLAY = {
  instagram: formatReachK(SOCIAL_REACH.instagramK),
  youtube: formatReachK(SOCIAL_REACH.youtubeK),
  facebook: formatReachK(SOCIAL_REACH.facebookK),
  total: formatReachK(SOCIAL_REACH_TOTAL_K),
} as const;

/** Full number for copy (e.g. "350,000+"). */
export function formatReachFull(kThousands: number): string {
  return `${(kThousands * 1000).toLocaleString("en-US")}+`;
}

export const SOCIAL_REACH_TOTAL_FULL = formatReachFull(SOCIAL_REACH_TOTAL_K);
