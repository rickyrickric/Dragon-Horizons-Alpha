-- Migration: create_server_entries
-- Run this in your Supabase SQL editor or via psql against the project's database.

create table if not exists server_entries (
  id bigserial primary key,
  nickname text,
  discord text,
  aternos_username text,
  ip text,
  user_agent text,
  source text,
  created_at timestamptz default now()
);

create index if not exists server_entries_aternos_idx on server_entries (aternos_username);
create index if not exists server_entries_created_idx on server_entries (created_at desc);
