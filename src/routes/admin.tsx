import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Users, Bed, Wallet, Wrench, Megaphone, LogOut,
  TrendingUp, ArrowUpRight, Search, Plus, CheckCircle2, Clock, Phone,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SME Hostels" },
      { name: "description", content: "Manage students, rooms, payments and maintenance across SME Hostels." },
    ],
  }),
  component: Admin,
});

type Section = "dashboard" | "students" | "rooms" | "payments" | "maintenance" | "announcements";

function Admin() {
  const [section, setSection] = useState<Section>("dashboard");

  const nav: { k: Section; icon: typeof LayoutDashboard; label: string }[] = [
    { k: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { k: "students", icon: Users, label: "Students" },
    { k: "rooms", icon: Bed, label: "Rooms" },
    { k: "payments", icon: Wallet, label: "Payments" },
    { k: "maintenance", icon: Wrench, label: "Maintenance" },
    { k: "announcements", icon: Megaphone, label: "Notices" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-white/80 p-4 backdrop-blur-xl lg:flex xl:w-64">
        <Link to="/" className="mb-6 flex items-center gap-3 px-2 py-1">
          <img src={logo} alt="SME Hostels" className="h-10 w-auto max-w-[160px] object-contain" />
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => (
            <button key={n.k} onClick={() => setSection(n.k)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${section === n.k ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
          <LogOut className="h-4 w-4" /> Sign out
        </Link>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8 xl:px-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin · {section}</div>
            <h1 className="text-2xl font-bold capitalize lg:text-3xl">{sectionTitle(section)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search students, rooms…" className="w-56 rounded-2xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 xl:w-72" />
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft">
              <Plus className="h-4 w-4" /> New
            </button>
          </div>
        </header>

        <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
          {nav.map((n) => (
            <button key={n.k} onClick={() => setSection(n.k)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${section === n.k ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-white text-muted-foreground"}`}>
              <n.icon className="h-3 w-3" />{n.label}
            </button>
          ))}
        </div>

        <div key={section} className="animate-fade-in">
          {section === "dashboard" && <Dashboard />}
          {section === "students" && <StudentsSection />}
          {section === "rooms" && <RoomsSection />}
          {section === "payments" && <PaymentsSection />}
          {section === "maintenance" && <MaintenanceSection />}
          {section === "announcements" && <AnnouncementsSection />}
        </div>
      </main>
    </div>
  );
}

function sectionTitle(s: Section) {
  return s === "dashboard" ? "Overview" : s;
}

const revenue = [
  { m: "Jun", v: 38 }, { m: "Jul", v: 42 }, { m: "Aug", v: 60 },
  { m: "Sep", v: 78 }, { m: "Oct", v: 84 }, { m: "Nov", v: 92 },
];
const occByBlock = [
  { name: "Block A", v: 96 }, { name: "Block B", v: 88 },
  { name: "Block C", v: 74 }, { name: "Block D", v: 62 },
];
const roomMix = [
  { name: "Single", value: 40 },
  { name: "Double", value: 95 },
  { name: "Quad", value: 35 },
];
const COLORS = ["#4CAF50", "#66BB6A", "#A5D6A7"];
const CHART_PRIMARY = "#4CAF50";
const CHART_GRID = "#E2EFE3";
const CHART_AXIS = "#7A8A82";

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Occupancy", v: "87%", d: "+4.2%", icon: Bed },
          { label: "Active students", v: "342", d: "+12", icon: Users },
          { label: "Revenue (Nov)", v: "GHS 92k", d: "+9.1%", icon: Wallet },
          { label: "Open requests", v: "7", d: "-3", icon: Wrench },
        ].map((s) => (
          <div key={s.label} className="squircle bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"><ArrowUpRight className="h-3 w-3" />{s.d}</span>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 squircle bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Revenue trend</h2>
              <p className="text-xs text-muted-foreground">Last 6 months · GHS (thousands)</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary"><TrendingUp className="h-3 w-3" /> Live</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="m" stroke={CHART_AXIS} fontSize={12} />
                <YAxis stroke={CHART_AXIS} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px -8px rgba(0,0,0,.15)" }} />
                <Area type="monotone" dataKey="v" stroke={CHART_PRIMARY} strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="squircle bg-white p-5 shadow-soft">
          <h2 className="font-semibold">Room mix</h2>
          <p className="text-xs text-muted-foreground">By type</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roomMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {roomMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="squircle bg-white p-5 shadow-soft">
        <h2 className="font-semibold">Occupancy by block</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occByBlock} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="name" stroke={CHART_AXIS} fontSize={12} />
              <YAxis stroke={CHART_AXIS} fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px -8px rgba(0,0,0,.15)" }} />
              <Bar dataKey="v" fill={CHART_PRIMARY} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const studentsList = [
  { name: "Ama Mensah", room: "B-304", program: "BSc Computer Science", status: "Active" },
  { name: "Kojo Asante", room: "B-304", program: "BSc Mechanical Eng.", status: "Active" },
  { name: "Yaa Owusu", room: "A-101", program: "BA Economics", status: "Active" },
  { name: "Kwame Boateng", room: "C-210", program: "BSc Mathematics", status: "Pending" },
  { name: "Akua Frimpong", room: "D-402", program: "BSc Nursing", status: "Active" },
];

function StudentsSection() {
  return (
    <div className="squircle overflow-hidden bg-white p-2 shadow-soft">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Student</th><th className="p-3">Room</th><th className="p-3 hidden md:table-cell">Program</th><th className="p-3">Status</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {studentsList.map((s) => (
            <tr key={s.name} className="border-t border-border">
              <td className="p-3 font-medium">{s.name}</td>
              <td className="p-3">{s.room}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{s.program}</td>
              <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "Active" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>{s.status}</span></td>
              <td className="p-3 text-right"><button className="text-xs font-medium text-primary hover:underline">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoomsSection() {
  const rooms = Array.from({ length: 16 }, (_, i) => ({
    no: `B-${301 + i}`,
    occ: Math.random() > 0.3 ? "Occupied" : "Vacant",
  }));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {rooms.map((r) => (
        <div key={r.no} className="squircle bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">{r.no}</div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${r.occ === "Occupied" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{r.occ}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Block B · 3rd floor</div>
        </div>
      ))}
    </div>
  );
}

function PaymentsSection() {
  const rows = [
    { who: "Ama Mensah", what: "Semester rent", amt: "GHS 4,500", status: "Paid" },
    { who: "Kojo Asante", what: "Utilities Nov", amt: "GHS 135", status: "Due" },
    { who: "Yaa Owusu", what: "Semester rent", amt: "GHS 4,500", status: "Paid" },
    { who: "Akua Frimpong", what: "Late fee", amt: "GHS 50", status: "Overdue" },
  ];
  return (
    <div className="squircle bg-white p-2 shadow-soft">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Student</th><th className="p-3">Item</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-3 font-medium">{r.who}</td>
              <td className="p-3 text-muted-foreground">{r.what}</td>
              <td className="p-3">{r.amt}</td>
              <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "Paid" ? "bg-primary/10 text-primary" : r.status === "Due" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaintenanceSection() {
  const items = [
    { title: "Leaky tap", room: "B-304", status: "in_progress" },
    { title: "Broken bulb", room: "A-101", status: "resolved" },
    { title: "Wi-Fi router reset", room: "C-210", status: "in_progress" },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((i) => (
        <div key={i.title} className="squircle bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="font-medium">{i.title}</div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${i.status === "resolved" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>
              {i.status === "resolved" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {i.status === "resolved" ? "Resolved" : "In progress"}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Room {i.room}</div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Assign</button>
            <a href="tel:+233200000001" className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs"><Phone className="h-3 w-3" /> Call student</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsSection() {
  return (
    <div className="space-y-4">
      <div className="squircle bg-white p-5 shadow-soft">
        <h2 className="font-semibold">Broadcast a notice</h2>
        <form onSubmit={(e) => { e.preventDefault(); alert("Notice sent to all students."); }} className="mt-3 space-y-3">
          <input placeholder="Title" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" />
          <textarea rows={4} placeholder="Message" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft">Send to all</button>
        </form>
      </div>
      <div className="squircle bg-white p-5 shadow-soft">
        <h2 className="mb-3 font-semibold">Recent notices</h2>
        {["Water maintenance — Sat 9–11am", "New gym equipment now available", "Mid-semester deep cleaning schedule"].map((t) => (
          <div key={t} className="border-t border-border py-3 first:border-0 first:pt-0">{t}</div>
        ))}
      </div>
    </div>
  );
}
