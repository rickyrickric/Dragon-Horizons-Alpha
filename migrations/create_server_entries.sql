-- ============================================================================
-- DRAGON HORIZONS SUPABASE MIGRATION
-- ============================================================================
-- Run ALL THREE tables in order for full functionality
-- 1. applications — user applications for server access
-- 2. site_config — global configuration (drive link, server address, etc.)
-- 3. server_entries — event tracking for server entries
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- TABLE 1: applications
-- Stores submitted applications from /api/applications
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists applications (
  id bigserial primary key,
  nickname text not null,
  discord text not null,
  aternos_username text not null unique,
  reason text not null,
  status text default 'pending' check(status in ('pending', 'accepted', 'rejected')),
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists applications_status_idx on applications (status);
create index if not exists applications_aternos_idx on applications (aternos_username);
create index if not exists applications_created_idx on applications (created_at desc);

-- ──────────────────────────────────────────────────────────────────────────
-- TABLE 2: site_config
-- Global configuration key-value store
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists site_config (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Pre-populate with recommended defaults (update these as needed)
insert into site_config (key, value) values
  ('drive_link', 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE'),
  ('server_address', 'recktsdragonhorizon.aternos.me'),
  ('server_port', '20126'),
  ('pack_version', 'v1.0.1 Alpha')
on conflict (key) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- TABLE 3: server_entries
-- Event tracking for server entry attempts
-- ──────────────────────────────────────────────────────────────────────────
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

-- ============================================================================
-- After running this SQL, environment variables must be set:
-- - SUPABASE_URL
-- - SUPABASE_SERVICE_KEY (service role, server-side only)
-- ============================================================================
