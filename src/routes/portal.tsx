import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home, CreditCard, Wrench, Bell, LogOut, User, Calendar,
  CheckCircle2, Clock, Phone, AlertTriangle, MapPin, Wifi, Utensils, Sparkles,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import building from "@/assets/building.jpg";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Student Portal — SME Hostels" },
      { name: "description", content: "View your room, pay fees, request maintenance and stay updated." },
    ],
  }),
  component: Portal,
});

const announcements = [
  { title: "Water maintenance — Sat 9–11am", time: "2h ago", tag: "Notice" },
  { title: "New gym equipment now available", time: "Yesterday", tag: "Update" },
  { title: "Mid-semester deep cleaning schedule", time: "2d ago", tag: "Schedule" },
];

const payments = [
  { label: "Semester rent", amount: "GHS 4,500", status: "Paid", date: "Sep 02" },
  { label: "Utilities (Oct)", amount: "GHS 120", status: "Paid", date: "Oct 05" },
  { label: "Utilities (Nov)", amount: "GHS 135", status: "Due", date: "Nov 30" },
];

const TABS = [
  { k: "home", icon: Home, label: "Home" },
  { k: "payments", icon: CreditCard, label: "Fees" },
  { k: "maintenance", icon: Wrench, label: "Repair" },
  { k: "notices", icon: Bell, label: "News" },
] as const;

function Portal() {
  const [tab, setTab] = useState<"home" | "payments" | "maintenance" | "notices">("home");
  const activeIndex = TABS.findIndex((t) => t.k === tab);

  return (
    <div className="min-h-screen bg-gradient-soft pb-28">
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SME" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-secondary transition active:scale-90"><Bell className="h-4 w-4" /></button>
            <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-secondary transition active:scale-90"><LogOut className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      <main key={tab} className="mx-auto max-w-md px-4 py-6 animate-fade-in">
        {tab === "home" && <HomeTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "maintenance" && <MaintenanceTab />}
        {tab === "notices" && <NoticesTab />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 safe-bottom px-4 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-sm">
          <div className="glass-strong relative flex items-center justify-around rounded-[28px] p-1.5">
            <div
              className="absolute top-1.5 bottom-1.5 left-1.5 rounded-[22px] bg-gradient-primary shadow-soft transition-all duration-500"
              style={{
                width: `calc((100% - 0.75rem) / ${TABS.length})`,
                transform: `translateX(calc(${activeIndex} * 100%))`,
                transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
              }}
            />
            {TABS.map((t, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-[22px] py-2 text-[11px] font-medium transition active:scale-90 ${active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <t.icon className={`h-[18px] w-[18px] transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                  <span className={`transition-opacity ${active ? "opacity-100" : "opacity-80"}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

function HomeTab() {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="squircle relative overflow-hidden bg-gradient-primary p-5 text-primary-foreground shadow-soft">
        <div className="absolute inset-0 opacity-20">
          <img src={building} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-xs opacity-90"><User className="h-3 w-3" /> Welcome back</div>
          <h1 className="mt-1 text-2xl font-bold">Ama Mensah</h1>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-xs opacity-80">Room</div>
              <div className="text-xl font-semibold">B · 304</div>
            </div>
            <div>
              <div className="text-xs opacity-80">Roommate</div>
              <div className="text-sm font-medium">Kojo A.</div>
            </div>
            <div>
              <div className="text-xs opacity-80">Lease ends</div>
              <div className="text-sm font-medium">May 31</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Wifi, label: "Wi-Fi", v: "Online" },
          { icon: Utensils, label: "Meals today", v: "Jollof · 6pm" },
          { icon: Sparkles, label: "Cleaning", v: "Wed 10am" },
          { icon: MapPin, label: "Block", v: "B · 3rd floor" },
        ].map((c) => (
          <div key={c.label} className="squircle bg-white p-4 shadow-soft">
            <c.icon className="h-4 w-4 text-primary" />
            <div className="mt-2 text-xs text-muted-foreground">{c.label}</div>
            <div className="text-sm font-semibold">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="squircle bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Outstanding balance</h2>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Due Nov 30</span>
        </div>
        <div className="mt-2 text-3xl font-bold">GHS 135<span className="text-base font-normal text-muted-foreground">.00</span></div>
        <button className="mt-4 w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft">Pay now</button>
      </div>

      <div className="squircle bg-white p-5 shadow-soft">
        <h2 className="mb-3 font-semibold">Emergency</h2>
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:+233200000001" className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <div><div className="text-[10px] font-medium">Security</div><div className="text-xs font-semibold">Call now</div></div>
          </a>
          <a href="tel:+233300000000" className="flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-primary">
            <Phone className="h-4 w-4" />
            <div><div className="text-[10px] font-medium">Reception</div><div className="text-xs font-semibold">+233 30 000</div></div>
          </a>
        </div>
        <Link to="/contact" className="mt-3 block text-center text-xs text-primary hover:underline">All contacts →</Link>
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="squircle bg-white shadow-soft">
        {payments.map((p, i) => (
          <div key={p.label} className={`flex items-center justify-between p-4 ${i ? "border-t border-border" : ""}`}>
            <div>
              <div className="font-medium">{p.label}</div>
              <div className="text-xs text-muted-foreground">{p.date}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{p.amount}</div>
              <span className={`text-xs ${p.status === "Paid" ? "text-primary" : "text-destructive"}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaintenanceTab() {
  const [type, setType] = useState("Plumbing");
  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold">Request maintenance</h1>
      <form onSubmit={(e) => { e.preventDefault(); alert("Request submitted!"); }} className="squircle space-y-3 bg-white p-5 shadow-soft">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm">
            <option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Cleaning</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Describe the issue</label>
          <textarea rows={4} className="mt-1 w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" placeholder="e.g. bathroom tap is leaking" />
        </div>
        <button className="w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft">Submit request</button>
      </form>

      <div className="squircle bg-white p-5 shadow-soft">
        <h2 className="mb-3 font-semibold">Recent</h2>
        <div className="space-y-3">
          <RequestItem title="Window latch broken" status="resolved" />
          <RequestItem title="Slow drainage in shower" status="in_progress" />
        </div>
      </div>
    </div>
  );
}

function RequestItem({ title, status }: { title: string; status: "resolved" | "in_progress" }) {
  const map = {
    resolved: { icon: CheckCircle2, label: "Resolved", cls: "text-primary bg-primary/10" },
    in_progress: { icon: Clock, label: "In progress", cls: "text-amber-600 bg-amber-100" },
  } as const;
  const M = map[status];
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium">{title}</div>
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${M.cls}`}><M.icon className="h-3 w-3" /> {M.label}</span>
    </div>
  );
}

function NoticesTab() {
  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold">Notices</h1>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.title} className="squircle bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{a.tag}</span>
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{a.time}</span>
            </div>
            <div className="mt-2 font-medium">{a.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
