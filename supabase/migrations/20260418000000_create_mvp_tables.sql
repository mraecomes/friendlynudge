-- Migration: create MVP tables with RLS
-- Issue #2 — applied 2026-04-18

-- timelines table
create table timelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid references timelines(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  duration_days integer not null,
  status text check (status in ('not_started', 'in_progress', 'complete', 'blocked')) default 'not_started',
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- dependencies table
create table dependencies (
  id uuid primary key default gen_random_uuid(),
  predecessor_id uuid references tasks(id) on delete cascade not null,
  successor_id uuid references tasks(id) on delete cascade not null,
  type text default 'finish_to_start',
  unique(predecessor_id, successor_id)
);

-- RLS
alter table timelines enable row level security;
alter table tasks enable row level security;
alter table dependencies enable row level security;

create policy "Users manage own timelines"
  on timelines for all
  using (auth.uid() = user_id);

create policy "Users manage own tasks"
  on tasks for all
  using (
    exists (
      select 1 from timelines
      where timelines.id = tasks.timeline_id
      and timelines.user_id = auth.uid()
    )
  );

create policy "Users manage own dependencies"
  on dependencies for all
  using (
    exists (
      select 1 from tasks
      join timelines on timelines.id = tasks.timeline_id
      where tasks.id = dependencies.predecessor_id
      and timelines.user_id = auth.uid()
    )
  );
