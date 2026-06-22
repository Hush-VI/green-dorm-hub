-- Payment receipts uploaded by students
create table if not exists payment_receipts (
  id           text primary key default gen_random_uuid()::text,
  student_id   text not null references students(id) on delete cascade,
  image_url    text not null,
  amount       numeric,
  description  text,                -- e.g. "Registration fee", "Hostel fee"
  status       text not null default 'pending'
                 check (status in ('pending', 'verified', 'rejected')),
  admin_note   text,
  uploaded_at  timestamptz not null default now(),
  reviewed_at  timestamptz
);

create index if not exists idx_receipts_student on payment_receipts(student_id);
create index if not exists idx_receipts_status  on payment_receipts(status);

alter table payment_receipts enable row level security;
