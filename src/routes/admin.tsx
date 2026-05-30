import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard, Users, DoorOpen, Zap, Wallet, Building2, ClipboardList,
  ShoppingBag, MessageSquare, BarChart3, Settings as SettingsIcon, LogOut,
  ChevronLeft, ChevronRight, Bell, Search, Plus, Edit3, Trash2, X, Save,
  CheckCircle2, XCircle, AlertTriangle, Copy, Check, Send, Image as ImageIcon,
  Video, FileText, ArrowRight, MoreHorizontal, Filter, TrendingUp, Activity,
  Sparkles, Eye,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import {
  useHostel, actions, fmtGHS, fmtTime, fmtDate, initials,
  type Student, type Room, type Meter, type Payment, type StoreItem, type Order, type SmsMessage,
} from "@/lib/hostel-store";

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

function Admin() {
  const nav = useNavigate();
  const [page, setPage] = useState<Nav>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const settings = useHostel((s) => s.settings);
  const unreadOrders = useHostel((s) => s.orders.filter((o) => o.unread).length);

  function switchUser() {
    actions.setCurrentStudent(null);
    nav({ to: "/" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex sticky top-0 h-screen shrink-0 flex-col border-r border-border glass-strong transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[240px]"}`}>
        <div className="flex items-center gap-2 px-3 py-4">
          <img src={logo} alt="" className="h-9 w-9 squircle bg-white p-1 object-contain" />
          {!collapsed && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div>
              <div className="text-sm font-bold leading-tight">{settings.hostelName}</div>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2">
          {NAV.map((n) => {
            const active = n.key === page;
            const badge = n.key === "store" ? unreadOrders : 0;
            return (
              <button key={n.key} onClick={() => setPage(n.key)}
                title={collapsed ? n.label : undefined}
                className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-gradient-primary text-white shadow-soft" : "text-foreground/80 hover:bg-muted/50"
                }`}>
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
            <LogOut className="h-4 w-4" /> {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main */}
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

      {/* Mobile bottom nav */}
      <MobileNav page={page} onChange={setPage} onMore={() => setMobileNavOpen(true)} unread={unreadOrders} />
      {mobileNavOpen && <MobileMore current={page} onPick={(p) => { setPage(p); setMobileNavOpen(false); }} onClose={() => setMobileNavOpen(false)} onSignOut={switchUser} />}
    </div>
  );
}

/* =========================  DASHBOARD  ========================= */

function Dashboard({ onNav, onSwitch }: { onNav: (p: Nav) => void; onSwitch: () => void }) {
  const s = useHostel((x) => x);
  const checkedIn = s.students.filter((st) => st.checkStatus === "in").length;
  const checkedOut = s.students.length - checkedIn;
  const regPaid = s.students.filter((st) => st.regStatus === "paid").length;
  const hostelPaid = s.students.filter((st) => st.hostelPaid >= s.settings.hostelFee).length;
  const unreadOrders = s.orders.filter((o) => o.unread).length;
  const totalOrders = s.orders.length;
  const smsThisMonth = s.sms.filter((m) => new Date(m.sentAt).getMonth() === new Date().getMonth()).length;

  const occupancyData = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
    name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
    students: Math.round(20 + Math.random() * 25 + i * 3),
  })), []);
  const feeData = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
    name: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"][i],
    collected: Math.round(20000 + Math.random() * 15000),
    outstanding: Math.round(3000 + Math.random() * 8000),
  })), []);
  const weekChecks = useMemo(() => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
    day: d, ins: Math.floor(2 + Math.random() * 6), outs: Math.floor(1 + Math.random() * 4),
  })), []);

  const activity = [
    { icon: ShoppingBag, text: "New store order from Ama Mensah", time: "5m ago", color: "text-amber-600 bg-amber-100" },
    { icon: CheckCircle2, text: "Kwame Boateng checked in", time: "12m ago", color: "text-primary bg-primary/10" },
    { icon: Wallet, text: "Payment recorded · GHS 4,500", time: "1h ago", color: "text-sky-600 bg-sky-100" },
    { icon: MessageSquare, text: "SMS sent to All Students", time: "3h ago", color: "text-violet-600 bg-violet-100" },
  ];

  return (
    <div className="space-y-6">
      <StickyHeader
        title="Dashboard"
        subtitle={s.settings.hostelName + " · Operations overview"}
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
              Live
            </span>
            {unreadOrders > 0 && (
              <button onClick={() => onNav("store")} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:opacity-95">
                <Bell className="h-3.5 w-3.5" /> {unreadOrders} new order{unreadOrders > 1 ? "s" : ""}
              </button>
            )}
            <button onClick={onSwitch} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium">
              <LogOut className="h-3.5 w-3.5" /> Switch
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi icon={Users} label="Total Students" value={s.students.length} onClick={() => onNav("students")} />
        <Kpi icon={CheckCircle2} label="Checked In" value={checkedIn} color="primary" onClick={() => onNav("checkins")} />
        <Kpi icon={XCircle} label="Checked Out" value={checkedOut} color="muted" onClick={() => onNav("checkins")} />
        <Kpi icon={Wallet} label="Reg. Fees Paid" value={regPaid} color="blue" onClick={() => onNav("regfees")} />
        <Kpi icon={Building2} label="Hostel Fees Paid" value={hostelPaid} color="primary" onClick={() => onNav("hostelfees")} />
        <Kpi icon={DoorOpen} label="Total Rooms" value={s.rooms.length} onClick={() => onNav("rooms")} />
        <Kpi icon={Zap} label="Meter Groups" value={s.meters.length} color="violet" onClick={() => onNav("meters")} />
        <Kpi icon={ShoppingBag} label="Store Orders" value={totalOrders} color="amber" badge={unreadOrders} onClick={() => onNav("store")} />
        <Kpi icon={MessageSquare} label="SMS This Month" value={smsThisMonth} color="violet" onClick={() => onNav("sms")} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Student Occupancy">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={occupancyData}>
              <defs>
                <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke={COLORS.primary} fill="url(#occ)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Fee Collection">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="collected" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="outstanding" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Check-In Activity (This Week)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekChecks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ins" name="Check-ins" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="outs" name="Check-outs" fill={COLORS.soft} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Recent Activity">
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm">{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
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

function Kpi({ icon: Icon, label, value, color = "default", badge, onClick }: { icon: typeof Users; label: string; value: number | string; color?: "default" | "primary" | "blue" | "amber" | "violet" | "muted"; badge?: number; onClick?: () => void }) {
  const map = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/10 text-primary",
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
    muted: "bg-muted text-muted-foreground",
  };
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
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 text-left">{label}</span>
      {badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{badge}</span> : null}
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/* =========================  STUDENTS  ========================= */

function StudentsPage() {
  const students = useHostel((s) => s.students);
  const rooms = useHostel((s) => s.rooms);
  const meters = useHostel((s) => s.meters);
  const [q, setQ] = useState("");
  const [regFilter, setRegFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");
  const [chkFilter, setChkFilter] = useState<"all" | "in" | "out">("all");
  const [edit, setEdit] = useState<Student | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const m = (s.fullName + s.id + s.course + s.roomNo).toLowerCase().includes(q.toLowerCase());
    const rf = regFilter === "all" || s.regStatus === regFilter;
    const cf = chkFilter === "all" || s.checkStatus === chkFilter;
    return m && rf && cf;
  });
  const inCount = students.filter((s) => s.checkStatus === "in").length;
  const unpaidCount = students.filter((s) => s.regStatus !== "paid").length;

  return (
    <div className="space-y-4">
      <StickyHeader
        title="Students"
        subtitle={`${students.length} total`}
        actions={<button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Student</button>}
      />

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Total" value={students.length} />
        <MiniStat label="Checked In" value={inCount} accent="primary" />
        <MiniStat label="Unpaid Reg." value={unpaidCount} accent="amber" />
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
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">{initials(s.fullName)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-bold truncate">{s.fullName}</div>
                  <BadgeReg status={s.regStatus} />
                  <BadgeChk status={s.checkStatus} />
                </div>
                <div className="text-xs text-muted-foreground">{s.id} · {s.course}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>🚪 {s.roomNo}</span><span>⚡ {s.meterNo}</span><span>📞 {s.phone}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEdit(s)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDel(s)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-8">No students match.</div>}
      </div>

      {(edit || adding) && (
        <StudentModal
          initial={edit ?? undefined}
          rooms={rooms} meters={meters}
          onClose={() => { setEdit(null); setAdding(false); }}
          onSave={(st) => {
            if (edit) { actions.updateStudent(edit.id, st); toast.success("Student updated"); }
            else { actions.addStudent(st); toast.success("Student added"); }
            setEdit(null); setAdding(false);
          }}
        />
      )}
      {del && (
        <ConfirmModal title={`Delete ${del.fullName}?`} body="This cannot be undone."
          onCancel={() => setDel(null)}
          onConfirm={() => { actions.removeStudent(del.id); toast.success("Student deleted"); setDel(null); }} />
      )}
    </div>
  );
}

function StudentModal({ initial, rooms, meters, onClose, onSave }: {
  initial?: Student; rooms: Room[]; meters: Meter[];
  onClose: () => void; onSave: (s: Student) => void;
}) {
  const [f, setF] = useState<Student>(initial ?? {
    id: "SME-2024-" + String(Math.floor(100 + Math.random() * 900)),
    fullName: "", course: "", level: "100", roomNo: rooms[0]?.no ?? "", meterNo: meters[0]?.no ?? "",
    phone: "", whatsapp: "", guardianName: "", guardianPhone: "",
    username: "", regStatus: "unpaid", regPaid: 0, hostelPaid: 0, checkStatus: "out", policyAccepted: false,
  });
  function up<K extends keyof Student>(k: K, v: Student[K]) { setF((s) => ({ ...s, [k]: v })); }
  return (
    <Modal title={initial ? "Edit Student" : "Add Student"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Full Name" value={f.fullName} onChange={(v) => up("fullName", v)} />
        <FormField label="Student ID" value={f.id} onChange={(v) => up("id", v)} disabled={!!initial} />
        <FormField label="Course" value={f.course} onChange={(v) => up("course", v)} />
        <FormField label="Phone" value={f.phone} onChange={(v) => up("phone", v)} />
        <FormField label="WhatsApp" value={f.whatsapp} onChange={(v) => up("whatsapp", v)} />
        <FormField label="Guardian Name" value={f.guardianName} onChange={(v) => up("guardianName", v)} />
        <FormField label="Guardian Phone" value={f.guardianPhone} onChange={(v) => up("guardianPhone", v)} />
        <FormSelect label="Room" value={f.roomNo} onChange={(v) => up("roomNo", v)} options={rooms.map((r) => r.no)} />
        <FormSelect label="Meter" value={f.meterNo} onChange={(v) => up("meterNo", v)} options={meters.map((m) => m.no)} />
        <FormSelect label="Registration Status" value={f.regStatus} onChange={(v) => up("regStatus", v as any)} options={["paid", "partial", "unpaid"]} />
        <FormField label="Amount Paid (Reg.)" type="number" value={String(f.regPaid)} onChange={(v) => up("regPaid", Number(v))} />
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
  const rooms = useHostel((s) => s.rooms);
  const students = useHostel((s) => s.students);
  const meters = useHostel((s) => s.meters);
  const [edit, setEdit] = useState<Room | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<Room | null>(null);

  const total = rooms.length;
  const available = rooms.filter((r) => r.status === "available").length;
  const full = rooms.filter((r) => r.status === "full").length;
  const maint = rooms.filter((r) => r.status === "maintenance").length;

  return (
    <div className="space-y-4">
      <StickyHeader title="Rooms" subtitle={`${total} rooms`}
        actions={<button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Room</button>} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total" value={total} />
        <MiniStat label="Available" value={available} accent="primary" />
        <MiniStat label="Full" value={full} accent="amber" />
        <MiniStat label="Maintenance" value={maint} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((r) => {
          const occ = students.filter((st) => st.roomNo === r.no);
          const pct = (occ.length / r.capacity) * 100;
          return (
            <div key={r.no} className="squircle bg-white p-4 shadow-soft animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{r.no}</div>
                  <div className="text-xs text-muted-foreground">Meter {r.meterNo}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                  r.status === "available" ? "bg-primary/10 text-primary" : r.status === "full" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"
                }`}>{r.status}</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{occ.length} / {r.capacity}</div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
              <div className="mt-3 space-y-1">
                {occ.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 text-xs">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-primary text-[9px] font-bold text-white">{initials(st.fullName)}</div>
                    <span className="truncate">{st.fullName}</span>
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
            if (edit) { actions.updateRoom(edit.no, r); toast.success("Room updated"); }
            else { actions.addRoom(r); toast.success("Room added"); }
            setEdit(null); setAdding(false);
          }} />
      )}
      {del && <ConfirmModal title={`Delete room ${del.no}?`} body="Occupants will lose their room assignment."
        onCancel={() => setDel(null)} onConfirm={() => { actions.removeRoom(del.no); toast.success("Room deleted"); setDel(null); }} />}
    </div>
  );
}

function RoomModal({ initial, meters, onClose, onSave }: { initial?: Room; meters: Meter[]; onClose: () => void; onSave: (r: Room) => void }) {
  const [f, setF] = useState<Room>(initial ?? { no: "", capacity: 4, status: "available", meterNo: meters[0]?.no ?? "" });
  return (
    <Modal title={initial ? "Edit Room" : "Add Room"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Room Number" value={f.no} onChange={(v) => setF({ ...f, no: v })} disabled={!!initial} />
        <FormField label="Capacity" type="number" value={String(f.capacity)} onChange={(v) => setF({ ...f, capacity: Number(v) })} />
        <FormSelect label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v as any })} options={["available", "full", "maintenance"]} />
        <FormSelect label="Meter" value={f.meterNo} onChange={(v) => setF({ ...f, meterNo: v })} options={meters.map((m) => m.no)} />
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
  const meters = useHostel((s) => s.meters);
  const rooms = useHostel((s) => s.rooms);
  const students = useHostel((s) => s.students);
  const [edit, setEdit] = useState<Meter | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<Meter | null>(null);

  return (
    <div className="space-y-4">
      <StickyHeader title="Meter Allocation" subtitle={`${meters.length} meter groups`}
        actions={<button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Meter</button>} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {meters.map((m) => {
          const studs = students.filter((s) => s.meterNo === m.no);
          return (
            <div key={m.no} className="squircle bg-white p-5 shadow-soft animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Zap className="h-5 w-5" /></div>
                  <div>
                    <div className="text-base font-bold">{m.no}</div>
                    <div className="text-xs text-muted-foreground">{m.rooms.length} rooms · {studs.length} students</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEdit(m)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDel(m)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Rooms</div>
                <div className="mt-1 flex flex-wrap gap-1.5">{m.rooms.map((r) => <span key={r} className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs text-violet-700">{r}</span>)}</div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Students</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {studs.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-[9px] font-bold text-white">{initials(s.fullName)}</span>
                      {s.fullName.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>
              {m.notice && (
                <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />{m.notice}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(edit || adding) && (
        <MeterModal initial={edit ?? undefined} rooms={rooms}
          onClose={() => { setEdit(null); setAdding(false); }}
          onSave={(m) => {
            if (edit) { actions.updateMeter(edit.no, m); toast.success("Meter updated"); }
            else { actions.addMeter(m); toast.success("Meter added"); }
            setEdit(null); setAdding(false);
          }} />
      )}
      {del && <ConfirmModal title={`Delete meter ${del.no}?`} body="Rooms will lose their meter assignment."
        onCancel={() => setDel(null)} onConfirm={() => { actions.removeMeter(del.no); toast.success("Meter deleted"); setDel(null); }} />}
    </div>
  );
}

function MeterModal({ initial, rooms, onClose, onSave }: { initial?: Meter; rooms: Room[]; onClose: () => void; onSave: (m: Meter) => void }) {
  const [f, setF] = useState<Meter>(initial ?? { no: "", rooms: [], notice: "" });
  function toggleRoom(r: string) {
    setF((m) => ({ ...m, rooms: m.rooms.includes(r) ? m.rooms.filter((x) => x !== r) : [...m.rooms, r] }));
  }
  return (
    <Modal title={initial ? "Edit Meter" : "Add Meter"} onClose={onClose}>
      <FormField label="Meter Number" value={f.no} onChange={(v) => setF({ ...f, no: v })} disabled={!!initial} />
      <div className="mt-3">
        <div className="mb-1.5 text-xs font-medium">Rooms on this meter</div>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {rooms.map((r) => {
            const on = f.rooms.includes(r.no);
            return (
              <button key={r.no} onClick={() => toggleRoom(r.no)}
                className={`rounded-xl border px-2 py-1.5 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white"}`}>
                {r.no}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1.5 text-xs font-medium">Notice (optional)</div>
        <textarea value={f.notice ?? ""} onChange={(e) => setF({ ...f, notice: e.target.value })} rows={2}
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
  const students = useHostel((s) => s.students);
  const settings = useHostel((s) => s.settings);
  const payments = useHostel((s) => s.payments.filter((p) => p.type === type).sort((a, b) => b.date - a.date));
  const [tab, setTab] = useState<"overview" | "paid" | "unpaid">("overview");
  const [pay, setPay] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const totalFee = type === "registration" ? settings.registrationFee : settings.hostelFee;
  const isPaid = (s: Student) => (type === "registration" ? s.regPaid : s.hostelPaid) >= totalFee;
  const list = tab === "paid" ? students.filter(isPaid) : tab === "unpaid" ? students.filter((s) => !isPaid(s)) : students;

  const paidCount = students.filter(isPaid).length;
  const collected = students.reduce((sum, s) => sum + (type === "registration" ? s.regPaid : s.hostelPaid), 0);
  const outstanding = students.reduce((sum, s) => sum + Math.max(0, totalFee - (type === "registration" ? s.regPaid : s.hostelPaid)), 0);

  return (
    <div className="space-y-4">
      <StickyHeader
        title={type === "registration" ? "Registration Fees" : "Hostel Fees"}
        subtitle={`${fmtGHS(totalFee)} per student`}
        actions={type === "hostel" ? <button onClick={() => setDetailsOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium"><Edit3 className="h-3.5 w-3.5" /> Payment Details</button> : undefined}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total Students" value={students.length} />
        <MiniStat label="Paid" value={paidCount} accent="primary" />
        <MiniStat label="Unpaid/Overdue" value={students.length - paidCount} accent="amber" />
        <MiniStat label="Total Collected" value={fmtGHS(collected)} />
      </div>

      <div className="squircle bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /><strong>Outstanding:</strong> {fmtGHS(outstanding)}</div>
      </div>

      {type === "hostel" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="squircle bg-white p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Bank Transfer</div>
            <div className="mt-1 text-sm"><strong>{settings.bankName}</strong></div>
            <div className="text-sm">{settings.accountName} · {settings.accountNumber}</div>
            <div className="text-xs text-muted-foreground">{settings.branch}</div>
          </div>
          <div className="squircle bg-white p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Mobile Money</div>
            <div className="mt-1 text-sm"><strong>{settings.momoNumber}</strong></div>
            <div className="text-sm">{settings.momoName}</div>
          </div>
        </div>
      )}

      <div className="inline-flex rounded-full bg-muted p-1">
        {(["overview", "paid", "unpaid"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${tab === t ? "bg-white shadow-soft" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((s) => {
          const paid = type === "registration" ? s.regPaid : s.hostelPaid;
          const pct = Math.min(100, (paid / totalFee) * 100);
          const balance = Math.max(0, totalFee - paid);
          const done = balance === 0;
          return (
            <div key={s.id} className="squircle bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">{initials(s.fullName)}</div>
                <div className="flex-1 min-w-[140px]">
                  <div className="text-sm font-bold">{s.fullName}</div>
                  <div className="text-xs text-muted-foreground">{s.id} · {s.roomNo}</div>
                </div>
                <div className="hidden sm:block w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{fmtGHS(paid)} / {fmtGHS(totalFee)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{done ? "Settled" : fmtGHS(balance) + " due"}</div>
                  {done ? <a className="text-xs text-primary underline cursor-pointer">Receipt</a> :
                    <button onClick={() => setPay(s)} className="mt-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Record Payment</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionPanel title="Recent Payments">
        <div className="divide-y divide-border">
          {payments.slice(0, 8).map((p) => {
            const st = students.find((s) => s.id === p.studentId);
            return (
              <div key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{st?.fullName} · {p.id}</div>
                  <div className="text-xs text-muted-foreground">{fmtDate(p.date)} · {p.method}</div>
                </div>
                <div className="text-sm font-semibold">{fmtGHS(p.amount)}</div>
              </div>
            );
          })}
        </div>
      </SectionPanel>

      {pay && <PaymentModal student={pay} type={type} totalFee={totalFee}
        onClose={() => setPay(null)}
        onSave={(amount, method) => {
          actions.recordPayment({ id: (type === "registration" ? "R-" : "H-") + Math.floor(Math.random() * 9999), studentId: pay.id, type, amount, date: Date.now(), method });
          toast.success(`Recorded ${fmtGHS(amount)} for ${pay.fullName}`);
          setPay(null);
        }} />}

      {detailsOpen && type === "hostel" && <PaymentDetailsModal onClose={() => setDetailsOpen(false)} />}
    </div>
  );
}

function PaymentModal({ student, type, totalFee, onClose, onSave }: { student: Student; type: "registration" | "hostel"; totalFee: number; onClose: () => void; onSave: (amount: number, method: "bank" | "momo" | "cash") => void }) {
  const balance = totalFee - (type === "registration" ? student.regPaid : student.hostelPaid);
  const [amount, setAmount] = useState(String(balance));
  const [method, setMethod] = useState<"bank" | "momo" | "cash">("momo");
  return (
    <Modal title="Record Payment" onClose={onClose}>
      <div className="rounded-2xl bg-muted/40 p-3">
        <div className="text-sm font-bold">{student.fullName}</div>
        <div className="text-xs text-muted-foreground">{student.id} · Outstanding: {fmtGHS(Math.max(0, balance))}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <FormField label={`Amount (max ${fmtGHS(balance)})`} type="number" value={amount} onChange={setAmount} />
        <FormSelect label="Method" value={method} onChange={(v) => setMethod(v as any)} options={["momo", "bank", "cash"]} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(Number(amount), method)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Confirm</button>
      </div>
    </Modal>
  );
}

function PaymentDetailsModal({ onClose }: { onClose: () => void }) {
  const s = useHostel((x) => x.settings);
  const [f, setF] = useState({ bankName: s.bankName, accountName: s.accountName, accountNumber: s.accountNumber, branch: s.branch, momoNumber: s.momoNumber, momoName: s.momoName, hostelFee: s.hostelFee });
  return (
    <Modal title="Hostel Fee Payment Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Bank Name" value={f.bankName} onChange={(v) => setF({ ...f, bankName: v })} />
        <FormField label="Account Name" value={f.accountName} onChange={(v) => setF({ ...f, accountName: v })} />
        <FormField label="Account Number" value={f.accountNumber} onChange={(v) => setF({ ...f, accountNumber: v })} />
        <FormField label="Branch" value={f.branch} onChange={(v) => setF({ ...f, branch: v })} />
        <FormField label="MoMo Number" value={f.momoNumber} onChange={(v) => setF({ ...f, momoNumber: v })} />
        <FormField label="MoMo Name" value={f.momoName} onChange={(v) => setF({ ...f, momoName: v })} />
        <FormField label="Annual Hostel Fee" type="number" value={String(f.hostelFee)} onChange={(v) => setF({ ...f, hostelFee: Number(v) })} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => { actions.updateSettings(f); toast.success("Payment details updated"); onClose(); }} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  CHECK-INS  ========================= */

function CheckInsPage() {
  const students = useHostel((s) => s.students);
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">("today");
  const inN = students.filter((s) => s.checkStatus === "in");
  const outN = students.filter((s) => s.checkStatus === "out");

  return (
    <div className="space-y-4">
      <StickyHeader title="Check-In Records" subtitle="Live status & activity" />
      <div className="grid grid-cols-2 gap-3">
        <div className="squircle bg-primary/10 p-5">
          <div className="text-xs uppercase text-primary">Currently In</div>
          <div className="mt-1 text-3xl font-bold text-primary">{inN.length}</div>
        </div>
        <div className="squircle bg-muted p-5">
          <div className="text-xs uppercase text-muted-foreground">Currently Out</div>
          <div className="mt-1 text-3xl font-bold">{outN.length}</div>
        </div>
      </div>

      <SectionPanel title={`Currently In Hostel (${inN.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {inN.map((s) => <span key={s.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{s.fullName} · {s.roomNo}</span>)}
          {inN.length === 0 && <span className="text-sm text-muted-foreground">Nobody is currently checked in.</span>}
        </div>
      </SectionPanel>

      <div className="inline-flex rounded-full bg-muted p-1">
        {(["today", "week", "month", "all"] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${filter === t ? "bg-white shadow-soft" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <SectionPanel title="Records">
        <div className="divide-y divide-border">
          {students.filter((s) => s.lastCheckIn).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">{s.fullName}</div>
                <div className="text-xs text-muted-foreground">In {fmtTime(s.lastCheckIn)} · Out {s.lastCheckOut ? fmtTime(s.lastCheckOut) : "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s.roomNo}</span>
                <BadgeChk status={s.checkStatus} />
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}

/* =========================  STORE ADMIN  ========================= */

function StoreAdminPage() {
  const orders = useHostel((s) => s.orders);
  const items = useHostel((s) => s.storeItems);
  const students = useHostel((s) => s.students);
  const [tab, setTab] = useState<"orders" | "inventory">("orders");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<StoreItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<StoreItem | null>(null);

  const unread = orders.filter((o) => o.unread).length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const today = orders.filter((o) => o.createdAt > Date.now() - 86400000);
  const todayRevenue = today.reduce((s, o) => s + o.total, 0);

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
        <MiniStat label="Today's Orders" value={today.length} accent="primary" />
        <MiniStat label="Today's Revenue" value={fmtGHS(todayRevenue)} accent="primary" />
      </div>

      <div className="inline-flex rounded-full bg-muted p-1">
        {(["orders", "inventory"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${tab === t ? "bg-white shadow-soft" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "orders" ? (
        <>
          <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
            {(["all", "pending", "confirmed", "ready", "delivered", "cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-white text-foreground border border-border"}`}>{s}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((o) => {
              const st = students.find((s) => s.id === o.studentId);
              const open = expanded === o.id;
              return (
                <div key={o.id} className={`squircle bg-white p-4 shadow-soft ${o.unread ? "border-l-4 border-primary" : ""}`}>
                  <button onClick={() => { setExpanded(open ? null : o.id); if (o.unread) actions.markOrderRead(o.id); }} className="flex w-full items-center gap-3 text-left">
                    {o.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold">{st?.fullName ?? "Unknown"}</div>
                        <span className="text-xs text-muted-foreground">{st?.roomNo}</span>
                        <OrderStatusPill status={o.status} />
                      </div>
                      <div className="text-xs text-muted-foreground">{o.id} · {o.items.reduce((s, l) => s + l.qty, 0)} items · {fmtTime(o.createdAt)}</div>
                    </div>
                    <div className="text-sm font-bold">{fmtGHS(o.total)}</div>
                  </button>
                  {open && (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="space-y-1.5 text-sm">
                        {o.items.map((l, i) => {
                          const it = items.find((x) => x.id === l.itemId);
                          return (
                            <div key={i} className="flex justify-between">
                              <span>{it?.emoji} {it?.name} × {l.qty}</span>
                              <span className="text-muted-foreground">{fmtGHS((it?.price ?? 0) * l.qty)}</span>
                            </div>
                          );
                        })}
                      </div>
                      {o.note && <div className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">📝 {o.note}</div>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {o.status === "pending" && <button onClick={() => actions.setOrderStatus(o.id, "confirmed")} className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-medium text-white">Confirm</button>}
                        {o.status === "confirmed" && <button onClick={() => actions.setOrderStatus(o.id, "ready")} className="rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white">Mark Ready</button>}
                        {o.status === "ready" && <button onClick={() => actions.setOrderStatus(o.id, "delivered")} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Mark Delivered</button>}
                        {o.status === "pending" && <button onClick={() => actions.setOrderStatus(o.id, "cancelled")} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">Cancel</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${it.available && it.stock > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {it.available && it.stock > 0 ? "Available" : "Unavailable"}
                </span>
                <button onClick={() => setEditItem(it)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-primary/10"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDel(it)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          {(editItem || adding) && (
            <ItemModal initial={editItem ?? undefined}
              onClose={() => { setEditItem(null); setAdding(false); }}
              onSave={(it) => {
                if (editItem) { actions.updateItem(editItem.id, it); toast.success("Item updated"); }
                else { actions.addItem({ ...it, id: "i" + Math.floor(Math.random() * 9999) }); toast.success("Item added"); }
                setEditItem(null); setAdding(false);
              }} />
          )}
          {del && <ConfirmModal title={`Delete ${del.name}?`} body="This will remove it from the store."
            onCancel={() => setDel(null)} onConfirm={() => { actions.removeItem(del.id); toast.success("Item deleted"); setDel(null); }} />}
        </>
      )}
    </div>
  );
}

function OrderStatusPill({ status }: { status: Order["status"] }) {
  const map = {
    pending: "bg-amber-100 text-amber-700", confirmed: "bg-sky-100 text-sky-700",
    ready: "bg-violet-100 text-violet-700", delivered: "bg-primary/10 text-primary",
    cancelled: "bg-muted text-muted-foreground",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${map[status]}`}>{status}</span>;
}

function ItemModal({ initial, onClose, onSave }: { initial?: StoreItem; onClose: () => void; onSave: (it: StoreItem) => void }) {
  const [f, setF] = useState<StoreItem>(initial ?? { id: "", name: "", emoji: "🛒", description: "", price: 0, unit: "piece", stock: 0, category: "Other", available: true });
  return (
    <Modal title={initial ? "Edit Item" : "Add Item"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <FormField label="Emoji" value={f.emoji} onChange={(v) => setF({ ...f, emoji: v })} />
        <FormField label="Description" value={f.description} onChange={(v) => setF({ ...f, description: v })} />
        <FormField label="Price" type="number" value={String(f.price)} onChange={(v) => setF({ ...f, price: Number(v) })} />
        <FormField label="Unit" value={f.unit} onChange={(v) => setF({ ...f, unit: v })} />
        <FormField label="Stock" type="number" value={String(f.stock)} onChange={(v) => setF({ ...f, stock: Number(v) })} />
        <FormSelect label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={["Water", "Drinks", "Food", "Toiletries", "Stationery", "Other"]} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} className="h-4 w-4 accent-[--color-primary]" />
          Available
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(f)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
      </div>
    </Modal>
  );
}

/* =========================  SMS  ========================= */

const TEMPLATES = {
  "Payment Reminder": "Kindly settle outstanding hostel fees by Friday. Use your Student ID as reference.",
  "Meter Notice": "Please conserve electricity — bill has been running high. Avoid heaters/irons left on.",
  "General Announcement": "Dear residents, please note: ",
};
const RECIPIENT_GROUPS = ["All Students", "Paid Reg.", "Unpaid Reg.", "Checked-In", "Checked-Out", "Block A", "Block B", "Block C", "Meter M-001", "Meter M-002"];

function SmsPage() {
  const sms = useHostel((s) => s.sms);
  const students = useHostel((s) => s.students);
  const [compose, setCompose] = useState(false);
  const [media, setMedia] = useState(false);
  const [prefill, setPrefill] = useState<keyof typeof TEMPLATES | undefined>();

  return (
    <div className="space-y-4">
      <StickyHeader title="SMS Center" subtitle={`${sms.length} messages sent`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setMedia(true)} className="inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white"><ImageIcon className="h-4 w-4" /> Share Media</button>
            <button onClick={() => { setPrefill(undefined); setCompose(true); }} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Send className="h-4 w-4" /> Compose</button>
          </div>
        } />

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Total Sent" value={sms.length} />
        <MiniStat label="Delivered" value={sms.filter((m) => m.status === "delivered").length} accent="primary" />
        <MiniStat label="This Month" value={sms.filter((m) => new Date(m.sentAt).getMonth() === new Date().getMonth()).length} />
      </div>

      <SectionPanel title="Quick Send Templates">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((t) => (
            <button key={t} onClick={() => { setPrefill(t); setCompose(true); }}
              className="rounded-2xl border border-border bg-white p-3 text-left hover:bg-muted/30">
              <div className="text-sm font-bold">{t}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{TEMPLATES[t]}</div>
            </button>
          ))}
        </div>
      </SectionPanel>

      <div className="squircle bg-gradient-to-br from-violet-500 to-violet-700 p-5 text-white">
        <div className="text-base font-bold">Share Media via WhatsApp</div>
        <div className="text-xs opacity-90">Send videos, images, or documents to recipient groups.</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={() => setMedia(true)} className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center text-xs font-medium hover:bg-white/25"><Video className="mx-auto mb-1 h-5 w-5" />Video</button>
          <button onClick={() => setMedia(true)} className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center text-xs font-medium hover:bg-white/25"><ImageIcon className="mx-auto mb-1 h-5 w-5" />Image</button>
          <button onClick={() => setMedia(true)} className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center text-xs font-medium hover:bg-white/25"><FileText className="mx-auto mb-1 h-5 w-5" />Document</button>
        </div>
      </div>

      <SectionPanel title="Message Log">
        <div className="divide-y divide-border">
          {sms.map((m) => (
            <div key={m.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{m.recipients}</span>
                <span>· {m.recipientCount} recipients</span>
                <span>· {fmtDate(m.sentAt)}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${m.status === "delivered" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{m.status}</span>
              </div>
              <div className="mt-1 text-sm">{m.body}</div>
            </div>
          ))}
        </div>
      </SectionPanel>

      {compose && <ComposeModal onClose={() => setCompose(false)} prefillTemplate={prefill} studentCount={students.length} />}
      {media && <MediaModal onClose={() => setMedia(false)} studentCount={students.length} />}
    </div>
  );
}

function ComposeModal({ onClose, prefillTemplate, studentCount }: { onClose: () => void; prefillTemplate?: keyof typeof TEMPLATES; studentCount: number }) {
  const [recipient, setRecipient] = useState(RECIPIENT_GROUPS[0]);
  const [template, setTemplate] = useState<keyof typeof TEMPLATES | "">(prefillTemplate ?? "");
  const [body, setBody] = useState(prefillTemplate ? TEMPLATES[prefillTemplate] : "");
  const count = recipient === "All Students" ? studentCount : Math.max(1, Math.floor(studentCount * 0.4));

  function send() {
    actions.sendSms({ id: "s" + Math.random(), sentAt: Date.now(), recipients: recipient, recipientCount: count, template: template || undefined, body, status: "delivered" });
    toast.success(`SMS sent to ${count} recipient${count > 1 ? "s" : ""}`);
    onClose();
  }
  return (
    <Modal title="Compose SMS" onClose={onClose}>
      <FormSelect label="Recipient Group" value={recipient} onChange={setRecipient} options={RECIPIENT_GROUPS} />
      <div className="mt-2 text-xs text-muted-foreground">~{count} recipients will receive this message</div>
      <div className="mt-3">
        <FormSelect label="Template (optional)" value={template} onChange={(v) => { setTemplate(v as any); if (v) setBody(TEMPLATES[v as keyof typeof TEMPLATES]); }} options={["", ...Object.keys(TEMPLATES)]} />
      </div>
      <div className="mt-3">
        <div className="mb-1.5 text-xs font-medium">Message</div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={320}
          className="w-full rounded-xl border border-border bg-white p-3 text-sm" />
        <div className="mt-1 text-right text-xs text-muted-foreground">{body.length}/320</div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={send} disabled={!body.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" />Send</button>
      </div>
    </Modal>
  );
}

function MediaModal({ onClose, studentCount }: { onClose: () => void; studentCount: number }) {
  const [type, setType] = useState<"video" | "image" | "document">("image");
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState(RECIPIENT_GROUPS[0]);
  const count = recipient === "All Students" ? studentCount : Math.max(1, Math.floor(studentCount * 0.4));
  return (
    <Modal title="Share Media via WhatsApp" onClose={onClose}>
      <div className="grid grid-cols-3 gap-2">
        {(["video", "image", "document"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`rounded-2xl border p-3 text-center text-xs font-medium capitalize ${type === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-border bg-white"}`}>
            {t === "video" ? <Video className="mx-auto mb-1 h-4 w-4" /> : t === "image" ? <ImageIcon className="mx-auto mb-1 h-4 w-4" /> : <FileText className="mx-auto mb-1 h-4 w-4" />}
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3"><FormField label="Title" value={title} onChange={setTitle} /></div>
      <div className="mt-3 grid place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
        Drop a {type} here, or click to choose a file
      </div>
      <div className="mt-3"><FormSelect label="Recipient Group" value={recipient} onChange={setRecipient} options={RECIPIENT_GROUPS} /></div>
      <div className="mt-1 text-xs text-muted-foreground">~{count} WhatsApp recipients will receive this</div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => { toast.success(`Media queued to ${count} recipient${count > 1 ? "s" : ""}`); onClose(); }} className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white">Send</button>
      </div>
    </Modal>
  );
}

/* =========================  REPORTS  ========================= */

function ReportsPage() {
  const s = useHostel((x) => x);
  const [tab, setTab] = useState<"students" | "occupancy" | "fees" | "meters" | "sms">("students");

  const byCourse = useMemo(() => {
    const map = new Map<string, number>();
    s.students.forEach((st) => map.set(st.course, (map.get(st.course) ?? 0) + 1));
    return [...map.entries()].map(([name, count]) => ({ name: name.replace("BSc ", "").replace("BA ", "").replace("BBA ", "").replace("LLB ", ""), count }));
  }, [s.students]);

  const regPie = [
    { name: "Paid", value: s.students.filter((x) => x.regStatus === "paid").length, color: COLORS.primary },
    { name: "Partial", value: s.students.filter((x) => x.regStatus === "partial").length, color: COLORS.amber },
    { name: "Unpaid", value: s.students.filter((x) => x.regStatus === "unpaid").length, color: "#ef4444" },
  ];
  const roomPie = [
    { name: "Available", value: s.rooms.filter((r) => r.status === "available").length, color: COLORS.primary },
    { name: "Full", value: s.rooms.filter((r) => r.status === "full").length, color: COLORS.amber },
    { name: "Maintenance", value: s.rooms.filter((r) => r.status === "maintenance").length, color: "#ef4444" },
  ];

  return (
    <div className="space-y-4">
      <StickyHeader title="Reports" subtitle="Operations & analytics"
        actions={<button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium"><FileText className="h-4 w-4" /> Export</button>} />

      <div className="flex flex-wrap gap-1.5">
        {(["students", "occupancy", "fees", "meters", "sms"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}>{t}</button>
        ))}
      </div>

      {tab === "students" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total" value={s.students.length} />
            <MiniStat label="Checked In" value={s.students.filter((x) => x.checkStatus === "in").length} accent="primary" />
            <MiniStat label="Courses" value={byCourse.length} />
            <MiniStat label="Policy Accepted" value={s.students.filter((x) => x.policyAccepted).length} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Students by Course">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byCourse} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Registration Status">
              <PieBlock data={regPie} />
            </Panel>
          </div>
        </>
      )}

      {tab === "occupancy" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total Rooms" value={s.rooms.length} />
            <MiniStat label="Available" value={roomPie[0].value} accent="primary" />
            <MiniStat label="Full" value={roomPie[1].value} accent="amber" />
            <MiniStat label="Maintenance" value={roomPie[2].value} accent="destructive" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Occupancy Trend">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={Array.from({ length: 6 }).map((_, i) => ({ m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i], occupied: Math.floor(20 + Math.random() * 25) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                  <Bar dataKey="occupied" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Room Status">
              <PieBlock data={roomPie} />
            </Panel>
          </div>
        </>
      )}

      {tab === "fees" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Reg. Collected" value={fmtGHS(s.students.reduce((a, x) => a + x.regPaid, 0))} accent="primary" />
            <MiniStat label="Hostel Collected" value={fmtGHS(s.students.reduce((a, x) => a + x.hostelPaid, 0))} accent="primary" />
            <MiniStat label="Reg. Outstanding" value={fmtGHS(s.students.reduce((a, x) => a + Math.max(0, s.settings.registrationFee - x.regPaid), 0))} accent="amber" />
            <MiniStat label="Hostel Outstanding" value={fmtGHS(s.students.reduce((a, x) => a + Math.max(0, s.settings.hostelFee - x.hostelPaid), 0))} accent="amber" />
          </div>
          <Panel title="Collection Trend">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={Array.from({ length: 6 }).map((_, i) => ({ m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i], collected: Math.floor(15000 + Math.random() * 20000), outstanding: Math.floor(3000 + Math.random() * 9000) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="collected" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                <Bar dataKey="outstanding" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </>
      )}

      {tab === "meters" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {s.meters.map((m) => (
            <div key={m.no} className="squircle bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-base font-bold">{m.no}</div>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">{m.rooms.length} rooms</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.students.filter((st) => st.meterNo === m.no).length} students</div>
            </div>
          ))}
        </div>
      )}

      {tab === "sms" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Total Sent" value={s.sms.length} />
            <MiniStat label="Delivered" value={s.sms.filter((m) => m.status === "delivered").length} accent="primary" />
            <MiniStat label="Recipients Reached" value={s.sms.reduce((a, m) => a + m.recipientCount, 0)} />
          </div>
          <SectionPanel title="Message Log">
            <div className="divide-y divide-border">
              {s.sms.map((m) => (
                <div key={m.id} className="py-2 text-sm">
                  <div className="text-xs text-muted-foreground">{m.recipients} · {fmtDate(m.sentAt)}</div>
                  <div>{m.body}</div>
                </div>
              ))}
            </div>
          </SectionPanel>
        </>
      )}
    </div>
  );
}

function PieBlock({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* =========================  SETTINGS  ========================= */

function SettingsPage() {
  const s = useHostel((x) => x.settings);
  const [f, setF] = useState(s);
  const [saved, setSaved] = useState(false);

  function save() {
    actions.updateSettings(f);
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 2000);
  }
  function up<K extends keyof typeof f>(k: K, v: (typeof f)[K]) { setF((s) => ({ ...s, [k]: v })); }

  return (
    <div className="space-y-4">
      <StickyHeader title="Settings" subtitle="Hostel configuration"
        actions={<button onClick={save} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${saved ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"}`}>
          {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>} />

      <SectionPanel title="Hostel Information">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Hostel Name" value={f.hostelName} onChange={(v) => up("hostelName", v)} />
          <FormField label="Address" value={f.address} onChange={(v) => up("address", v)} />
          <FormField label="Contact Phone" value={f.contactPhone} onChange={(v) => up("contactPhone", v)} />
          <FormField label="WhatsApp" value={f.contactWhatsapp} onChange={(v) => up("contactWhatsapp", v)} />
          <FormField label="Email" value={f.email} onChange={(v) => up("email", v)} />
        </div>
      </SectionPanel>

      <SectionPanel title="Fee Settings">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Registration Fee (GHS)" type="number" value={String(f.registrationFee)} onChange={(v) => up("registrationFee", Number(v))} />
          <FormField label="Hostel Fee (GHS)" type="number" value={String(f.hostelFee)} onChange={(v) => up("hostelFee", Number(v))} />
        </div>
      </SectionPanel>

      <SectionPanel title="SMS Configuration">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="API Key" value={f.smsApiKey} onChange={(v) => up("smsApiKey", v)} />
          <FormField label="Sender ID" value={f.smsSenderId} onChange={(v) => up("smsSenderId", v)} />
        </div>
      </SectionPanel>

      <SectionPanel title="Branding">
        <div className="flex flex-wrap gap-4">
          {(["primary", "soft", "mint"] as const).map((k) => (
            <div key={k} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-border" style={{ background: f.brand[k] }} />
              <div>
                <div className="text-xs uppercase text-muted-foreground">{k}</div>
                <div className="font-mono text-sm">{f.brand[k]}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="System Information">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Version</div><div>1.0.0</div>
          <div className="text-muted-foreground">Framework</div><div>React + TanStack Start</div>
          <div className="text-muted-foreground">Build</div><div className="text-primary">Healthy</div>
        </div>
      </SectionPanel>
    </div>
  );
}

/* =========================  SHARED PRIMITIVES  ========================= */

function StickyHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-2 bg-white/80 px-4 py-3 backdrop-blur-xl border-b border-border lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold leading-tight">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {actions}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="squircle bg-white p-5 shadow-soft">
      <div className="mb-3 text-sm font-bold">{title}</div>
      {children}
    </div>
  );
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="squircle bg-white p-5 shadow-soft">
      <div className="mb-3 text-base font-bold">{title}</div>
      {children}
    </div>
  );
}

function MiniStat({ label, value, accent = "default" }: { label: string; value: string | number; accent?: "default" | "primary" | "amber" | "destructive" }) {
  const c = {
    default: "text-foreground",
    primary: "text-primary",
    amber: "text-amber-700",
    destructive: "text-destructive",
  }[accent];
  return (
    <div className="squircle bg-white p-3 shadow-soft">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${c}`}>{value}</div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium">{label}</div>
      <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted" />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </label>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl squircle bg-white p-6 shadow-glass animate-pop max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-bold">{title}</div>
          <button onClick={onClose} className="text-muted-foreground"><X className="h-5 w-5" /></button>
        </div>
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

function BadgeReg({ status }: { status: Student["regStatus"] }) {
  const m = { paid: "bg-primary/10 text-primary", partial: "bg-amber-100 text-amber-700", unpaid: "bg-destructive/10 text-destructive" };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${m[status]}`}>{status}</span>;
}
function BadgeChk({ status }: { status: Student["checkStatus"] }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status === "in" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{status === "in" ? "In" : "Out"}</span>;
}

/* Mobile nav */
function MobileNav({ page, onChange, onMore, unread }: { page: Nav; onChange: (p: Nav) => void; onMore: () => void; unread: number }) {
  const items: { key: Nav | "more"; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "students", label: "Students", icon: Users },
    { key: "store", label: "Store", icon: ShoppingBag, badge: unread },
    { key: "sms", label: "SMS", icon: MessageSquare },
    { key: "more", label: "More", icon: MoreHorizontal },
  ];
  const idx = items.findIndex((i) => i.key === page);
  return (
    <nav className="lg:hidden fixed bottom-3 left-1/2 z-30 -translate-x-1/2 safe-bottom">
      <div className="glass-strong relative flex items-center gap-1 rounded-full p-1.5">
        <div
          className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-primary shadow-soft transition-all duration-500"
          style={{ width: `calc((100% - 12px) / 5)`, transform: `translateX(calc(${Math.max(0, idx)} * 100%))`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        />
        {items.map((t) => {
          const active = t.key === page;
          return (
            <button key={t.key} onClick={() => t.key === "more" ? onMore() : onChange(t.key as Nav)}
              className={`relative z-10 flex w-16 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition ${active ? "text-white" : "text-foreground/70"}`}>
              <div className="relative">
                <t.icon className="h-5 w-5" />
                {t.badge ? <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">{t.badge}</span> : null}
              </div>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileMore({ current, onPick, onClose, onSignOut }: { current: Nav; onPick: (p: Nav) => void; onClose: () => void; onSignOut: () => void }) {
  const extra = NAV.filter((n) => !["dashboard", "students", "store", "sms"].includes(n.key));
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl bg-white p-5 pb-8 shadow-glass animate-slide-up">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        <div className="grid grid-cols-3 gap-2">
          {extra.map((n) => {
            const active = n.key === current;
            return (
              <button key={n.key} onClick={() => onPick(n.key)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-4 text-xs font-medium ${active ? "bg-gradient-primary text-white" : "bg-muted/40"}`}>
                <n.icon className="h-5 w-5" /> {n.label}
              </button>
            );
          })}
        </div>
        <button onClick={onSignOut} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-medium text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
