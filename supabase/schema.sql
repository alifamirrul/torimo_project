-- Supabase schema for TORIMO exercise history + premium subscriptions
-- Execute with the service role key (SQL editor or migrations). All objects live in the public schema.

-- 1) Exercise history table ---------------------------------------------------
create table if not exists public.exercise_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  reps integer not null default 0,
  sets integer not null default 1,
  duration_seconds integer,
  calories_burned integer,
  completed_at timestamptz not null default timezone('utc', now())
);

alter table public.exercise_history enable row level security;

drop policy if exists "exercise-history-select-own" on public.exercise_history;
create policy "exercise-history-select-own"
  on public.exercise_history
  for select
  using (auth.uid() = user_id);

drop policy if exists "exercise-history-insert-own" on public.exercise_history;
create policy "exercise-history-insert-own"
  on public.exercise_history
  for insert
  with check (auth.uid() = user_id);

-- 2) Subscription table -------------------------------------------------------
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_type text not null check (plan_type in ('free', 'premium')) default 'free',
  is_active boolean not null default false,
  started_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_user_subscriptions()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_subscriptions_updated_at on public.user_subscriptions;
create trigger user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row
  execute function public.touch_user_subscriptions();

alter table public.user_subscriptions enable row level security;

drop policy if exists "subscriptions-select-own" on public.user_subscriptions;
create policy "subscriptions-select-own"
  on public.user_subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists "subscriptions-upsert-own" on public.user_subscriptions;
create policy "subscriptions-upsert-own"
  on public.user_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "subscriptions-update-own"
  on public.user_subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ensure anon/service role can read/write when required (e.g., backend services)
-- by granting privileges to auth role if needed:
-- grant usage on schema public to anon, authenticated;
-- grant select, insert, update on public.exercise_history to authenticated;
-- grant select, insert, update on public.user_subscriptions to authenticated;

-- 3) Meals table --------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  calories integer not null default 0,
  protein numeric(7,2) not null default 0,
  fat numeric(7,2) not null default 0,
  carbs numeric(7,2) not null default 0,
  category text not null check (category in ('breakfast', 'lunch', 'dinner', 'snack')),
  consumed_at date not null,
  serving_grams numeric(8,2),
  barcode text,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.meals enable row level security;

drop policy if exists "meals-select-own" on public.meals;
create policy "meals-select-own"
  on public.meals
  for select
  using (auth.uid() = user_id);

drop policy if exists "meals-insert-own" on public.meals;
create policy "meals-insert-own"
  on public.meals
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "meals-update-own" on public.meals;
create policy "meals-update-own"
  on public.meals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "meals-delete-own" on public.meals;
create policy "meals-delete-own"
  on public.meals
  for delete
  using (auth.uid() = user_id);

-- Some deployments already have the meals table; ensure required columns exist
-- for barcode meal inserts from the app.
alter table if exists public.meals
  add column if not exists serving_grams numeric(8,2),
  add column if not exists barcode text,
  add column if not exists source text;

-- 4) Daily login tracker -----------------------------------------------------
create table if not exists public.user_daily_logins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  login_date date not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists user_daily_logins_unique
  on public.user_daily_logins (user_id, login_date);

alter table public.user_daily_logins enable row level security;

drop policy if exists "daily-logins-select-own" on public.user_daily_logins;
create policy "daily-logins-select-own"
  on public.user_daily_logins
  for select
  using (auth.uid() = user_id);

drop policy if exists "daily-logins-insert-own" on public.user_daily_logins;
create policy "daily-logins-insert-own"
  on public.user_daily_logins
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily-logins-update-own" on public.user_daily_logins;
create policy "daily-logins-update-own"
  on public.user_daily_logins
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5) Profiles table -----------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid not null references auth.users (id) on delete cascade,
  username text,
  age integer,
  gender text,
  height_cm numeric(6,2),
  current_weight_kg numeric(6,2),
  target_weight_kg numeric(6,2),
  goal text,
  activity_level text,
  agreed_to_terms boolean default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_user_unique
  on public.profiles (supabase_user_id);

alter table public.profiles enable row level security;

drop policy if exists "profiles-select-own" on public.profiles;
create policy "profiles-select-own"
  on public.profiles
  for select
  using (auth.uid() = supabase_user_id);

drop policy if exists "profiles-insert-own" on public.profiles;
create policy "profiles-insert-own"
  on public.profiles
  for insert
  with check (auth.uid() = supabase_user_id);

drop policy if exists "profiles-update-own" on public.profiles;
create policy "profiles-update-own"
  on public.profiles
  for update
  using (auth.uid() = supabase_user_id)
  with check (auth.uid() = supabase_user_id);

-- 6) Workout history + daily summary -----------------------------------------
create table if not exists public.workout_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_type text not null,
  duration_minutes integer not null default 0,
  calories integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  steps integer not null default 0,
  exercise_minutes integer not null default 0,
  calories integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists daily_summary_user_date_unique
  on public.daily_summary (user_id, date);

create or replace function public.touch_daily_summary()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists daily_summary_updated_at on public.daily_summary;
create trigger daily_summary_updated_at
  before update on public.daily_summary
  for each row
  execute function public.touch_daily_summary();

alter table public.workout_history enable row level security;
alter table public.daily_summary enable row level security;

drop policy if exists "workout_history_select_own" on public.workout_history;
create policy "workout_history_select_own"
  on public.workout_history for select
  using (auth.uid() = user_id);

drop policy if exists "workout_history_insert_own" on public.workout_history;
create policy "workout_history_insert_own"
  on public.workout_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_summary_select_own" on public.daily_summary;
create policy "daily_summary_select_own"
  on public.daily_summary for select
  using (auth.uid() = user_id);

drop policy if exists "daily_summary_insert_own" on public.daily_summary;
create policy "daily_summary_insert_own"
  on public.daily_summary for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_summary_update_own" on public.daily_summary;
create policy "daily_summary_update_own"
  on public.daily_summary for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
