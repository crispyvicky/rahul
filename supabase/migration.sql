-- ================================================================
-- RahulFitzz Fitness Ecosystem — Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ================================================================

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  instagram_handle TEXT DEFAULT '',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_tier TEXT DEFAULT 'free' CHECK (premium_tier IN ('free', 'warrior', 'elite', 'custom')),
  xp_points INTEGER DEFAULT 0,
  giveaway_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  is_following_ig BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Giveaways
CREATE TABLE IF NOT EXISTS giveaways (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prize TEXT NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Point Logs (tracks every point-earning action)
CREATE TABLE IF NOT EXISTS point_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  giveaway_id UUID REFERENCES giveaways(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workout Logs
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  muscle_group TEXT NOT NULL,
  exercises JSONB,
  duration_mins INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Community Posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'progress' CHECK (post_type IN ('transformation', 'progress', 'tip')),
  before_image TEXT,
  after_image TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Post Likes (prevent double-liking)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 7. Challenge Enrollments
CREATE TABLE IF NOT EXISTS challenge_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  total_days INTEGER NOT NULL,
  last_checkin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_name)
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for leaderboard) but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Point logs readable by all (leaderboard), insert for authenticated
CREATE POLICY "Point logs are viewable" ON point_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert points" ON point_logs FOR INSERT WITH CHECK (true);

-- Workout logs: owner only
CREATE POLICY "Users view own workouts" ON workout_logs FOR SELECT USING (true);
CREATE POLICY "Users insert own workouts" ON workout_logs FOR INSERT WITH CHECK (true);

-- Community posts: public read, authenticated write
CREATE POLICY "Posts are public" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (true);

-- Likes: public read, authenticated insert/delete
CREATE POLICY "Likes are public" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike" ON post_likes FOR DELETE USING (true);

-- Challenge enrollments
CREATE POLICY "Enrollments viewable" ON challenge_enrollments FOR SELECT USING (true);
CREATE POLICY "Users can enroll" ON challenge_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update enrollment" ON challenge_enrollments FOR UPDATE USING (true);

-- ================================================================
-- INDEXES for performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_point_logs_user ON point_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_giveaway ON point_logs(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_giveaway_pts ON user_profiles(giveaway_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON user_profiles(xp_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral ON user_profiles(referral_code);

-- ================================================================
-- SEED: Insert first giveaway
-- ================================================================

INSERT INTO giveaways (title, description, prize, ends_at, is_active)
VALUES (
  'Win a Whey Protein Stack',
  'Top leaderboard athletes this month can win a premium whey protein stack. Earn points from workouts, streaks, and community — climb the ranks.',
  'Whey Protein (2kg)',
  NOW() + INTERVAL '30 days',
  TRUE
);

-- ================================================================
-- NEW TABLES: AI Plans & Blog Posts
-- ================================================================

-- 8. AI Plans (Workout & Diet)
CREATE TABLE IF NOT EXISTS ai_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('workout', 'diet', 'physique')),
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'RahulFitzz',
  image_url TEXT,
  author_image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Plans RLS (anon + NextAuth: no Supabase JWT, so auth.uid() policies never match)
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_plans_select" ON ai_plans FOR SELECT USING (true);
CREATE POLICY "ai_plans_insert" ON ai_plans FOR INSERT WITH CHECK (true);

-- Blog Posts RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts are public" ON blog_posts FOR SELECT USING (true);
-- Only admins/service roles can insert/update blog posts normally, but keeping simple for now

CREATE INDEX IF NOT EXISTS idx_ai_plans_user ON ai_plans(user_id);
