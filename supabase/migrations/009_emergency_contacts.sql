-- Add emergency contacts to the settings table
alter table settings add column if not exists emergency_security text not null default '';
alter table settings add column if not exists emergency_medical text not null default '';
alter table settings add column if not exists office_hours text not null default 'Mon–Sat · 8:00 AM – 8:00 PM';
