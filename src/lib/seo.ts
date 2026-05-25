import type { Metadata } from "next";

/** Canonical production URL — override in .env.local for previews. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://rahulfitzz.com";

export const SITE = {
  name: "RahulFitzz",
  tagline: "Elite Fitness Influencer & Coach",
  description:
    "RahulFitzz — Hyderabad-based fitness influencer, coach, and brand partner. 165K+ reach, transformation programs, gym pre-booking, giveaways, and elite training content.",
  locale: "en_IN",
  email: "collab@rahulfitzz.com",
  city: "Hyderabad",
  region: "Telangana",
  country: "IN",
  countryName: "India",
  geo: {
    latitude: 17.385,
    longitude: 78.4867,
  },
  social: {
    instagram: "https://www.instagram.com/rahulfitzz",
    youtube: "https://www.youtube.com/@rahulfitzz",
    facebook:
      "https://www.facebook.com/profile.php?id=61586274037649",
  },
  keywords: [
    "RahulFitzz",
    "fitness influencer Hyderabad",
    "fitness coach Hyderabad India",
    "gym influencer India",
    "workout plans India",
    "transformation coach Hyderabad",
    "brand collaborations fitness",
    "muscle building program",
    "fitness giveaways India",
  ],
} as const;

export const OG_IMAGE = `${SITE_URL}/LOGO.png`;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const fullTitle =
    path === "/" ? `${SITE.name} | ${SITE.tagline}` : `${title} | ${SITE.name}`;

  return {
    title: fullTitle,
    description,
    keywords: [...SITE.keywords, ...keywords],
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: fullTitle,
      description,
      images: [{ url: OG_IMAGE, width: 512, height: 512, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

export const HOME_FAQS = [
  {
    question: "Who is the RahulFitzz Blueprint designed for?",
    answer:
      "High-performance athletes at any level — from beginners in Hyderabad to seasoned lifters — who want a structured path to physical transformation.",
  },
  {
    question: "Where is RahulFitzz based?",
    answer:
      "RahulFitzz is based in Hyderabad, India, serving a global digital community with in-person training hubs and online programs.",
  },
  {
    question: "How do giveaways and community points work?",
    answer:
      "Earn points by following on Instagram, referring friends, daily streaks, workouts, and community posts — then compete on the leaderboard for prizes.",
  },
  {
    question: "Can brands collaborate with RahulFitzz?",
    answer:
      "Yes. Reach out at collab@rahulfitzz.com for fitness brand partnerships, sponsored content, and campaign integrations across 165K+ combined followers.",
  },
] as const;

/** Public routes included in sitemap.xml */
export const SITEMAP_ROUTES: {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.85 },
  { path: "/benefits", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blogs", changeFrequency: "weekly", priority: 0.85 },
  { path: "/workout-plans", changeFrequency: "weekly", priority: 0.9 },
  { path: "/supplements", changeFrequency: "weekly", priority: 0.85 },
  { path: "/giveaways", changeFrequency: "daily", priority: 0.9 },
  { path: "/community", changeFrequency: "daily", priority: 0.85 },
  { path: "/challenges", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gym-mode", changeFrequency: "weekly", priority: 0.8 },
  { path: "/ai-coach", changeFrequency: "weekly", priority: 0.75 },
  { path: "/book-gym", changeFrequency: "monthly", priority: 0.75 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.7 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.5 },
];

/** Paths crawlers should not index (private, redirects, or placeholders). */
export const ROBOTS_DISALLOW = [
  "/api/",
  "/admin",
  "/dashboard",
  "/settings",
  "/onboarding",
  "/offline",
  "/overview",
  "/coming-soon",
  "/login",
];
