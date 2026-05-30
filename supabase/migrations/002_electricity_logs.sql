-- Electricity top-up logs
-- Students paste their prepaid confirmation SMS here after buying outside the system.
-- The system broadcasts to all meter-mates via SMS and logs it here.

create table if not exists electricity_logs (
  id            text primary key default gen_random_uuid()::text,
  student_id    text not null references students(id) on delete cascade,
  meter_no      text not null references meters(no) on delete cascade,
  amount        numeric not null,
  confirmation  text not null,   -- the pasted confirmation SMS text
  broadcast_sms text,            -- the SMS that was sent to meter-mates
  sms_status    text not null default 'sent'
                  check (sms_status in ('sent', 'failed')),
  logged_at     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_electricity_logs_meter   on electricity_logs(meter_no);
create index if not exists idx_electricity_logs_student on electricity_logs(student_id);

alter table electricity_logs enable row level security;
