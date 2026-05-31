-- Hostel fee pricing by room capacity
-- Admin sets a price for each capacity tier (e.g. 2-person room = 3000, 4-person = 2000)
create table if not exists room_pricing (
  capacity    int  primary key check (capacity > 0),
  hostel_fee  numeric not null default 0,
  updated_at  timestamptz not null default now()
);

alter table room_pricing enable row level security;

-- Seed default tiers (admin can update via UI)
insert into room_pricing (capacity, hostel_fee) values
  (1, 6000),
  (2, 5000),
  (3, 4000),
  (4, 3500)
on conflict (capacity) do nothing;
