import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard, Users, DoorOpen, Zap, Wallet, Building2, ClipboardList,
  ShoppingBag, MessageSquare, BarChart3, Settings as SettingsIcon, LogOut,
  ChevronLeft, ChevronRight, Bell, Search, Plus, Edit3, Trash2, X, Save,
  CheckCircle2, XCircle, AlertTriangle, Copy, Check, Send, Image as ImageIcon,
  Video, FileText, ArrowRight, MoreHorizontal,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { fmtGHS, fmtTime, fmtDate, initials } from "@/lib/hostel-store";
import type { StudentRow, RoomRow, MeterRow, StoreItemRow, OrderRow } from "@/lib/database.types";
import {
  useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent,
  useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom,
  useMeters, useCreateMeter, useUpdateMeter, useDeleteMeter,
  usePayments, useRecordPayment,
  useStoreItems, useCreateStoreItem, useUpdateStoreItem, useDeleteStoreItem,
  useOrders, useUpdateOrderStatus, useMarkOrderRead,
  useSmsMessages, useSendSms, useResolveRecipients,
  useSettings, useUpdateSettings,
  useElectricityLogs,
} from "@/lib/queries";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SME Hostels" }] }),
  component: Admin,
});

type Nav =
  | "dashboard" | "students" | "rooms" | "meters"
  | "regfees" | "hostelfees" | "checkins"
  | "store" | "sms" | "reports" | "settings";

const NAV: { key: Nav; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "students", label: "Students", icon: Users },
  { key: "rooms", label: "Rooms", icon: DoorOpen },
  { key: "meters", label: "Meters", icon: Zap },
  { key: "regfees", label: "Registration Fees", icon: Wallet },
  { key: "hostelfees", label: "Hostel Fees", icon: Building2 },
  { key: "checkins", label: "Check-In Records", icon: ClipboardList },
  { key: "store", label: "Store", icon: ShoppingBag },
  { key: "sms", label: "SMS Center", icon: MessageSquare },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const COLORS = { primary: "#4CAF50", soft: "#66BB6A", mint: "#A5D6A7", blue: "#0EA5E9", amber: "#F59E0B", violet: "#8B5CF6" };

/* =========================  SHELL  ========================= */

function Admin() {
  const nav = useNavigate();
  const [page, setPage] = useState<Nav>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: settings } = useSettings();
  const { data: orders = [] } = useOrders();
  const unreadOrders = orders.filter((o) => o.unread).length;

  function switchUser() { nav({ to: "/" }); }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`hidden lg:flex sticky top-0 h-screen shrink-0 flex-col border-r border-border glass-strong transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[240px]"}`}>
        <div className="flex items-center gap-2 px-3 py-4">
          <img src={logo} alt="" className="h-9 w-9 squircle bg-white p-1 object-contain" />
          {!collapsed && <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div><div className="text-sm font-bold leading-tight">{settings?.hostel_name}</div></div>}
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2">
          {NAV.map((n) => {
            const active = n.key === page;
            const badge = n.key === "store" ? unreadOrders : 0;
            return (
              <button key={n.key} onClick={() => setPage(n.key)} title={collapsed ? n.label : undefined}
                className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gradient-primary text-white shadow-soft" : "text-foreground/80 hover:bg-muted/50"}`}>
                <n.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{n.label}</span>}
                {badge > 0 && !collapsed && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{badge}</span>}
                {badge > 0 && collapsed && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />}
              </button>
            );
          })}
        </div>
        <div className="space-y-1 p-2">
          <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}{!collapsed && "Collapse"}
          </button>
          <button onClick={switchUser} className="flex w-full items-center gap-3 rounded-2xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20">
            <LogOut className="h-4 w-4" />{!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 lg:px-8 lg:pb-10">
          <div key={page} className="animate-fade-in">
            {page === "dashboard" && <Dashboard onNav={setPage} onSwitch={switchUser} />}
            {page === "students" && <StudentsPage />}
            {page === "rooms" && <RoomsPage />}
            {page === "meters" && <MetersPage />}
            {page === "regfees" && <FeesPage type="registration" />}
            {page === "hostelfees" && <FeesPage type="hostel" />}
            {page === "checkins" && <CheckInsPage />}
            {page === "store" && <StoreAdminPage />}
            {page === "sms" && <SmsPage />}
            {page === "reports" && <ReportsPage />}
            {page === "settings" && <SettingsPage />}
          </div>
        </div>
      </main>

      <MobileNav page={page} onChange={setPage} onMore={() => setMobileNavOpen(true)} unread={unreadOrders} />
      {mobileNavOpen && <MobileMore current={page} onPick={(p) => { setPage(p); setMobileNavOpen(false); }} onClose={() => setMobileNavOpen(false)} onSignOut={switchUser} />}
    </div>
  );
}

/* =========================  DASHBOARD  ========================= */

function Dashboard({ onNav, onSwitch }: { onNav: (p: Nav) => void; onSwitch: () => void }) {
  const { data: students = [] } = useStudents();
  const { data: orders = [] } = useOrders();
  const { data: smsMessages = [] } = useSmsMessages();
  const { data: settings } = useSettings();
  const { data: rooms = [] } = useRooms();
  const { data: meters = [] } = useMeters();
  const { data: allPayments = [] } = usePayments();

  const checkedIn = students.filter((s) => s.check_status === "in").length;
  const regPaid = students.filter((s) => s.reg_status === "paid").length;
  const hostelPaid = students.filter((s) => s.hostel_paid >= (settings?.hostel_fee ?? 0)).length;
  const unreadOrders = orders.filter((o) => o.unread).length;
  const smsThisMonth = smsMessages.filter((m) => new Date(m.sent_at).getMonth() === new Date().getMonth()).length;

  // Real chart data from payments
  const feeData = useMemo(() => {
    const regCollected = students.reduce((a, s) => a + s.reg_paid, 0);
    const hostelCollected = students.reduce((a, s) => a + s.hostel_paid, 0);
    const regOutstanding = students.reduce((a, s) => a + Math.max(0, (settings?.registration_fee ?? 200) - s.reg_paid), 0);
    const hostelOutstanding = students.reduce((a, s) => a + Math.max(0, (settings?.hostel_fee ?? 4500) - s.hostel_paid), 0);
    return [
      { name: "Registration", collected: regCollected, outstanding: regOutstanding },
      { name: "Hostel", collected: hostelCollected, outstanding: hostelOutstanding },
    ];
  }, [students, settings]);

  // Occupancy by month from check-in timestamps
  const occupancyData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const m = (now.getMonth() - 5 + i + 12) % 12;
      const count = students.filter((s) => s.last_check_in && new Date(s.last_check_in).getMonth() === m).length;
      return { name: months[m], students: count };
    });
  }, [students]);

  // Recent activity from real data
  const recentActivity = useMemo(() => {
    const items: { icon: typeof ShoppingBag; text: string; time: string; color: string }[] = [];
    const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2);
    recentOrders.forEach((o) => {
      const st = students.find((s) => s.id === o.student_id);
      items.push({ icon: ShoppingBag, text: `New order from ${st?.full_name ?? "Unknown"}`, time: fmtTime(new Date(o.created_at).getTime()), color: "text-amber-600 bg-amber-100" });
    });
    const recentPayments = [...allPayments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).slice(0, 2);
    recentPayments.forEach((p) => {
      items.push({ icon: Wallet, text: `Payment recorded · ${fmtGHS(p.amount)}`, time: fmtTime(new Date(p.payment_date).getTime()), color: "text-sky-600 bg-sky-100" });
    });
    return items.slice(0, 4);
  }, [orders, allPayments, students]);

  return (
    <div className="space-y-6">
      <StickyHeader title="Dashboard" subtitle={(settings?.hostel_name ?? "SME Hostels") + " · Operations overview"}
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>Live
            </span>
            {unreadOrders > 0 && (
              <button onClick={() => onNav("store")} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:opacity-95">
                <Bell className="h-3.5 w-3.5" /> {unreadOrders} new order{unreadOrders > 1 ? "s" : ""}
              </button>
            )}
            <button onClick={onSwitch} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium"><LogOut className="h-3.5 w-3.5" /> Switch</button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi icon={Users} label="Total Students" value={students.length} onClick={() => onNav("students")} />
        <Kpi icon={CheckCircle2} label="Checked In" value={checkedIn} color="primary" onClick={() => onNav("checkins")} />
        <Kpi icon={XCircle} label="Checked Out" value={students.length - checkedIn} color="muted" onClick={() => onNav("checkins")} />
        <Kpi icon={Wallet} label="Reg. Fees Paid" value={regPaid} color="blue" onClick={() => onNav("regfees")} />
        <Kpi icon={Building2} label="Hostel Fees Paid" value={hostelPaid} color="primary" onClick={() => onNav("hostelfees")} />
        <Kpi icon={DoorOpen} label="Total Rooms" value={rooms.length} onClick={() => onNav("rooms")} />
        <Kpi icon={Zap} label="Meter Groups" value={meters.length} color="violet" onClick={() => onNav("meters")} />
        <Kpi icon={ShoppingBag} label="Store Orders" value={orders.length} color="amber" badge={unreadOrders} onClick={() => onNav("store")} />
        <Kpi icon={MessageSquare} label="SMS This Month" value={smsThisMonth} color="violet" onClick={() => onNav("sms")} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Student Occupancy (by check-in month)">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={occupancyData}>
              <defs><linearGradient id="occ" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.45} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
              <Area type="monotone" dataKey="students" stroke={COLORS.primary} fill="url(#occ)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Fee Collection">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="collected" fill={COLORS.primary} radius={[6,6,0,0]} />
              <Bar dataKey="outstanding" fill={COLORS.amber} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Recent Activity">
          {recentActivity.length === 0 && <div className="text-sm text-muted-foreground">No recent activity.</div>}
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${a.color}`}><a.icon className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm">{a.text}</div><div className="text-xs text-muted-foreground">{a.time}</div></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Quick Actions">
          <div className="space-y-2">
            <QuickAction icon={Plus} label="Add Student" onClick={() => onNav("students")} />
            <QuickAction icon={Wallet} label="Record Payment" onClick={() => onNav("hostelfees")} />
            <QuickAction icon={ShoppingBag} label="View Orders" badge={unreadOrders} onClick={() => onNav("store")} />
            <QuickAction icon={MessageSquare} label="Send SMS" onClick={() => onNav("sms")} />
            <QuickAction icon={BarChart3} label="View Reports" onClick={() => onNav("reports")} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* =========================  STUDENTS  ========================= */

function StudentsPage() {
  const { data: students = [] } = useStudents();
  const { data: rooms = [] } = useRooms();
  const { data: meters = [] } = useMeters();
  const createMut = useCreateStudent();
  const updateMut = useUpdateStudent();
  const deleteMut = useDeleteStudent();
  const [q, setQ] = useState("");
  const [regFilter, setRegFilter] = useState<"all"|"paid"|"partial"|"unpaid">("all");
  const [chkFilter, setChkFilter] = useState<"all"|"in"|"out">("all");
  const [edit, setEdit] = useState<StudentRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<StudentRow | null>(null);

  const filtered = students.filter((s) => {
    const match = (s.full_name + s.id + s.course + (s.room_no ?? "")).toLowerCase().includes(q.toLowerCase());
    return match && (regFilter === "all" || s.reg_status === regFilter) && (chkFilter === "all" || s.check_status === chkFilter);
  });

  return (
    <div className="space-y-4">
      <StickyHeader title="Students" subtitle={`${students.length} total`}
        actions={<button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Student</button>} />
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Total" value={students.length} />
        <MiniStat label="Checked In" value={students.filter((s) => s.check_status === "in").length} accent="primary" />
        <MiniStat label="Unpaid Reg." value={students.filter((s) => s.reg_status !== "paid").length} accent="amber" />
      </div>
      <div className="squircle bg-white p-3 shadow-soft flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, course, room"
            className="w-full rounded-xl bg-muted/40 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={regFilter} onChange={(e) => setRegFilter(e.target.value as any)} className="rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
          <option value="all">All Reg.</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option>
        </select>
        <select value={chkFilter} onChange={(e) => setChkFilter(e.target.value as any)} className="rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
          <option value="all">All Status</option><option value="in">Checked In</option><option value="out">Checked Out</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.id} className="squircle bg-white p-4 shadow-soft animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">{initials(s.full_name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-bold truncate">{s.full_name}</div>
                  <BadgeReg status={s.reg_status} /><BadgeChk status={s.check_status} />
                </div>
                <div className="text-xs text-muted-foreground">{s.id} · {s.course}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>🚪 {s.room_no ?? "—"}</span><span>⚡ {s.meter_no ?? "—"}</span><span>📞 {s.phone}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEdit(s)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDel(s)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No students match.</div>}
      </div>
      {(edit || adding) && (
        <StudentModal initial={edit ?? undefined} rooms={rooms} meters={meters}
          onClose={() => { setEdit(null); setAdding(false); }}
          onSave={(data) => {
            if (edit) updateMut.mutate({ id: edit.id, patch: data });
            else createMut.mutate(data as any);
            setEdit(null); setAdding(false);
          }} />
      )}
      {del && <ConfirmModal title={`Delete ${del.full_name}?`} body="This cannot be undone."
        onCancel={() => setDel(null)} onConfirm={() => { deleteMut.mutate(del.id); setDel(null); }} />}
    </div>
  );
}

function StudentModal({ initial, rooms, meters, onClose, onSave }: {
  initial?: StudentRow; rooms: RoomRow[]; meters: MeterRow[];
  onClose: () => void; onSave: (s: Partial<StudentRow>) => void;
}) {
  const [f, setF] = useState({
    id: initial?.id ?? "SME-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900)),
    full_name: initial?.full_name ?? "",
    course: initial?.course ?? "",
    level: initial?.level ?? "100",
    room_no: initial?.room_no ?? (rooms[0]?.no ?? null),
    meter_no: initial?.meter_no ?? (meters[0]?.no ?? null),
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    guardian_name: initial?.guardian_name ?? "",
    guardian_phone: initial?.guardian_phone ?? "",
    username: initial?.username ?? "",
    reg_status: initial?.reg_status ?? "unpaid" as const,
    reg_paid: initial?.reg_paid ?? 0,
    hostel_paid: initial?.hostel_paid ?? 0,
    check_status: initial?.check_status ?? "out" as const,
    policy_accepted: initial?.policy_accepted ?? false,
  });
  return (
    <Modal title={initial ? "Edit Student" : "Add Student"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Full Name" value={f.full_name} onChange={(v) => setF({ ...f, full_name: v })} />
        <FormField label="Student ID" value={f.id} onChange={(v) => setF({ ...f, id: v })} disabled={!!initial} />
        <FormField label="Course" value={f.course} onChange={(v) => setF({ ...f, course: v })} />
        <FormField label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
        <FormField label="WhatsApp" value={f.whatsapp} onChange={(v) => setF({ ...f, whatsapp: v })} />
        <FormField label="Guardian Name" value={f.guardian_name} onChange={(v) => setF({ ...f, guardian_name: v })} />
        <FormField label="Guardian Phone" value={f.guardian_phone} onChange={(v) => setF({ ...f, guardian_phone: v })} />
        <FormSelect label="Room" value={f.room_no ?? ""} onChange={(v) => setF({ ...f, room_no: v || null })} options={rooms.map((r) => r.no)} />
        <FormSelect label="Meter" value={f.meter_no ?? ""} onChange={(v) => setF({ ...f, meter_no: v || null })} options={meters.map((m) => m.no)} />
        <FormSelect label="Registration Status" value={f.reg_status} onChange={(v) => setF({ ...f, reg_status: v as any })} options={["paid","partial","unpaid"]} />
        <FormField label="Amount Paid (Reg.)" type="number" value={String(f.reg_paid)} onChange={(v) => setF({ ...f, reg_paid: Number(v) })} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  ROOMS  ========================= */

function RoomsPage() {
  const { data: rooms = [] } = useRooms();
  const { data: students = [] } = useStudents();
  const { data: meters = [] } = useMeters();
  const createMut = useCreateRoom();
  const updateMut = useUpdateRoom();
  const deleteMut = useDeleteRoom();
  const [edit, setEdit] = useState<RoomRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<RoomRow | null>(null);

  return (
    <div className="space-y-4">
      <StickyHeader title="Rooms" subtitle={`${rooms.length} rooms`}
        actions={<button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Room</button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total" value={rooms.length} />
        <MiniStat label="Available" value={rooms.filter((r) => r.status === "available").length} accent="primary" />
        <MiniStat label="Full" value={rooms.filter((r) => r.status === "full").length} accent="amber" />
        <MiniStat label="Maintenance" value={rooms.filter((r) => r.status === "maintenance").length} accent="destructive" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((r) => {
          const occ = students.filter((s) => s.room_no === r.no);
          const pct = (occ.length / r.capacity) * 100;
          return (
            <div key={r.no} className="squircle bg-white p-4 shadow-soft animate-slide-up">
              <div className="flex items-center justify-between">
                <div><div className="text-lg font-bold">{r.no}</div><div className="text-xs text-muted-foreground">Meter {r.meter_no ?? "—"}</div></div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${r.status === "available" ? "bg-primary/10 text-primary" : r.status === "full" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}`}>{r.status}</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{occ.length} / {r.capacity}</div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
              <div className="mt-3 space-y-1">
                {occ.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-primary text-[9px] font-bold text-white">{initials(s.full_name)}</div>
                    <span className="truncate">{s.full_name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => setEdit(r)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDel(r)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
      {(edit || adding) && (
        <RoomModal initial={edit ?? undefined} meters={meters}
          onClose={() => { setEdit(null); setAdding(false); }}
          onSave={(r) => {
            if (edit) updateMut.mutate({ no: edit.no, patch: r });
            else createMut.mutate(r as any);
            setEdit(null); setAdding(false);
          }} />
      )}
      {del && <ConfirmModal title={`Delete room ${del.no}?`} body="Occupants will lose their room assignment."
        onCancel={() => setDel(null)} onConfirm={() => { deleteMut.mutate(del.no); setDel(null); }} />}
    </div>
  );
}

function RoomModal({ initial, meters, onClose, onSave }: { initial?: RoomRow; meters: MeterRow[]; onClose: () => void; onSave: (r: Partial<RoomRow>) => void }) {
  const [f, setF] = useState({ no: initial?.no ?? "", capacity: initial?.capacity ?? 4, status: initial?.status ?? "available" as const, meter_no: initial?.meter_no ?? (meters[0]?.no ?? null) });
  return (
    <Modal title={initial ? "Edit Room" : "Add Room"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Room Number" value={f.no} onChange={(v) => setF({ ...f, no: v })} disabled={!!initial} />
        <FormField label="Capacity" type="number" value={String(f.capacity)} onChange={(v) => setF({ ...f, capacity: Number(v) })} />
        <FormSelect label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v as any })} options={["available","full","maintenance"]} />
        <FormSelect label="Meter" value={f.meter_no ?? ""} onChange={(v) => setF({ ...f, meter_no: v || null })} options={meters.map((m) => m.no)} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  METERS  ========================= */

function MetersPage() {
  const { data: meters = [] } = useMeters();
  const { data: rooms = [] } = useRooms();
  const { data: students = [] } = useStudents();
  const createMut = useCreateMeter();
  const updateMut = useUpdateMeter();
  const deleteMut = useDeleteMeter();
  const [edit, setEdit] = useState<MeterRow & { rooms: string[] } | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<MeterRow | null>(null);

  return (
    <div className="space-y-4">
      <StickyHeader title="Meter Allocation" subtitle={`${meters.length} meter groups`}
        actions={<button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Meter</button>} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {meters.map((m) => {
          const mRooms = m.rooms as string[];
          const studs = students.filter((s) => s.meter_no === m.no);
          return (
            <div key={m.no} className="squircle bg-white p-5 shadow-soft animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Zap className="h-5 w-5" /></div>
                  <div><div className="text-base font-bold">{m.no}</div><div className="text-xs text-muted-foreground">{mRooms.length} rooms · {studs.length} students</div></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEdit(m as any)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDel(m)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-3"><div className="text-xs text-muted-foreground">Rooms</div><div className="mt-1 flex flex-wrap gap-1.5">{mRooms.map((r) => <span key={r} className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs text-violet-700">{r}</span>)}</div></div>
              <div className="mt-3"><div className="text-xs text-muted-foreground">Students</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {studs.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-[9px] font-bold text-white">{initials(s.full_name)}</span>
                      {s.full_name.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>
              {m.notice && <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" />{m.notice}</div>}
              <ElectricityLogsPanel meterNo={m.no} />
            </div>
          );
        })}
      </div>
      {(edit || adding) && (
        <MeterModal initial={edit ?? undefined} rooms={rooms}
          onClose={() => { setEdit(null); setAdding(false); }}
          onSave={(m) => {
            if (edit) updateMut.mutate({ no: edit.no, patch: { notice: m.notice } });
            else createMut.mutate({ no: m.no, notice: m.notice ?? null });
            setEdit(null); setAdding(false);
          }} />
      )}
      {del && <ConfirmModal title={`Delete meter ${del.no}?`} body="Rooms will lose their meter assignment."
        onCancel={() => setDel(null)} onConfirm={() => { deleteMut.mutate(del.no); setDel(null); }} />}
    </div>
  );
}

function ElectricityLogsPanel({ meterNo }: { meterNo: string }) {
  const { data: logs = [] } = useElectricityLogs(meterNo);
  const { data: students = [] } = useStudents();
  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top-up Log</div>
      {logs.length === 0 && <div className="text-xs text-muted-foreground">No top-ups logged yet.</div>}
      <div className="space-y-2">
        {logs.slice(0, 5).map((log: any) => {
          const st = students.find((s) => s.id === log.student_id);
          return (
            <div key={log.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <div>
                <div className="text-xs font-medium">{st?.full_name ?? "Unknown"} · {st?.room_no}</div>
                <div className="text-[11px] text-muted-foreground">{fmtTime(new Date(log.logged_at).getTime())}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-violet-700">GHS {Number(log.amount).toFixed(2)}</div>
                <span className={`text-[10px] font-medium ${log.sms_status === "sent" ? "text-primary" : "text-destructive"}`}>SMS {log.sms_status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MeterModal({ initial, rooms, onClose, onSave }: { initial?: MeterRow & { rooms?: string[] }; rooms: RoomRow[]; onClose: () => void; onSave: (m: { no: string; notice?: string | null }) => void }) {
  const [f, setF] = useState({ no: initial?.no ?? "", notice: initial?.notice ?? "" });
  return (
    <Modal title={initial ? "Edit Meter" : "Add Meter"} onClose={onClose}>
      <FormField label="Meter Number" value={f.no} onChange={(v) => setF({ ...f, no: v })} disabled={!!initial} />
      <div className="mt-3"><div className="mb-1.5 text-xs font-medium">Notice (optional)</div>
        <textarea value={f.notice} onChange={(e) => setF({ ...f, notice: e.target.value })} rows={2}
          className="w-full rounded-xl border border-border bg-white p-2.5 text-sm" placeholder="e.g. Conserve electricity" />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  FEES  ========================= */

function FeesPage({ type }: { type: "registration" | "hostel" }) {
  const { data: students = [] } = useStudents();
  const { data: settings } = useSettings();
  const { data: allPayments = [] } = usePayments();
  const recordMut = useRecordPayment();
  const updateSettingsMut = useUpdateSettings();
  const [tab, setTab] = useState<"overview"|"paid"|"unpaid">("overview");
  const [pay, setPay] = useState<StudentRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!settings) return null;
  const totalFee = type === "registration" ? settings.registration_fee : settings.hostel_fee;
  const payments = allPayments.filter((p) => p.type === type).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  const isPaid = (s: StudentRow) => (type === "registration" ? s.reg_paid : s.hostel_paid) >= totalFee;
  const list = tab === "paid" ? students.filter(isPaid) : tab === "unpaid" ? students.filter((s) => !isPaid(s)) : students;
  const collected = students.reduce((sum, s) => sum + (type === "registration" ? s.reg_paid : s.hostel_paid), 0);
  const outstanding = students.reduce((sum, s) => sum + Math.max(0, totalFee - (type === "registration" ? s.reg_paid : s.hostel_paid)), 0);

  return (
    <div className="space-y-4">
      <StickyHeader title={type === "registration" ? "Registration Fees" : "Hostel Fees"} subtitle={`${fmtGHS(totalFee)} per student`}
        actions={type === "hostel" ? <button onClick={() => setDetailsOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium"><Edit3 className="h-3.5 w-3.5" /> Payment Details</button> : undefined} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total Students" value={students.length} />
        <MiniStat label="Paid" value={students.filter(isPaid).length} accent="primary" />
        <MiniStat label="Unpaid/Overdue" value={students.length - students.filter(isPaid).length} accent="amber" />
        <MiniStat label="Total Collected" value={fmtGHS(collected)} />
      </div>
      <div className="squircle bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /><strong>Outstanding:</strong> {fmtGHS(outstanding)}</div>
      </div>
      {type === "hostel" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="squircle bg-white p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Bank Transfer</div>
            <div className="mt-1 text-sm"><strong>{settings.bank_name}</strong></div>
            <div className="text-sm">{settings.account_name} · {settings.account_number}</div>
            <div className="text-xs text-muted-foreground">{settings.branch}</div>
          </div>
          <div className="squircle bg-white p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Mobile Money</div>
            <div className="mt-1 text-sm"><strong>{settings.momo_number}</strong></div>
            <div className="text-sm">{settings.momo_name}</div>
          </div>
        </div>
      )}
      <div className="inline-flex rounded-full bg-muted p-1">
        {(["overview","paid","unpaid"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${tab === t ? "bg-white shadow-soft" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((s) => {
          const paid = type === "registration" ? s.reg_paid : s.hostel_paid;
          const pct = Math.min(100, (paid / totalFee) * 100);
          const balance = Math.max(0, totalFee - paid);
          return (
            <div key={s.id} className="squircle bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">{initials(s.full_name)}</div>
                <div className="flex-1 min-w-[140px]">
                  <div className="text-sm font-bold">{s.full_name}</div>
                  <div className="text-xs text-muted-foreground">{s.id} · {s.room_no ?? "—"}</div>
                </div>
                <div className="hidden sm:block w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{fmtGHS(paid)} / {fmtGHS(totalFee)}</div>
                </div>
                <div className="text-right">
                  {balance === 0 ? <div className="text-sm font-bold text-primary">Settled</div> : (
                    <>
                      <div className="text-sm font-bold">{fmtGHS(balance)} due</div>
                      <button onClick={() => setPay(s)} className="mt-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Record Payment</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <SectionPanel title="Recent Payments">
        <div className="divide-y divide-border">
          {payments.slice(0, 8).map((p) => {
            const st = students.find((s) => s.id === p.student_id);
            return (
              <div key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{st?.full_name} · {p.id}</div>
                  <div className="text-xs text-muted-foreground">{fmtDate(new Date(p.payment_date).getTime())} · {p.method}</div>
                </div>
                <div className="text-sm font-semibold">{fmtGHS(p.amount)}</div>
              </div>
            );
          })}
        </div>
      </SectionPanel>
      {pay && (
        <PaymentModal student={pay} type={type} totalFee={totalFee} onClose={() => setPay(null)}
          onSave={(amount, method) => {
            recordMut.mutate({
              id: (type === "registration" ? "R-" : "H-") + Date.now(),
              student_id: pay.id, type, amount, method,
              payment_date: new Date().toISOString(),
            });
            setPay(null);
          }} />
      )}
      {detailsOpen && type === "hostel" && (
        <PaymentDetailsModal settings={settings} onClose={() => setDetailsOpen(false)}
          onSave={(patch) => { updateSettingsMut.mutate(patch); setDetailsOpen(false); }} />
      )}
    </div>
  );
}

function PaymentModal({ student, type, totalFee, onClose, onSave }: { student: StudentRow; type: "registration"|"hostel"; totalFee: number; onClose: () => void; onSave: (amount: number, method: "bank"|"momo"|"cash") => void }) {
  const balance = totalFee - (type === "registration" ? student.reg_paid : student.hostel_paid);
  const [amount, setAmount] = useState(String(Math.max(0, balance)));
  const [method, setMethod] = useState<"bank"|"momo"|"cash">("momo");
  return (
    <Modal title="Record Payment" onClose={onClose}>
      <div className="rounded-2xl bg-muted/40 p-3">
        <div className="text-sm font-bold">{student.full_name}</div>
        <div className="text-xs text-muted-foreground">{student.id} · Outstanding: {fmtGHS(Math.max(0, balance))}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <FormField label={`Amount (max ${fmtGHS(balance)})`} type="number" value={amount} onChange={setAmount} />
        <FormSelect label="Method" value={method} onChange={(v) => setMethod(v as any)} options={["momo","bank","cash"]} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(Number(amount), method)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Confirm</button>
      </div>
    </Modal>
  );
}

function PaymentDetailsModal({ settings, onClose, onSave }: { settings: any; onClose: () => void; onSave: (patch: any) => void }) {
  const [f, setF] = useState({ bank_name: settings.bank_name, account_name: settings.account_name, account_number: settings.account_number, branch: settings.branch, momo_number: settings.momo_number, momo_name: settings.momo_name, hostel_fee: settings.hostel_fee });
  return (
    <Modal title="Hostel Fee Payment Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Bank Name" value={f.bank_name} onChange={(v) => setF({ ...f, bank_name: v })} />
        <FormField label="Account Name" value={f.account_name} onChange={(v) => setF({ ...f, account_name: v })} />
        <FormField label="Account Number" value={f.account_number} onChange={(v) => setF({ ...f, account_number: v })} />
        <FormField label="Branch" value={f.branch} onChange={(v) => setF({ ...f, branch: v })} />
        <FormField label="MoMo Number" value={f.momo_number} onChange={(v) => setF({ ...f, momo_number: v })} />
        <FormField label="MoMo Name" value={f.momo_name} onChange={(v) => setF({ ...f, momo_name: v })} />
        <FormField label="Annual Hostel Fee" type="number" value={String(f.hostel_fee)} onChange={(v) => setF({ ...f, hostel_fee: Number(v) })} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  CHECK-INS  ========================= */

function CheckInsPage() {
  const { data: students = [] } = useStudents();
  const inStudents = students.filter((s) => s.check_status === "in");
  const outStudents = students.filter((s) => s.check_status === "out");

  return (
    <div className="space-y-4">
      <StickyHeader title="Check-In Records" subtitle="Live status & activity" />
      <div className="grid grid-cols-2 gap-3">
        <div className="squircle bg-primary/10 p-5"><div className="text-xs uppercase text-primary">Currently In</div><div className="mt-1 text-3xl font-bold text-primary">{inStudents.length}</div></div>
        <div className="squircle bg-muted p-5"><div className="text-xs uppercase text-muted-foreground">Currently Out</div><div className="mt-1 text-3xl font-bold">{outStudents.length}</div></div>
      </div>
      <SectionPanel title={`Currently In Hostel (${inStudents.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {inStudents.map((s) => <span key={s.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{s.full_name} · {s.room_no}</span>)}
          {inStudents.length === 0 && <span className="text-sm text-muted-foreground">Nobody is currently checked in.</span>}
        </div>
      </SectionPanel>
      <SectionPanel title="All Records">
        <div className="divide-y divide-border">
          {students.filter((s) => s.last_check_in).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">{s.full_name}</div>
                <div className="text-xs text-muted-foreground">In {fmtTime(s.last_check_in ? new Date(s.last_check_in).getTime() : undefined)} · Out {s.last_check_out ? fmtTime(new Date(s.last_check_out).getTime()) : "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s.room_no}</span>
                <BadgeChk status={s.check_status} />
              </div>
            </div>
          ))}
          {students.filter((s) => s.last_check_in).length === 0 && <div className="py-4 text-sm text-muted-foreground">No check-in records yet.</div>}
        </div>
      </SectionPanel>
    </div>
  );
}

/* =========================  STORE ADMIN  ========================= */

function StoreAdminPage() {
  const { data: orders = [] } = useOrders();
  const { data: items = [] } = useStoreItems();
  const { data: students = [] } = useStudents();
  const updateStatusMut = useUpdateOrderStatus();
  const markReadMut = useMarkOrderRead();
  const createItemMut = useCreateStoreItem();
  const updateItemMut = useUpdateStoreItem();
  const deleteItemMut = useDeleteStoreItem();
  const [tab, setTab] = useState<"orders"|"inventory">("orders");
  const [statusFilter, setStatusFilter] = useState<"all"|"pending"|"confirmed"|"ready"|"delivered"|"cancelled">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<StoreItemRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<StoreItemRow | null>(null);

  const unread = orders.filter((o) => o.unread).length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-4">
      <StickyHeader title="Hostel Store" subtitle={`${orders.length} orders · ${items.length} items`}
        actions={
          <div className="flex items-center gap-2">
            {unread > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"><Bell className="h-3 w-3" /> {unread} new</span>}
            {tab === "inventory" && <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Item</button>}
          </div>
        } />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total Orders" value={orders.length} />
        <MiniStat label="Pending" value={pending} accent="amber" />
        <MiniStat label="Today's Orders" value={todayOrders.length} accent="primary" />
        <MiniStat label="Today's Revenue" value={fmtGHS(todayRevenue)} accent="primary" />
      </div>
      <div className="inline-flex rounded-full bg-muted p-1">
        {(["orders","inventory"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${tab === t ? "bg-white shadow-soft" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "orders" ? (
        <>
          <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
            {(["all","pending","confirmed","ready","delivered","cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-white text-foreground border border-border"}`}>{s}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((o) => {
              const st = students.find((s) => s.id === o.student_id);
              const open = expanded === o.id;
              const orderItems = (o as any).order_items as { item_id: string; qty: number }[] ?? [];
              return (
                <div key={o.id} className={`squircle bg-white p-4 shadow-soft ${o.unread ? "border-l-4 border-primary" : ""}`}>
                  <button onClick={() => { setExpanded(open ? null : o.id); if (o.unread) markReadMut.mutate(o.id); }} className="flex w-full items-center gap-3 text-left">
                    {o.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold">{st?.full_name ?? "Unknown"}</div>
                        <span className="text-xs text-muted-foreground">{st?.room_no}</span>
                        <OrderStatusPill status={o.status} />
                      </div>
                      <div className="text-xs text-muted-foreground">{o.id} · {orderItems.reduce((s, l) => s + l.qty, 0)} items · {fmtTime(new Date(o.created_at).getTime())}</div>
                    </div>
                    <div className="text-sm font-bold">{fmtGHS(o.total)}</div>
                  </button>
                  {open && (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="space-y-1.5 text-sm">
                        {orderItems.map((l, i) => {
                          const it = items.find((x) => x.id === l.item_id);
                          return <div key={i} className="flex justify-between"><span>{it?.emoji} {it?.name} × {l.qty}</span><span className="text-muted-foreground">{fmtGHS((it?.price ?? 0) * l.qty)}</span></div>;
                        })}
                      </div>
                      {o.note && <div className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">📝 {o.note}</div>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {o.status === "pending" && <button onClick={() => updateStatusMut.mutate({ id: o.id, status: "confirmed" })} className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-medium text-white">Confirm</button>}
                        {o.status === "confirmed" && <button onClick={() => updateStatusMut.mutate({ id: o.id, status: "ready" })} className="rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white">Mark Ready</button>}
                        {o.status === "ready" && <button onClick={() => updateStatusMut.mutate({ id: o.id, status: "delivered" })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Mark Delivered</button>}
                        {o.status === "pending" && <button onClick={() => updateStatusMut.mutate({ id: o.id, status: "cancelled" })} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">Cancel</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No orders.</div>}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total" value={items.length} />
            <MiniStat label="Available" value={items.filter((i) => i.available).length} accent="primary" />
            <MiniStat label="Out of Stock" value={items.filter((i) => i.stock === 0).length} accent="destructive" />
            <MiniStat label="Low Stock" value={items.filter((i) => i.stock > 0 && i.stock <= 5).length} accent="amber" />
          </div>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="squircle bg-white p-4 shadow-soft flex items-center gap-3">
                <div className="text-2xl">{it.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{it.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{it.description}</div>
                  <div className="text-xs text-muted-foreground">{fmtGHS(it.price)} / {it.unit} · Stock: {it.stock}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${it.available && it.stock > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{it.available && it.stock > 0 ? "Available" : "Unavailable"}</span>
                <button onClick={() => setEditItem(it)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDel(it)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          {(editItem || adding) && (
            <ItemModal initial={editItem ?? undefined} onClose={() => { setEditItem(null); setAdding(false); }}
              onSave={(it) => {
                if (editItem) updateItemMut.mutate({ id: editItem.id, patch: it });
                else createItemMut.mutate({ ...it, id: "i" + Date.now() } as any);
                setEditItem(null); setAdding(false);
              }} />
          )}
          {del && <ConfirmModal title={`Delete ${del.name}?`} body="This will remove it from the store."
            onCancel={() => setDel(null)} onConfirm={() => { deleteItemMut.mutate(del.id); setDel(null); }} />}
        </>
      )}
    </div>
  );
}

function OrderStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-sky-100 text-sky-700", ready: "bg-violet-100 text-violet-700", delivered: "bg-primary/10 text-primary", cancelled: "bg-muted text-muted-foreground" };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}

function ItemModal({ initial, onClose, onSave }: { initial?: StoreItemRow; onClose: () => void; onSave: (it: Partial<StoreItemRow>) => void }) {
  const [f, setF] = useState({ name: initial?.name ?? "", emoji: initial?.emoji ?? "🛒", description: initial?.description ?? "", price: initial?.price ?? 0, unit: initial?.unit ?? "piece", stock: initial?.stock ?? 0, category: initial?.category ?? "Other", available: initial?.available ?? true });
  return (
    <Modal title={initial ? "Edit Item" : "Add Item"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <FormField label="Emoji" value={f.emoji} onChange={(v) => setF({ ...f, emoji: v })} />
        <FormField label="Description" value={f.description} onChange={(v) => setF({ ...f, description: v })} />
        <FormField label="Price" type="number" value={String(f.price)} onChange={(v) => setF({ ...f, price: Number(v) })} />
        <FormField label="Unit" value={f.unit} onChange={(v) => setF({ ...f, unit: v })} />
        <FormField label="Stock" type="number" value={String(f.stock)} onChange={(v) => setF({ ...f, stock: Number(v) })} />
        <FormSelect label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={["Water","Drinks","Food","Toiletries","Stationery","Other"]} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} className="h-4 w-4" /> Available</label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  SMS  ========================= */

const SMS_TEMPLATES: Record<string, string> = {
  "Payment Reminder": "Kindly settle outstanding hostel fees by Friday. Use your Student ID as reference.",
  "Meter Notice": "Please conserve electricity — bill has been running high. Avoid heaters/irons left on.",
  "General Announcement": "Dear residents, please note: ",
};

function SmsPage() {
  const { data: sms = [] } = useSmsMessages();
  const { data: students = [] } = useStudents();
  const sendMut = useSendSms();
  const [compose, setCompose] = useState(false);
  const [prefill, setPrefill] = useState<string | undefined>();

  return (
    <div className="space-y-4">
      <StickyHeader title="SMS Center" subtitle={`${sms.length} messages sent`}
        actions={
          <button onClick={() => { setPrefill(undefined); setCompose(true); }} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Send className="h-4 w-4" /> Compose
          </button>
        } />
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Total Sent" value={sms.length} />
        <MiniStat label="Delivered" value={sms.filter((m) => m.status === "delivered").length} accent="primary" />
        <MiniStat label="This Month" value={sms.filter((m) => new Date(m.sent_at).getMonth() === new Date().getMonth()).length} />
      </div>
      <SectionPanel title="Quick Send Templates">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.keys(SMS_TEMPLATES).map((t) => (
            <button key={t} onClick={() => { setPrefill(t); setCompose(true); }} className="rounded-2xl border border-border bg-white p-3 text-left hover:bg-muted/30">
              <div className="text-sm font-bold">{t}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{SMS_TEMPLATES[t]}</div>
            </button>
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Message Log">
        <div className="divide-y divide-border">
          {sms.map((m) => (
            <div key={m.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{m.recipients}</span>
                <span>· {m.recipient_count} recipients</span>
                <span>· {fmtDate(new Date(m.sent_at).getTime())}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${m.status === "delivered" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{m.status}</span>
              </div>
              <div className="mt-1 text-sm">{m.body}</div>
            </div>
          ))}
          {sms.length === 0 && <div className="py-4 text-sm text-muted-foreground">No messages sent yet.</div>}
        </div>
      </SectionPanel>
      {compose && (
        <ComposeModal students={students} prefillTemplate={prefill} onClose={() => setCompose(false)}
          onSend={(phones, label, message, template) => {
            sendMut.mutate({ phones, recipientsLabel: label, message, template }, { onSuccess: () => setCompose(false) });
          }} />
      )}
    </div>
  );
}

function ComposeModal({ students, prefillTemplate, onClose, onSend }: {
  students: StudentRow[]; prefillTemplate?: string;
  onClose: () => void; onSend: (phones: string[], label: string, message: string, template?: string) => void;
}) {
  const [group, setGroup] = useState("all");
  const [message, setMessage] = useState(prefillTemplate ? SMS_TEMPLATES[prefillTemplate] ?? "" : "");
  const [template, setTemplate] = useState(prefillTemplate ?? "");

  const resolvedPhones = useMemo(() => {
    let list = students;
    if (group === "checked_in") list = students.filter((s) => s.check_status === "in");
    else if (group === "unpaid_reg") list = students.filter((s) => s.reg_status !== "paid");
    else if (group.startsWith("meter:")) list = students.filter((s) => s.meter_no === group.replace("meter:", ""));
    return list.map((s) => s.phone).filter(Boolean);
  }, [group, students]);

  const groupLabel = group === "all" ? "All Students" : group === "checked_in" ? "Checked-In Students" : group === "unpaid_reg" ? "Unpaid Reg. Students" : group;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg squircle bg-white p-6 shadow-glass animate-pop">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold">Compose SMS</div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium">Recipients</div>
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm">
              <option value="all">All Students ({students.length})</option>
              <option value="checked_in">Checked-In ({students.filter((s) => s.check_status === "in").length})</option>
              <option value="unpaid_reg">Unpaid Registration ({students.filter((s) => s.reg_status !== "paid").length})</option>
            </select>
            <div className="mt-1 text-xs text-muted-foreground">{resolvedPhones.length} recipients selected</div>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium">Template (optional)</div>
            <select value={template} onChange={(e) => { setTemplate(e.target.value); if (e.target.value) setMessage(SMS_TEMPLATES[e.target.value] ?? ""); }} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm">
              <option value="">— No template —</option>
              {Object.keys(SMS_TEMPLATES).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-medium"><span>Message</span><span className={message.length > 160 ? "text-destructive" : "text-muted-foreground"}>{message.length}/160</span></div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={160}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm" placeholder="Type your message…" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSend(resolvedPhones, groupLabel, message, template || undefined)}
            disabled={!message.trim() || resolvedPhones.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            <Send className="h-3.5 w-3.5" /> Send to {resolvedPhones.length}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================  REPORTS  ========================= */

function ReportsPage() {
  const { data: students = [] } = useStudents();
  const { data: payments = [] } = usePayments();
  const { data: orders = [] } = useOrders();
  const { data: sms = [] } = useSmsMessages();
  const { data: settings } = useSettings();
  const [tab, setTab] = useState<"students"|"fees"|"store"|"sms"|"electricity">("students");

  const regFee = settings?.registration_fee ?? 200;
  const hostelFee = settings?.hostel_fee ?? 4500;

  return (
    <div className="space-y-4">
      <StickyHeader title="Reports" subtitle="Live data from Supabase" />
      <div className="inline-flex rounded-full bg-muted p-1">
        {(["students","fees","store","sms","electricity"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${tab === t ? "bg-white shadow-soft" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "students" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total" value={students.length} />
            <MiniStat label="Checked In" value={students.filter((s) => s.check_status === "in").length} accent="primary" />
            <MiniStat label="Policy Accepted" value={students.filter((s) => s.policy_accepted).length} accent="primary" />
            <MiniStat label="Unpaid Reg." value={students.filter((s) => s.reg_status !== "paid").length} accent="amber" />
          </div>
        </div>
      )}
      {tab === "fees" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Reg. Collected" value={fmtGHS(students.reduce((a, s) => a + s.reg_paid, 0))} accent="primary" />
            <MiniStat label="Hostel Collected" value={fmtGHS(students.reduce((a, s) => a + s.hostel_paid, 0))} accent="primary" />
            <MiniStat label="Reg. Outstanding" value={fmtGHS(students.reduce((a, s) => a + Math.max(0, regFee - s.reg_paid), 0))} accent="amber" />
            <MiniStat label="Hostel Outstanding" value={fmtGHS(students.reduce((a, s) => a + Math.max(0, hostelFee - s.hostel_paid), 0))} accent="amber" />
          </div>
          <SectionPanel title="Recent Payments">
            <div className="divide-y divide-border">
              {[...payments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).slice(0, 10).map((p) => {
                const st = students.find((s) => s.id === p.student_id);
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <div><div className="font-medium">{st?.full_name} · {p.id}</div><div className="text-xs text-muted-foreground">{fmtDate(new Date(p.payment_date).getTime())} · {p.type} · {p.method}</div></div>
                    <div className="font-semibold">{fmtGHS(p.amount)}</div>
                  </div>
                );
              })}
            </div>
          </SectionPanel>
        </div>
      )}
      {tab === "store" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total Orders" value={orders.length} />
            <MiniStat label="Delivered" value={orders.filter((o) => o.status === "delivered").length} accent="primary" />
            <MiniStat label="Pending" value={orders.filter((o) => o.status === "pending").length} accent="amber" />
            <MiniStat label="Revenue" value={fmtGHS(orders.filter((o) => o.status === "delivered").reduce((a, o) => a + o.total, 0))} accent="primary" />
          </div>
        </div>
      )}
      {tab === "sms" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Total Sent" value={sms.length} />
            <MiniStat label="Delivered" value={sms.filter((m) => m.status === "delivered").length} accent="primary" />
            <MiniStat label="Recipients Reached" value={sms.reduce((a, m) => a + m.recipient_count, 0)} />
          </div>
          <SectionPanel title="Message Log">
            <div className="divide-y divide-border">
              {sms.map((m) => (
                <div key={m.id} className="py-2 text-sm">
                  <div className="text-xs text-muted-foreground">{m.recipients} · {fmtDate(new Date(m.sent_at).getTime())}</div>
                  <div>{m.body}</div>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      )}
      {tab === "electricity" && <ElectricityReportTab />}
    </div>
  );
}

/* =========================  SETTINGS  ========================= */

function SettingsPage() {
  const { data: settings } = useSettings();
  const updateMut = useUpdateSettings();
  const [f, setF] = useState<any>(null);

  // Initialise form once settings load
  if (settings && !f) {
    setF({ ...settings });
  }

  if (!f) return <div className="py-10 text-center text-sm text-muted-foreground">Loading settings…</div>;

  return (
    <div className="space-y-4">
      <StickyHeader title="Settings" subtitle="Hostel configuration"
        actions={
          <button onClick={() => updateMut.mutate(f)} disabled={updateMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            <Save className="h-3.5 w-3.5" /> {updateMut.isPending ? "Saving…" : "Save Changes"}
          </button>
        } />
      <SectionPanel title="Hostel Info">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Hostel Name" value={f.hostel_name} onChange={(v) => setF({ ...f, hostel_name: v })} />
          <FormField label="Address" value={f.address} onChange={(v) => setF({ ...f, address: v })} />
          <FormField label="Contact Phone" value={f.contact_phone} onChange={(v) => setF({ ...f, contact_phone: v })} />
          <FormField label="WhatsApp" value={f.contact_whatsapp} onChange={(v) => setF({ ...f, contact_whatsapp: v })} />
          <FormField label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
        </div>
      </SectionPanel>
      <SectionPanel title="Fee Settings">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Registration Fee (GHS)" type="number" value={String(f.registration_fee)} onChange={(v) => setF({ ...f, registration_fee: Number(v) })} />
          <FormField label="Hostel Fee (GHS)" type="number" value={String(f.hostel_fee)} onChange={(v) => setF({ ...f, hostel_fee: Number(v) })} />
        </div>
      </SectionPanel>
      <SectionPanel title="Bank & MoMo">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Bank Name" value={f.bank_name} onChange={(v) => setF({ ...f, bank_name: v })} />
          <FormField label="Account Name" value={f.account_name} onChange={(v) => setF({ ...f, account_name: v })} />
          <FormField label="Account Number" value={f.account_number} onChange={(v) => setF({ ...f, account_number: v })} />
          <FormField label="Branch" value={f.branch} onChange={(v) => setF({ ...f, branch: v })} />
          <FormField label="MoMo Number" value={f.momo_number} onChange={(v) => setF({ ...f, momo_number: v })} />
          <FormField label="MoMo Name" value={f.momo_name} onChange={(v) => setF({ ...f, momo_name: v })} />
        </div>
      </SectionPanel>
      <SectionPanel title="SMS">
        <FormField label="Sender ID" value={f.sms_sender_id} onChange={(v) => setF({ ...f, sms_sender_id: v })} />
        <div className="mt-2 text-xs text-muted-foreground">API key is stored as an environment variable and cannot be edited here.</div>
      </SectionPanel>
    </div>
  );
}

/* =========================  ELECTRICITY REPORT  ========================= */

function ElectricityReportTab() {
  const { data: meters = [] } = useMeters();
  const { data: students = [] } = useStudents();
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const { data: logs = [] } = useElectricityLogs(selectedMeter || undefined);

  const totalTopups = logs.length;
  const totalAmount = logs.reduce((a: number, l: any) => a + Number(l.amount), 0);
  const failedSms = logs.filter((l: any) => l.sms_status === "failed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Total Top-ups" value={totalTopups} />
        <MiniStat label="Total Amount" value={`GHS ${totalAmount.toFixed(2)}`} accent="primary" />
        <MiniStat label="SMS Failures" value={failedSms} accent={failedSms > 0 ? "destructive" : undefined} />
      </div>

      <div className="squircle bg-white p-4 shadow-soft">
        <label className="mb-1 block text-xs font-medium">Filter by meter</label>
        <select value={selectedMeter} onChange={(e) => setSelectedMeter(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm">
          <option value="">All meters</option>
          {meters.map((m: any) => <option key={m.no} value={m.no}>{m.no}</option>)}
        </select>
      </div>

      <SectionPanel title="Top-up Log">
        {logs.length === 0 && <div className="py-4 text-sm text-muted-foreground">No top-ups logged{selectedMeter ? ` for meter ${selectedMeter}` : ""}.</div>}
        <div className="divide-y divide-border">
          {logs.map((log: any) => {
            const st = students.find((s) => s.id === log.student_id);
            return (
              <div key={log.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                      {initials(st?.full_name ?? "?")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{st?.full_name ?? "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">
                        {st?.room_no} · Meter {log.meter_no} · {fmtTime(new Date(log.logged_at).getTime())}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-violet-700">GHS {Number(log.amount).toFixed(2)}</div>
                    <span className={`text-[10px] font-medium ${log.sms_status === "sent" ? "text-primary" : "text-destructive"}`}>
                      SMS {log.sms_status}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground line-clamp-2">
                  {log.confirmation}
                </div>
              </div>
            );
          })}
        </div>
      </SectionPanel>
    </div>
  );
}

/* =========================  SHARED UI  ========================= */

function StickyHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 bg-background/80 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
      <div><h1 className="text-xl font-bold">{title}</h1>{subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="squircle bg-white p-5 shadow-soft"><div className="mb-3 text-base font-bold">{title}</div>{children}</div>;
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="squircle bg-white p-5 shadow-soft"><div className="mb-3 text-base font-bold">{title}</div>{children}</div>;
}

function MiniStat({ label, value, accent }: { label: string; value: number | string; accent?: "primary"|"amber"|"destructive" }) {
  const map = { primary: "text-primary", amber: "text-amber-700", destructive: "text-destructive" };
  return (
    <div className="squircle bg-white p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-bold ${accent ? map[accent] : ""}`}>{value}</div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color = "default", badge, onClick }: { icon: typeof Users; label: string; value: number | string; color?: "default"|"primary"|"blue"|"amber"|"violet"|"muted"; badge?: number; onClick?: () => void }) {
  const map = { default: "bg-muted text-foreground", primary: "bg-primary/10 text-primary", blue: "bg-sky-100 text-sky-700", amber: "bg-amber-100 text-amber-700", violet: "bg-violet-100 text-violet-700", muted: "bg-muted text-muted-foreground" };
  return (
    <button onClick={onClick} className="relative squircle bg-white p-4 text-left shadow-soft hover:shadow-glass transition">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${map[color]}`}><Icon className="h-4 w-4" /></div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {badge ? <span className="absolute right-3 top-3 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{badge}</span> : null}
    </button>
  );
}

function QuickAction({ icon: Icon, label, badge, onClick }: { icon: typeof Users; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2.5 text-sm font-medium hover:bg-muted/60 transition">
      <Icon className="h-4 w-4 text-primary" /><span className="flex-1 text-left">{label}</span>
      {badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{badge}</span> : null}
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function BadgeReg({ status }: { status: string }) {
  const map: Record<string, string> = { paid: "bg-primary/10 text-primary", partial: "bg-amber-100 text-amber-700", unpaid: "bg-destructive/10 text-destructive" };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}

function BadgeChk({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status === "in" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{status === "in" ? "In" : "Out"}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg squircle bg-white p-6 shadow-glass animate-pop max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between"><div className="text-lg font-bold">{title}</div><button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button></div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, body, onConfirm, onCancel }: { title: string; body: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm squircle bg-white p-6 shadow-glass animate-pop">
        <div className="text-lg font-bold">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{body}</div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="rounded-2xl border border-border bg-white py-2.5 text-sm font-medium">Cancel</button>
          <button onClick={onConfirm} className="rounded-2xl bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground">Delete</button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, disabled }: { label: string; type?: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted/40" />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function MobileNav({ page, onChange, onMore, unread }: { page: Nav; onChange: (p: Nav) => void; onMore: () => void; unread: number }) {
  const items: { key: Nav; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Home" },
    { key: "students", icon: Users, label: "Students" },
    { key: "store", icon: ShoppingBag, label: "Store" },
    { key: "sms", icon: MessageSquare, label: "SMS" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-white/90 backdrop-blur lg:hidden">
      {items.map((i) => (
        <button key={i.key} onClick={() => onChange(i.key)} className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition ${page === i.key ? "text-primary" : "text-muted-foreground"}`}>
          <i.icon className="h-5 w-5" />{i.label}
          {i.key === "store" && unread > 0 && <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-destructive" />}
        </button>
      ))}
      <button onClick={onMore} className="flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-medium text-muted-foreground">
        <MoreHorizontal className="h-5 w-5" />More
      </button>
    </nav>
  );
}

function MobileMore({ current, onPick, onClose, onSignOut }: { current: Nav; onPick: (p: Nav) => void; onClose: () => void; onSignOut: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 pb-8">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <div className="grid grid-cols-3 gap-2">
          {NAV.filter((n) => !["dashboard","students","store","sms"].includes(n.key)).map((n) => (
            <button key={n.key} onClick={() => onPick(n.key)} className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-xs font-medium transition ${current === n.key ? "bg-primary text-white" : "bg-muted/40 text-foreground"}`}>
              <n.icon className="h-5 w-5" />{n.label}
            </button>
          ))}
        </div>
        <button onClick={onSignOut} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-medium text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
