alter table students add column if not exists avatar_url text;
alter table students add column if not exists gender text check (gender in ('male', 'female', 'other'));
