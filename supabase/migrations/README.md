# Supabase migrations — Gym Mode sprint

Run in order in Supabase SQL Editor (or `supabase db push` if using Supabase CLI linked to your project).

## Prerequisites

Base schema must exist first:

1. `supabase/migration.sql` (user_profiles, ai_plans, etc.)

## One-shot apply (recommended)

Run **`supabase/apply_all_gym_sprint.sql`** in the Supabase SQL Editor after `migration.sql`. It runs all gym sprint migrations plus RLS fixes in order and is safe to re-run (idempotent policies and `ON CONFLICT` seed).

## Gym sprint migrations (in order)

| File | Purpose |
|------|---------|
| `20260519000001_gym_tables.sql` | gym_weekly_plans, exercise_library, exercise_swaps, daily_progress, notification_queue |
| `20260519000002_gym_tables_rls.sql` | RLS policies for new tables |
| `20260519000003_seed_exercise_library.sql` | Seed 56 exercises from `EXERCISE_LIBRARY` |
| `20260520000001_gym_prebookings.sql` | Physical gym pre-booking signups (name, email, phone, city) |

## RLS fixes (run after base migration)

- `supabase/fix_user_profiles_rls.sql`
- `supabase/fix_ai_plans_rls.sql`

## Regenerate seed from codebase

```bash
npm run generate:seed
```

Then re-run `20260519000003_seed_exercise_library.sql` in SQL Editor.
