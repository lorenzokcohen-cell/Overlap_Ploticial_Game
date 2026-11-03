-- Overlap database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Then run supabase/seed.sql the same way.

-- ─────────────────────────────────────────────────────────────
-- 1. Profiles: optional demographics, one row per account
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  consent_at      timestamptz,                -- when they agreed to research use
  party           text check (party in ('democrat','lean_democrat','independent','lean_republican','republican','other','prefer_not')),
  age_bracket     text check (age_bracket in ('18-24','25-34','35-44','45-54','55-64','65+','prefer_not')),
  gender          text check (gender in ('woman','man','nonbinary','self_describe','prefer_not')),
  race            text[] default '{}',         -- multi-select, see lib/options.ts
  economic_status text check (economic_status in ('low','middle_low','middle_upper','upper','prefer_not')),
  education       text check (education in ('less_than_hs','hs','some_college','associates','bachelors','graduate','prefer_not')),
  state           text
);

-- ─────────────────────────────────────────────────────────────
-- 2. Typology results (latest + history)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.typology_results (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  category    text not null,
  econ_score  int  not null,     -- -8 (more government) … +8 (less government)
  social_score int not null,     -- -8 (change) … +8 (tradition)
  answers     jsonb not null     -- {questionId: "a" | "b"}
);
create index if not exists typology_user_idx on public.typology_results(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 3. Sourced game items (national polls, every row has a citation)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.game_items (
  id                text primary key,
  statement         text not null,
  original_wording  text,
  d                 int  not null check (d between 0 and 100),
  r                 int  not null check (r between 0 and 100),
  pollster          text not null,
  fielded           text,
  url               text not null,
  notes             text,
  topic             text,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 4. Overlap's own questionnaire
-- ─────────────────────────────────────────────────────────────
create table if not exists public.poll_questions (
  id             text primary key,
  statement      text not null,
  topic          text,
  source_item_id text references public.game_items(id),  -- national benchmark, if any
  active         boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.poll_responses (
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  text not null references public.poll_questions(id) on delete cascade,
  answer       smallint not null check (answer between 1 and 5),  -- 1 strongly disagree … 5 strongly agree
  answered_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ─────────────────────────────────────────────────────────────
-- 5. Game plays (scores and streaks for signed-in players)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.game_plays (
  user_id      uuid not null references auth.users(id) on delete cascade,
  puzzle_no    int  not null,
  score        int  not null,
  gap_over     int  not null,      -- avg. points by which they overestimated the party gap
  rounds       jsonb not null,
  played_at    timestamptz not null default now(),
  primary key (user_id, puzzle_no)
);

-- ─────────────────────────────────────────────────────────────
-- Row-level security: people can only see and change their own rows
-- ─────────────────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.typology_results enable row level security;
alter table public.game_items       enable row level security;
alter table public.poll_questions   enable row level security;
alter table public.poll_responses   enable row level security;
alter table public.game_plays       enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own typology" on public.typology_results;
create policy "own typology" on public.typology_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "read active items" on public.game_items;
create policy "read active items" on public.game_items
  for select using (active);

drop policy if exists "read active questions" on public.poll_questions;
create policy "read active questions" on public.poll_questions
  for select using (active);

drop policy if exists "own responses" on public.poll_responses;
create policy "own responses" on public.poll_responses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own plays" on public.game_plays;
create policy "own plays" on public.game_plays
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Community results: aggregates only, never individual rows.
-- A question appears only once each party side has at least min_n respondents,
-- so no one can be singled out.
-- Democrat side = democrat + lean_democrat; Republican side = republican + lean_republican.
-- "Agree" = answers 4 or 5.
-- ─────────────────────────────────────────────────────────────
create or replace function public.community_results(min_n int default 100)
returns table (
  question_id text, statement text, d int, r int, n_d int, n_r int
)
language sql stable security definer set search_path = public as $$
  with tagged as (
    select pr.question_id, pr.answer,
      case when p.party in ('democrat','lean_democrat') then 'd'
           when p.party in ('republican','lean_republican') then 'r' end as side
    from poll_responses pr
    join profiles p on p.id = pr.user_id
    where p.consent_at is not null
  ),
  agg as (
    select question_id,
      count(*) filter (where side='d') as n_d,
      count(*) filter (where side='r') as n_r,
      count(*) filter (where side='d' and answer>=4) as a_d,
      count(*) filter (where side='r' and answer>=4) as a_r
    from tagged where side is not null
    group by question_id
  )
  select q.id, q.statement,
    round(100.0*a.a_d/a.n_d)::int, round(100.0*a.a_r/a.n_r)::int,
    a.n_d::int, a.n_r::int
  from agg a join poll_questions q on q.id = a.question_id
  where q.active and a.n_d >= greatest(min_n, 30) and a.n_r >= greatest(min_n, 30);
$$;
revoke all on function public.community_results(int) from public;
grant execute on function public.community_results(int) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Let a signed-in person delete their whole account and all their data.
-- ─────────────────────────────────────────────────────────────
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();   -- cascades to every table above
end; $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
