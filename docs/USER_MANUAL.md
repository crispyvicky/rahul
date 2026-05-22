# RahulFitzz — User Manual

Guide for athletes using the app: login, points, levels, giveaways, gym, and community.

---

## 1. Getting started

### Sign up / log in

1. Open the site and tap **Launch App** or go to `/login`.
2. **Recommended:** Sign in with **Google** so your progress saves to the cloud (points, level, streak, leaderboard).
3. Email/password login works for access, but **giveaway points and leaderboard need a Google account** (linked to your profile in the database).

### First visit

After Google login you land on the **Dashboard**. Your profile is created automatically with:

- Starting **0 giveaway points** and **0 XP**
- A unique **referral link** (on the Giveaways page)
- **Streak** updated when you return each day

---

## 2. App sections

| Section | What it does |
|---------|----------------|
| **Dashboard** | Level, streak, XP bar, today’s workout preview, weekly gym activity |
| **Gym Booking** | Pre-book a gym slot (form saved + confirmation email) |
| **AI Coach** | Generate workout/diet plans with AI |
| **Challenges** | Challenge programs (some content still rolling out) |
| **Community** | Post progress, tips, transformations; like posts |
| **Gym Mode** | Weekly plan, log sets, complete workouts |
| **Giveaways** | Earn points, leaderboard, active prize campaign |
| **Premium** | Plan tiers (marketing) |
| **Settings** | Name, email, Instagram handle |

**Benefits overview** (Evolution Edge, phone mockup) is on the **homepage** only — scroll to **Benefits overview** or `/#benefits-overview`. It is not inside the app sidebar.

---

## 3. Levels & XP

- **XP** powers your **level** (shown on Dashboard and top bar).
- You earn XP when you earn **giveaway points** — about **half** of those points also add to XP.
- Example: +200 giveaway points from Instagram follow → +100 XP.
- The level bar shows how close you are to the **next level**; the formula increases XP needed each level.

**Streak** (flame badge) is separate: log in on consecutive days to grow it. A small streak bonus can add giveaway points when your streak increases.

---

## 4. Giveaway points & prizes

### What points are for

**Giveaway points** decide your **rank** on the leaderboard for the active campaign (e.g. iPhone giveaway). Higher rank = better chance your brand treats you as top athlete when the campaign ends (winner selection is run by the RahulFitzz team).

### How to earn points

Open **Giveaways → Earn Points**:

| Action | Points | How |
|--------|--------|-----|
| Follow @rahulfitzz on Instagram | 200 | Tap **Follow & Claim** → opens Instagram → **pending admin approval** → points after approve |
| Share on Instagram Story | 100 | **Share & Claim** → pending admin approval |
| Refer a friend | 150 | Share your referral link; friend must sign up with that link (when referral signup is live) |
| Daily login streak | 10 | Automatic when your streak goes up |
| Complete today’s workout | 25 | Finish all exercises for today in **Gym Mode** (once per day) |
| Challenge check-in | 15 | Claim on Giveaways (honor system for now) |
| Transformation post | 75 | Post type **Transformation** in **Community** |

### Your stats

On **Giveaways** you see:

- **Your points** — total giveaway points
- **Your rank** — position vs everyone else
- **Points to #1** — how many points the leader has more than you
- **Referral link** — copy and share

### Leaderboard

**Giveaways → Leaderboard** shows real users sorted by `giveaway_points`. Only people who earned at least one point appear in the “competing” count.

### Rules you should know

- **One-time actions** (follow, share story): you cannot claim twice.
- **Daily actions** (workout, streak, check-in): once per calendar day.
- Points are stored in the database; the team can see a full history (`point_logs`).

---

## 5. Gym Mode

1. Open **Gym Mode** and set up or load your **weekly plan**.
2. Each day lists exercises; log **weight**, **reps**, and mark sets **complete**.
3. When you finish **all exercises for today**, the app can award **workout points** once that day (saved to your account).
4. **Dashboard** shows weekly completion and today’s workout preview.

---

## 6. Community

1. Open **Community** and read posts from other athletes.
2. Tap **like** on posts you enjoy.
3. Create a post: choose **Progress**, **Tip**, or **Transformation**.
4. **Transformation** posts can earn **+75 giveaway points** automatically when posted (no extra button).

Comments and image upload for transformations may come in a later update.

---

## 7. AI Coach

1. Open **AI Coach**.
2. Enter your goals, stats, and preferences.
3. Generate **workout** and/or **diet** plans.
4. Plans can be saved to your account when logged in with Google.

---

## 8. Gym pre-booking

From the homepage **Gym** section or **Gym Booking** in the app:

1. Fill name, email, phone, city, notes.
2. Submit — you receive a thank-you email; the team receives the booking.

---

## 9. Tips & troubleshooting

| Issue | What to do |
|-------|------------|
| Points stay 0 | Use **Google login**, not email-only |
| “Already claimed” | Normal for one-time or daily actions |
| Rank shows “—” | Earn at least 1 point or refresh after claim |
| Level seems wrong | XP updates after points; reload app |
| Giveaway empty | Admin must activate a campaign in the database |

---

## 10. Fair play

- Do not spam fake accounts for referrals.
- Only claim Instagram actions if you actually followed or shared.
- The team may review suspicious `point_logs` and adjust scores or disqualify entries.

For technical details see `APP_GUIDE.md` in the project root.
