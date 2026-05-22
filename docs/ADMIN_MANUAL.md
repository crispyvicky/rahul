# RahulFitzz — Admin Manual

Guide for you and your team: monitoring users, points, giveaways, winners, and Instagram claims.

---

## 1. Admin panel (built in app)

**URL:** `/admin` (not linked in the public sidebar)

**Secret entry:** Gold **shield icon** in the app top bar — only visible when you are logged in as an admin.

### How to sign in

| Method | Details |
|--------|---------|
| **Username + password** | `/admin/login` — defaults in code: `rahulfitzz_admin` / `RahulFitzz@Admin2026` (override with `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env.local`) |
| **Google** | Same login page — only works if your Google email is in `ADMIN_EMAILS` env or `HARDCODED_ADMIN_EMAILS` in `src/lib/admin-config.ts` |

### Env vars (required for full panel)

```env
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase → Settings → API → service_role
ADMIN_EMAILS=you@gmail.com      # Comma-separated allowlist
ADMIN_USERNAME=rahulfitzz_admin
ADMIN_PASSWORD=your-secure-password
```

### SQL to run once

Run **`supabase/admin_panel.sql`** in the SQL Editor (creates `point_claim_requests` + `giveaway_winners`).

### Panel sections

Overview · Leaderboard · Users · Point Logs · **Claims** (approve/deny Instagram) · Community · Giveaways (end campaign, mark winner) · Pre-bookings

---

## 2. What admins need to do

| Task | How today (no panel) | With admin panel (recommended) |
|------|----------------------|--------------------------------|
| See leaderboard | Supabase → `user_profiles` sort `giveaway_points` DESC | Admin → Leaderboard table |
| See who earned what | Supabase → `point_logs` | Admin → Point logs filter |
| Pick giveaway winner | Export top users; verify manually | Admin → “Mark winner” on campaign |
| End / start giveaway | SQL update `giveaways.is_active` | Admin → Campaign form |
| Review Instagram follows | Manual (see §5) | Admin → Pending claims queue |
| Remove cheat points | SQL delete/adjust `point_logs` + profile | Admin → Revoke points button |
| Gym pre-bookings | Supabase → `gym_prebookings` | Admin → Bookings list |
| Community moderation | Supabase → `community_posts` delete | Admin → Hide/delete post |

---

## 3. Working in Supabase today (no panel)

### Login

1. [supabase.com](https://supabase.com) → your project.
2. **Table Editor** for browsing; **SQL Editor** for fixes.

### Key tables

| Table | Admin use |
|--------|-----------|
| `user_profiles` | Names, emails, `giveaway_points`, `xp_points`, `referral_code`, streak |
| `point_logs` | **Audit trail** — every claim: `user_id`, `action`, `points`, `description`, `created_at` |
| `giveaways` | Active campaign: `title`, `prize`, `ends_at`, `is_active` |
| `workout_logs` | Proof of gym activity |
| `community_posts` | UGC moderation |
| `gym_prebookings` | Lead list from website |

### Useful SQL

**Live leaderboard (top 20):**

```sql
SELECT name, email, giveaway_points, current_streak, xp_points
FROM user_profiles
ORDER BY giveaway_points DESC
LIMIT 20;
```

**Everything one user did:**

```sql
SELECT action, points, description, created_at
FROM point_logs
WHERE user_id = 'PASTE-USER-UUID-HERE'
ORDER BY created_at DESC;
```

**Everyone who claimed Instagram follow:**

```sql
SELECT pl.created_at, up.name, up.email, pl.points
FROM point_logs pl
JOIN user_profiles up ON up.id = pl.user_id
WHERE pl.action = 'follow'
ORDER BY pl.created_at DESC;
```

**End current giveaway & start new one:**

```sql
UPDATE giveaways SET is_active = false WHERE is_active = true;

INSERT INTO giveaways (title, description, prize, ends_at, is_active)
VALUES (
  'Win an iPhone 16 Pro',
  'Most consistent athlete this month wins.',
  'iPhone 16 Pro',
  NOW() + INTERVAL '30 days',
  true
);
```

**Revoke fraudulent points (example):**

```sql
-- 1) Note their current points first
SELECT giveaway_points, xp_points FROM user_profiles WHERE email = 'user@example.com';

-- 2) Delete bad log row(s)
DELETE FROM point_logs WHERE user_id = 'UUID' AND action = 'follow';

-- 3) Adjust totals manually
UPDATE user_profiles
SET giveaway_points = giveaway_points - 200,
    xp_points = xp_points - 100
WHERE id = 'UUID';
```

---

## 4. Selecting a winner

There is **no automatic “pick winner” button** in the app yet. Standard process:

1. **Wait until** `giveaways.ends_at` passes (or set `is_active = false`).
2. Run leaderboard SQL (top 1–3).
3. **Verify** top users:
   - `point_logs` look legitimate (not only `checkin` spam).
   - Workouts in `workout_logs` if they claimed gym points.
   - Instagram follow: your manual check (§5).
4. Contact winner by **email** from `user_profiles`.
5. Record outcome (recommended: add `giveaway_winners` table later).

**Suggested `giveaway_winners` table (future SQL):**

```sql
CREATE TABLE IF NOT EXISTS giveaway_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID REFERENCES giveaways(id),
  user_id UUID REFERENCES user_profiles(id),
  rank INTEGER,
  prize TEXT,
  notes TEXT,
  announced_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Instagram follow — how do you know they followed?

### Current app behavior (v1)

- User taps **Follow & Claim** → Instagram opens → app calls API → **+200 points** logged in `point_logs` with `action = 'follow'`.
- The app **does not** read Instagram’s API to confirm a follow.
- This is an **honor + claim** system (common for influencer apps at launch).

### What you can do as admin

| Method | Effort | Trust level |
|--------|--------|-------------|
| **Honor system** | None | Low — users can claim without following |
| **Manual spot-check** | Low | Medium — check random top 10 followers on IG |
| **Screenshot upload** | Medium (build feature) | Medium — user uploads proof; admin approves in panel |
| **Pending approval queue** | Medium (build admin UI) | High — points only after you approve |
| **Instagram Graph API** | High | High — only works for **Business/Creator** accounts and limited scopes; not “list my followers” for arbitrary users easily |

### Practical policy (recommended)

1. **Launch:** Honor + claim; spot-check leaderboard top 20 on @rahulfitzz followers before announcing winner.
2. **Phase 2:** Change flow to **“Request points”** → status `pending` in new table `point_claim_requests` → admin approves in `/admin`.
3. **Phase 3:** Optional screenshot field or Meta API if you qualify.

### SQL to audit follow claims

```sql
SELECT up.name, up.email, up.instagram_handle, pl.created_at
FROM point_logs pl
JOIN user_profiles up ON up.id = pl.user_id
WHERE pl.action = 'follow';
```

Cross-check `instagram_handle` on profile (if users fill Settings) with your follower list manually.

---

## 6. Recommended admin panel (build list)

Route: `/admin` — **not in public sidebar**; only admins.

**Protect with:**

- Environment variable `ADMIN_EMAILS=rahul@...,ops@...`
- NextAuth session email must match
- Or Supabase service role **only on server API routes** (never in browser)

### MVP screens (build in this order)

1. **Overview** — total users, active giveaway, points issued today.
2. **Leaderboard** — sortable table + link to user detail.
3. **Point logs** — filter by `action`, date, user; export CSV.
4. **Pending claims** (after you add approval flow) — approve/deny Instagram & story.
5. **Giveaways** — create/edit/end campaign; **Mark winner** (user picker + notes).
6. **Pre-bookings** — `gym_prebookings` list.
7. **Community** — hide/delete posts.

### API pattern

- `GET /api/admin/*` — checks admin session, uses **Supabase service role** server-side.
- Never expose service role key to the client.

---

## 7. Action reference (`point_logs.action`)

| `action` | Points | Auto or manual | Admin notes |
|----------|--------|----------------|-------------|
| `follow` | 200 | User claim | Verify manually if disputed |
| `share_story` | 100 | User claim | Same |
| `refer` | 150 | Referral signup | Needs signup `?ref=` wiring |
| `streak` | 10 | Auto on login | Daily cap in API |
| `workout` | 25 | Auto gym complete | Check `workout_logs` |
| `checkin` | 15 | User claim | Honor until challenges wired |
| `share_post` | 75 | Auto on transformation post | Check `community_posts` |

---

## 8. Security checklist

- [ ] Change Supabase anon key exposure — sensitive admin ops only on server.
- [ ] Tighten RLS in production (today many tables allow broad insert for dev).
- [ ] `ADMIN_EMAILS` on Vercel/hosting env.
- [ ] Do not commit `.env.local`.
- [ ] Review top leaderboard before paying prize.
- [ ] Keep `point_logs` — never delete entire table; row-level fixes only.

---

## 9. Daily admin routine (5 minutes)

1. Open **point_logs** → sort `created_at` DESC → scan for abuse.
2. Check **gym_prebookings** for new leads.
3. Glance at **community_posts** for inappropriate content.
4. Note leaderboard movement before campaign end.

---

## 10. Related docs

| File | Audience |
|------|----------|
| `docs/USER_MANUAL.md` | Athletes |
| `APP_GUIDE.md` | Developers / technical flow |
| `supabase/finish_setup.sql` | DB RPCs and fixes |

---

## 11. Decision summary

| Question | Answer |
|----------|--------|
| Should we build an admin panel? | **Yes** — start with leaderboard + logs + winner marking. |
| Can we run without it? | **Yes** — use Supabase Table Editor until panel is built. |
| How do we know someone followed IG? | **Today:** you don’t automatically; audit `point_logs` + manual follower check. **Best next step:** approval queue in admin panel. |

When you want the panel built in code, say which MVP screens you want first (usually **Leaderboard + Point logs + Mark winner**).
