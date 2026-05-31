-- Admin accounts
create table if not exists admins (
  id            text primary key default gen_random_uuid()::text,
  username      text not null unique,
  password_hash text not null,
  full_name     text not null default '',
  created_at    timestamptz not null default now()
);

alter table admins enable row level security;

-- Add password_hash to students (for student login)
alter table students add column if not exists password_hash text not null default '';
