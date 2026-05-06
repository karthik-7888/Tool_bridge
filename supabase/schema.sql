create extension if not exists pgcrypto;

create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_name text,
  tool_id text not null,
  tool_name text not null,
  problem text not null,
  response_json jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists analysis_history_user_email_created_at_idx
  on public.analysis_history (user_email, created_at desc);

alter table public.analysis_history enable row level security;

create policy "Users can read their own analysis history"
on public.analysis_history
for select
using (auth.jwt() ->> 'email' = user_email);

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  user_name text,
  tool_id text,
  tool_name text,
  problem text,
  summary text,
  feedback text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists feedback_entries_created_at_idx
  on public.feedback_entries (created_at desc);

alter table public.feedback_entries enable row level security;
