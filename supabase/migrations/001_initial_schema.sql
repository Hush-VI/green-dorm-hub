-- SME Hostels — Initial Schema
-- Run this in the Supabase SQL editor or via the Supabase CLI.

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Meters ────────────────────────────────────────────────────────────────────
create table if not exists meters (
  no          text primary key,
  notice      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Rooms ─────────────────────────────────────────────────────────────────────
create table if not exists rooms (
  no          text primary key,
  capacity    int  not null default 4,
  status      text not null default 'available'
                check (status in ('available', 'full', 'maintenance')),
  meter_no    text references meters(no) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Students ──────────────────────────────────────────────────────────────────
create table if not exists students (
  id              text primary key,           -- e.g. SME-2024-001
  full_name       text not null,
  course          text not null default '',
  level           text not null default '100',
  room_no         text references rooms(no) on delete set null,
  meter_no        text references meters(no) on delete set null,
  phone           text not null default '',
  whatsapp        text not null default '',
  guardian_name   text not null default '',
  guardian_phone  text not null default '',
  username        text not null default '',
  reg_status      text not null default 'unpaid'
                    check (reg_status in ('paid', 'partial', 'unpaid')),
  reg_paid        numeric not null default 0,
  hostel_paid     numeric not null default 0,
  check_status    text not null default 'out'
                    check (check_status in ('in', 'out')),
  last_check_in   timestamptz,
  last_check_out  timestamptz,
  policy_accepted boolean not null default false,
  accepted_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Payments ──────────────────────────────────────────────────────────────────
create table if not exists payments (
  id            text primary key,             -- receipt number, e.g. R-1001
  student_id    text not null references students(id) on delete cascade,
  type          text not null check (type in ('registration', 'hostel')),
  amount        numeric not null,
  method        text not null check (method in ('bank', 'momo', 'cash')),
  payment_date  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ── Store Items ───────────────────────────────────────────────────────────────
create table if not exists store_items (
  id          text primary key,
  name        text not null,
  emoji       text not null default '📦',
  description text not null default '',
  price       numeric not null,
  unit        text not null default 'piece',
  stock       int  not null default 0,
  category    text not null default 'Other',
  available   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Orders ────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id          text primary key,
  student_id  text not null references students(id) on delete cascade,
  note        text,
  total       numeric not null,
  status      text not null default 'pending'
                check (status in ('pending', 'confirmed', 'ready', 'delivered', 'cancelled')),
  unread      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Order Items ───────────────────────────────────────────────────────────────
create table if not exists order_items (
  id        text primary key default gen_random_uuid()::text,
  order_id  text not null references orders(id) on delete cascade,
  item_id   text not null references store_items(id) on delete restrict,
  qty       int  not null check (qty > 0)
);

-- ── SMS Messages ──────────────────────────────────────────────────────────────
create table if not exists sms_messages (
  id               text primary key default gen_random_uuid()::text,
  recipients       text not null,
  recipient_count  int  not null default 1,
  template         text,
  body             text not null,
  status           text not null default 'sent'
                     check (status in ('sent', 'delivered', 'failed')),
  sent_at          timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- ── Settings (single row) ─────────────────────────────────────────────────────
create table if not exists settings (
  id                int  primary key default 1 check (id = 1),  -- enforces single row
  hostel_name       text not null default 'SME Hostels',
  address           text not null default '',
  contact_phone     text not null default '',
  contact_whatsapp  text not null default '',
  email             text not null default '',
  bank_name         text not null default '',
  account_name      text not null default '',
  account_number    text not null default '',
  branch            text not null default '',
  momo_number       text not null default '',
  momo_name         text not null default '',
  registration_fee  numeric not null default 200,
  hostel_fee        numeric not null default 4500,
  sms_sender_id     text not null default 'SMEHOSTEL',
  brand_primary     text not null default '#4CAF50',
  brand_soft        text not null default '#66BB6A',
  brand_mint        text not null default '#A5D6A7',
  updated_at        timestamptz not null default now()
);

-- Seed the single settings row
insert into settings (id) values (1) on conflict (id) do nothing;

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_students_room_no    on students(room_no);
create index if not exists idx_students_meter_no   on students(meter_no);
create index if not exists idx_students_reg_status on students(reg_status);
create index if not exists idx_students_check_status on students(check_status);
create index if not exists idx_payments_student_id on payments(student_id);
create index if not exists idx_payments_type       on payments(type);
create index if not exists idx_orders_student_id   on orders(student_id);
create index if not exists idx_orders_status       on orders(status);
create index if not exists idx_orders_unread       on orders(unread);
create index if not exists idx_order_items_order   on order_items(order_id);
create index if not exists idx_rooms_meter_no      on rooms(meter_no);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- All access goes through the service role key (server-side only).
-- RLS is enabled but only the service role bypass is used.
alter table students      enable row level security;
alter table rooms         enable row level security;
alter table meters        enable row level security;
alter table payments      enable row level security;
alter table store_items   enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table sms_messages  enable row level security;
alter table settings      enable row level security;

-- ── Updated_at trigger ────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_students_updated_at
  before update on students
  for each row execute function set_updated_at();

create or replace trigger trg_rooms_updated_at
  before update on rooms
  for each row execute function set_updated_at();

create or replace trigger trg_meters_updated_at
  before update on meters
  for each row execute function set_updated_at();

create or replace trigger trg_store_items_updated_at
  before update on store_items
  for each row execute function set_updated_at();

create or replace trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create or replace trigger trg_settings_updated_at
  before update on settings
  for each row execute function set_updated_at();
