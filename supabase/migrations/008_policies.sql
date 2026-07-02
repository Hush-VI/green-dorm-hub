create table if not exists policies (
  id          serial primary key,
  title       text not null,
  body        text not null,
  sort_order  int  not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table policies enable row level security;

create or replace trigger trg_policies_updated_at
  before update on policies
  for each row execute function set_updated_at();

-- Seed with existing policies
insert into policies (title, body, sort_order) values
('SME Hostel Pricing & Capacity', 'GHC 6,000 for four in a room · GHC 8,000 for three in a room · GHC 8,000 for two in a room.', 1),
('What Your Hostel Fees Cover', 'Accommodation (bed space in shared/dorm or private room), utilities (electricity with usage limits, water, WiFi + generator backup), furniture & setup (bed frame, mattress, pillow — bring your own sheets unless you buy our bedding package), shared spaces (lounge/TV area, kitchen, dining, shared bathrooms), 24/7 security (guards, CCTV, access control), common area cleaning daily, dorm rooms weekly, professional washroom cleaning every 2 weeks, and sanitation & maintenance (regular garbage collection from central bins — littering around the hostel shall come with a fine or disciplinary action).', 2),
('Usually Not Included in Hostel Fees', 'Beddings (duvet, sheets, pillowcases — unless you got the bedding pack), laundry (separate cost or coin/token machines), personal mobile data (WiFi is free but airtime is on you), food (kitchen is self-cook; meal plans only if offered), storage lockers (may carry a small monthly fee), and damages (you pay for anything you break).', 3),
('Registration Fee — GHC 100 (One-Time, Non-Refundable)', 'Covers: admin/onboarding, access items (room key/card + spare, locker key — replacements cost extra), move-in prep, caution deposit (non-refundable), and welcome pack. Does NOT cover rent, beddings, extra utilities, laundry, meals, or parking.', 4),
('Furniture & Room Care', 'Don''t bring extra furniture. Use only what''s provided and take care of all items. Damage or missing items = pay double replacement cost. Wilful damage = 2x repair cost. No moving or interchanging furniture between rooms. Damage/theft in corridors or common areas = cost shared by all students in that wing.', 5),
('Electricity & Appliances', 'No high-power appliances in rooms: microwave, heater, washing machine, electric stove, rice cooker, etc. — confiscated if found. Switch off lights/fans when leaving your room. Bathroom lights only when in use. Fines apply for wasting electricity.', 6),
('Room Checks', 'The Hostel Manager, porters, or security can inspect rooms and belongings at any time, with the student present.', 7),
('Discipline & Expulsion', 'Breaking rules, disobeying staff, damaging property, or anti-social/violent acts = immediate termination. Deposit forfeited + no hostel fee refund if expelled.', 8),
('Going Out / Outstation', 'Going outstation for competitions requires written parent consent + Hostel Council approval. Inform the porter and sign the Outstation Register before leaving.', 9),
('Celebrations', 'Festivals/birthdays allowed only with prior permission. Birthdays: 8–10 PM, max 2 hours, common area only, no outside guests, must not disturb others.', 10),
('Respect for Staff', 'Treat all hostel and housekeeping staff with respect. Do not use housekeeping for personal errands. No tips or gifts.', 11),
('Strictly Prohibited', 'Ragging/fighting/violence (report immediately; expulsion + legal action) · Alcohol/drugs/smoking (zero tolerance; expulsion + legal action) · Gambling (banned; expulsion) · Internet/social media misuse (no defamatory posts about hostel, staff, or students) · Politics/communal activity (no propaganda against law/order) · Media (no interviews about the hostel to press/TV/radio without the Registrar''s written permission).', 12),
('Vacation Policy & Overstay Fee', 'Residents'' personal belongings must not be left in the hostel during vacation. Management will not be held responsible for any loss or damages. Residents who stay over during vacation will be charged GHC 30 per day.', 13),
('Quiet Hours (10pm – 6am)', 'Keep noise to a minimum to respect fellow residents preparing for classes and rest.', 14),
('Communication & WhatsApp Channel', 'Official announcements are sent via the SME Hostels WhatsApp channel. You must join and keep notifications on. Ignoring official communications is not an excuse for non-compliance.', 15),
('Default & Disciplinary Action', 'Default in any of the hostel contractual policies shall result in an appreciable fine, disciplinary action, or being totally expelled from the hostel without a refund or compensation; depending on the nature of the wrongful act or harm caused. This shall solely be effected by management decision as and when possible.', 16);
