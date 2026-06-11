-- Add avatar URL to students
alter table students add column if not exists avatar_url text;
