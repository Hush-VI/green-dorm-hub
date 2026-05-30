## Scope

Complete rebuild of the student and admin experiences on top of the existing iOS-inspired green design system. All data stays client-side (localStorage + mock seed data) — no backend yet. The state and persistence layer is reused by every page so the demo feels real (add a student in admin → it shows in store/fees, etc.).

## Shared foundation (build first)

1. **Data store** (`src/lib/hostel-store.ts`) — typed mock data + persistence:
   - Students, Rooms, Meters, Payments (registration + hostel), Store items + Orders, SMS log, Settings, Policy acceptance per student.
   - Simple React context + hooks (`useHostel()`) backed by localStorage so changes survive reloads.
2. **Auth shim** — login page already exists; on student sign-in we set `currentStudentId`. First-login flow checks `policyAccepted[studentId]`.
3. **Layout primitives**:
   - `StudentShell` — header + floating glassmorphism bottom nav (5 tabs).
   - `AdminShell` — collapsible glass sidebar (240/72) on desktop, floating bottom nav on mobile, sticky frosted page header slot.
4. **Reusable bits**: KPI card, status badge, modal (full-screen + sheet variants), accordion, toast, copy-button, confirm-dialog, simple chart wrappers around existing Recharts.
5. **Placeholder doc**: `public/notice-and-details-of-reporting.docx` (downloadable). If you have the official copy, drop it in and we'll swap the file.

## Student portal (`/portal/*`)

- **Policy Gate** (`PolicyGateModal`) — full-screen, green header, download button, 10 numbered sections (Registration Fee, Hostel Fee, Check-In/Out, Electricity, Noise & Conduct, Room Maintenance, Visitors, Communication & WhatsApp, Store Purchases, Compliance). Scroll detector unlocks the checkbox; bouncing "Scroll to read all" chip until reached. Accept persists `policyAccepted[studentId] = true`.
- **/portal** Home — gradient header (hostel name, greeting, course, ID), Switch button, profile avatar link, status card (check-in + reg fee badges, last check-in, Check In/Out buttons with confirm modals), 4 quick stats, Hostel Fee card with progress + Pay Now, Registration Fee card with blue progress + View Details, 4 action cards (Fees, Store w/ pending badge, Meter, History), Guardian contact.
- **/portal/profile** — avatar circle (initials), badges, static info, editable contact section (Edit/Save/Cancel), policy acceptance badge.
- **/portal/fees** — Hostel Fee + Registration Fee cards, How-to-Pay accordion (Bank Transfer + MoMo with copy-buttons + Student-ID reference warning), payment history, contact card.
- **/portal/store** — category filter pills, 2-col product grid (emoji, name, desc, price, low-stock warning), add-to-cart → quantity stepper, cart sheet (items, quantities, note, total, Place Order), Pay-on-delivery note, My Orders with status badges, success toast.
- **/portal/more** → Meter Info + Check-In History pages reached from here:
  - **/portal/meter** — large meter number, room chips (own highlighted), shared-students list, amber meter notices.
  - **/portal/history** — Total / This Month cards, full activity log.
- Bottom nav: Home · Profile · Fees · Store · More (floating glassmorphism with sliding pill we already built).

## Admin portal (`/admin/*`)

Sidebar items: Dashboard, Students, Rooms, Meters, Registration Fees, Hostel Fees, Check-In Records, Store, SMS Center, Reports, Settings.

- **Dashboard** — Switch User button, new-order alert, live dot, 9 clickable KPI cards (2/3/4 col responsive), Occupancy area chart + Fee Collection grouped bar chart, bottom row: Check-In bar chart + Recent Activity feed + Quick Actions.
- **Students** — search, status + check-in filters, 3 summary cards, student cards with badges + edit/delete, Add/Edit modal (2-col form), delete confirm.
- **Rooms** — 4 stats, room cards (occupancy bar, occupants, meter), Add/Edit modal.
- **Meters** — meter group cards (rooms + students chips + active notices), Add/Edit modal with room multi-select grid.
- **Registration Fees** — 4 summary cards, outstanding card, Overview/Paid/Unpaid tabs, student list w/ progress, Record Payment modal, receipt link, recent payments.
- **Hostel Fees** — same shape, plus Payment Details modal (bank, account, branch, MoMo, annual fee).
- **Check-In Records** — Currently In/Out cards, In-Hostel chips, Today/Week/Month/All tabs, full record list.
- **Store** — Orders tab (status pills, order cards with green left border for unread, expandable detail, progressive action buttons) and Inventory tab (stock summary, item list, Add/Edit modal).
- **SMS Center** — 3 stat cards, Quick Send Templates, Media Share card, SMS log, Compose modal (recipient dropdown with live count, template selector, char count), Media modal.
- **Reports** — 5 tabs (Students / Occupancy / Fees / Meters / SMS) with KPIs + charts, Export button (UI).
- **Settings** — Save button + "Saved ✓" toast; Hostel Info, Fee Settings, SMS config, brand swatch row, system info.

## Build order

1. Foundation: store/context, shells, primitives, policy modal, placeholder docx.
2. Student portal: Home, Policy gate wiring, Profile, Fees, Store, Meter, History.
3. Admin portal: Dashboard, Students, Rooms, Meters.
4. Admin portal: Reg Fees, Hostel Fees, Check-In.
5. Admin portal: Store, SMS Center, Reports, Settings.
6. Polish pass: animations, empty/loading/error states, mobile QA at 390 + desktop QA at 1366.

## Open question

You mentioned a `NOTICE AND DETAILS OF REPORTING.docx` file that students should be able to download. I don't see it attached — should I (a) generate a placeholder docx with the 10 policy sections so the download works in the demo, or (b) wait for you to upload the official file? I'll proceed with (a) unless you say otherwise.

## Technical notes

- No backend; everything via `useHostel()` over localStorage so admin edits show up in the student portal immediately.
- All charts use hex (#4CAF50, #66BB6A, #A5D6A7) for SVG compatibility.
- Routes use TanStack flat-file naming (`portal.profile.tsx`, `admin.students.tsx`, etc.) with `_layout` files for the shared shells.
- Reuses existing tokens (`bg-gradient-primary`, `squircle`, `glass`, `glass-strong`, `safe-bottom`, sliding-pill nav pattern).
