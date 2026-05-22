# RahulFitzz App Guide

How the app works end-to-end: data, points, levels, giveaways, community, and what to run in Supabase.

**Manuals:** [User guide](docs/USER_MANUAL.md) · [Admin guide](docs/ADMIN_MANUAL.md)

**Admin panel:** `/admin` · shield icon in topbar (admins only) · requires `SUPABASE_SERVICE_ROLE_KEY` + `supabase/admin_panel.sql`

---

## 1. Architecture overview

| Layer | Tech |
|--------|------|
| Frontend | Next.js 16 (App Router), React, Zustand, Tailwind |
| Auth | NextAuth (Google + email credentials) |
| Database | Supabase (PostgreSQL + RLS) |
| AI | Google Gemini (`/api/ai-coach`, `/api/gym-plan/ai`) |
| Email | SMTP (nodemailer) for pre-booking, waitlist, contact |

**Marketing site** (homepage): hero, benefits (`/#benefits-overview`), gym pre-book, login.

**App shell** (sidebar): Dashboard, Gym Booking, AI Coach, Challenges, Community, Gym Mode, Giveaways, Premium.

Benefits overview lives only on the homepage section `#benefits-overview`, not as a separate app page.

---

## 2. Supabase tables (core)

| Table | Purpose |
|--------|---------|
| `user_profiles` | User identity, XP, giveaway points, streak, referral code |
| `point_logs` | Audit trail: every point action (who, what, when) |
| `giveaways` | Active/past campaigns (title, prize, `ends_at`) |
| `workout_logs` | Logged workouts from Gym Mode |
| `community_posts` | Feed posts (progress, tip, transformation) |
| `post_likes` | Like/unlike without duplicates |
| `gym_weekly_plans`, `daily_progress`, … | Gym Mode weekly plan (sprint migrations) |
| `gym_prebookings` | Homepage / book-gym form submissions |
| `ai_plans` | Saved AI workout/diet plans |

---

## 3. SQL to run in Supabase (order)

Run in **Supabase → SQL Editor**. Use the files in `supabase/`.

### First time (full setup)

1. **`supabase/migration.sql`** — Core tables: profiles, giveaways, `point_logs`, community, RLS, seed iPhone giveaway.
2. **`supabase/apply_all_gym_sprint.sql`** — Gym plan tables, exercise library, prebookings (if not already applied).
3. **`supabase/finish_setup.sql`** — Idempotent fixes: `ai_plans` policies, `gym_prebookings`, **RPC functions** `increment_points` + `decrement_likes`.

### If you already ran migrations before

Run only what you are missing:

| File | When |
|------|------|
| `supabase/rpc_functions.sql` | Points/leaderboard updates fail; likes decrement fails |
| `supabase/finish_setup.sql` | Safe re-run anytime (includes RPCs now) |
| `supabase/fix_user_profiles_rls.sql` | Profile upsert blocked by RLS |
| `supabase/fix-giveaway.sql` | Giveaways table / RLS issues |

### New SQL added for this sprint

**`increment_points`** — Atomically adds `giveaway_points` and `xp_points` on `user_profiles`.

**`decrement_likes`** — Decrements `likes_count` when someone unlikes a post.

Both are in `supabase/rpc_functions.sql` and appended to `supabase/finish_setup.sql`.

---

## 4. Level & XP (dashboard / topbar)

**Source:** `user_profiles.xp_points` (synced on Google login via Topbar).

**Formula:** `calculateLevel()` in `src/lib/utils.ts`

- Level 1 needs **100 XP** base.
- Each next level needs `floor(100 × 1.5^(level − 1))` more XP.
- Progress bar = % through the **current** level.
- “XP to next level” = remaining XP in that level band.

**Not mock:** Streak and level badges use DB values after Google sign-in. Email-only login does not create a UUID profile until Google (or full signup) is wired.

---

## 5. Giveaway points & tracking

### Two currencies

| Field | Used for |
|--------|----------|
| `giveaway_points` | Leaderboard, iPhone giveaway rank |
| `xp_points` | Level on dashboard (also gets **50%** of giveaway points awarded) |

### How points are awarded

| Action | Points | How |
|--------|--------|-----|
| `follow` | 200 | User taps Follow & Claim → `POST /api/giveaway/claim` (one-time) |
| `share_story` | 100 | Share & Claim (one-time) |
| `refer` | 150 | On referred signup (referral code on profile; signup wiring optional) |
| `streak` | 10 | Auto on login when streak increases (`updateStreak`) |
| `workout` | 25 | Auto when Gym Mode day is 100% complete (`/api/gym-plan/progress`) |
| `checkin` | 15 | Claim button on Giveaways (honor system for challenges) |
| `share_post` | 75 | Auto when posting a **transformation** in Community |

### Audit: who did what

Every award inserts into **`point_logs`**:

- `user_id`, `action`, `points`, `description`, `created_at`

**Admin view:** Supabase → Table Editor → `point_logs` (filter by user or action).

**One-time actions:** `follow`, `share_story` — blocked if already in `point_logs`.

**Daily actions:** `streak`, `workout`, `checkin` — blocked if same action exists **today**.

### Instagram follow

There is **no** Meta API verification in v1. Flow: open Instagram → user claims points → stored in `point_logs`. For strict proof later, add manual admin review or Instagram Graph API.

### APIs

- `GET /api/giveaway?userId=<uuid>` — Active giveaway, leaderboard, your rank/points, completed actions, referral code.
- `POST /api/giveaway/claim` — Body: `{ userId, action }`.

### UI

`/giveaways` loads live data from the API (no hardcoded 2450 / rank 8). Requires **Google login** (UUID profile) to earn points.

---

## 6. Community

| Step | Implementation |
|------|----------------|
| Load feed | `getCommunityPosts()` → `community_posts` + `user_profiles` |
| Create post | `createCommunityPost()` → DB insert |
| Like | `togglePostLike()` → `post_likes` + `likes_count` |
| Transformation +75 pts | Automatic in `createCommunityPost` when `post_type === 'transformation'` |

Posts are empty until real users post. No mock feed in production UI.

---

## 7. Gym Mode & dashboard

- Weekly plan + progress: `/api/gym-plan/*`, `daily_progress`, localStorage fallback.
- **Workouts completed** on dashboard comes from gym plan API (real).
- Calories / steps / water were placeholder; use real trackers later or hide.
- **Achievements** should come from `point_logs` (recent activity), not static list.

Completing **all exercises for today** triggers workout points once per day via progress API.

---

## 8. Auth & profile sync

1. User signs in with **Google**.
2. Topbar runs `upsertUserProfile()` → creates/updates `user_profiles`, sets `referral_code`.
3. `updateStreak()` updates streak and may award streak points.
4. Zustand store holds: `xpPoints`, `giveawayPoints`, `referralCode`, streaks.

Email credentials login uses a temporary local id — **not** a Supabase UUID — so giveaways/community DB features require Google.

---

## 9. Environment variables

In `.env.local` (do not commit):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY` (AI routes)
- SMTP vars for email

---

## 10. Quick test checklist

1. Run SQL: `migration.sql` → `finish_setup.sql` (and gym sprint if needed).
2. Sign in with Google → check `user_profiles` row created.
3. Open **Giveaways** → real points (0 initially), leaderboard from DB.
4. Follow & Claim → row in `point_logs`, points increase.
5. Complete Gym Mode day → `workout` in `point_logs` (once/day).
6. Post transformation in **Community** → post visible + `share_post` points.
7. Dashboard level/streak match `user_profiles`.

---

## 11. Still static / future work

| Area | Status |
|------|--------|
| Challenges page | UI mock; `challenge_enrollments` table exists, not fully wired |
| Premium pricing | Marketing tiers only |
| Referral on signup | `?ref=` on URL; credit referrer on signup handler |
| Health stats (calories/steps) | No wearable API yet |
| Past giveaway winners | Shows ended campaigns; winner table not built |

---

## 12. File map

| Feature | Key files |
|---------|-----------|
| Giveaways UI | `src/app/giveaways/page.tsx` |
| Giveaway API | `src/app/api/giveaway/route.ts`, `claim/route.ts` |
| Points service | `src/lib/supabase-service.ts` |
| Level math | `src/lib/utils.ts` |
| Profile store | `src/store/use-user-store.ts` |
| Topbar sync | `src/components/platform/topbar.tsx` |
| Community | `src/app/community/page.tsx` |
| Benefits (homepage) | `src/components/benefits.tsx` (`#benefits-overview`) |
| SQL | `supabase/migration.sql`, `finish_setup.sql`, `rpc_functions.sql` |
