import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Home, User, Wallet, ShoppingBag, MoreHorizontal, LogOut, Bell,
  CheckCircle2, XCircle, ArrowRight, Copy, Check, Plus, Minus, Trash2,
  Zap, History, ChevronRight, Phone, MessageCircle, DoorOpen, BookOpen,
  Edit3, Save, X, ChevronDown, ChevronUp, AlertTriangle, Sparkles,
  Building2, Receipt, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import {
  useHostel, actions, fmtGHS, fmtTime, fmtDate, initials,
  type Order, type StoreItem,
} from "@/lib/hostel-store";
import { PolicyGate } from "@/components/PolicyGate";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Student Portal — SME Hostels" }] }),
  component: Portal,
});

type Tab = "home" | "profile" | "fees" | "store" | "more";
type SubPage = null | "meter" | "history";

function Portal() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("home");
  const [sub, setSub] = useState<SubPage>(null);

  const currentId = useHostel((s) => s.currentStudentId) ?? "SME-2024-001";
  const student = useHostel((s) => s.students.find((st) => st.id === currentId));
  const settings = useHostel((s) => s.settings);

  if (!student) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-muted-foreground">No student session.</p>
          <button onClick={() => nav({ to: "/" })} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Sign in</button>
        </div>
      </div>
    );
  }

  if (!student.policyAccepted) {
    return <PolicyGate studentName={student.fullName} onAccept={() => actions.acceptPolicy(student.id)} />;
  }

  function switchUser() {
    actions.setCurrentStudent(null);
    nav({ to: "/" });
  }

  const switchBtn = (
    <button onClick={switchUser} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-white/30">
      <LogOut className="h-3.5 w-3.5" /> Switch
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-gradient-primary px-4 pt-6 pb-8 text-white shadow-glass">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-11 w-11 squircle bg-white p-1.5 object-contain" />
              <div>
                <div className="text-xs uppercase tracking-wider opacity-90">{settings.hostelName}</div>
                <div className="text-lg font-bold leading-tight">Hi {student.fullName.split(" ")[0]} 👋</div>
                <div className="text-xs opacity-90">{student.course} · {student.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTab("profile")} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-sm font-bold backdrop-blur-md hover:bg-white/30">
                {initials(student.fullName)}
              </button>
              {switchBtn}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto -mt-4 max-w-3xl px-4">
        <div key={tab + (sub ?? "")} className="animate-fade-in">
          {tab === "home" && <HomeTab onNavTab={setTab} onSub={setSub} />}
          {tab === "profile" && <ProfileTab />}
          {tab === "fees" && <FeesTab />}
          {tab === "store" && <StoreTab />}
          {tab === "more" && !sub && <MoreTab onSub={setSub} />}
          {tab === "more" && sub === "meter" && <MeterTab onBack={() => setSub(null)} />}
          {tab === "more" && sub === "history" && <HistoryTab onBack={() => setSub(null)} />}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav tab={tab} onChange={(t) => { setTab(t); setSub(null); }} />
    </div>
  );
}

/* =========================  HOME  ========================= */

function HomeTab({ onNavTab, onSub }: { onNavTab: (t: Tab) => void; onSub: (s: SubPage) => void }) {
  const studentId = useHostel((s) => s.currentStudentId)!;
  const s = useHostel((st) => st.students.find((x) => x.id === studentId)!);
  const settings = useHostel((st) => st.settings);
  const pendingOrders = useHostel((st) => st.orders.filter((o) => o.studentId === studentId && o.status !== "delivered" && o.status !== "cancelled").length);
  const meterRoomies = useHostel((st) => st.students.filter((x) => x.meterNo === s.meterNo).length);

  const [confirm, setConfirm] = useState<"in" | "out" | null>(null);

  const regPct = Math.min(100, (s.regPaid / settings.registrationFee) * 100);
  const hostelPct = Math.min(100, (s.hostelPaid / settings.hostelFee) * 100);

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="squircle bg-white p-5 shadow-soft animate-slide-up">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={s.checkStatus === "in" ? "primary" : "muted"} icon={s.checkStatus === "in" ? CheckCircle2 : XCircle}>
            {s.checkStatus === "in" ? "Checked in" : "Checked out"}
          </Badge>
          <Badge color={s.regStatus === "paid" ? "primary" : s.regStatus === "partial" ? "amber" : "destructive"}>
            Reg: {s.regStatus}
          </Badge>
          <div className="ml-auto text-xs text-muted-foreground">Last: {fmtTime(s.lastCheckIn)}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setConfirm("in")}
            disabled={s.checkStatus === "in"}
            className="rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50 hover:opacity-95"
          >Check In</button>
          <button
            onClick={() => setConfirm("out")}
            disabled={s.checkStatus === "out"}
            className="rounded-2xl border border-border bg-white py-3 text-sm font-semibold disabled:opacity-50 hover:bg-muted/40"
          >Check Out</button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={DoorOpen} label="Room" value={s.roomNo} />
        <StatCard icon={Wallet} label="Hostel Fee" value={s.hostelPaid >= settings.hostelFee ? "Paid" : "Pending"} />
        <StatCard icon={Zap} label="Meter" value={s.meterNo} />
        <StatCard icon={CheckCircle2} label="Status" value={s.checkStatus === "in" ? "In" : "Out"} />
      </div>

      {/* Hostel Fee */}
      <FeeProgressCard
        title="Hostel Fee"
        amount={s.hostelPaid}
        total={settings.hostelFee}
        pct={hostelPct}
        accent="primary"
        ctaLabel="Pay Now"
        onCta={() => onNavTab("fees")}
      />

      {/* Registration Fee */}
      <FeeProgressCard
        title="Registration Fee"
        amount={s.regPaid}
        total={settings.registrationFee}
        pct={regPct}
        accent="blue"
        ctaLabel="View Details"
        onCta={() => onNavTab("fees")}
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <ActionCard icon={Wallet} label="Fees & Payments" onClick={() => onNavTab("fees")} />
        <ActionCard icon={ShoppingBag} label="Hostel Store" badge={pendingOrders} onClick={() => onNavTab("store")} />
        <ActionCard icon={Zap} label={`Meter Info (${meterRoomies} sharing)`} onClick={() => { onNavTab("more"); onSub("meter"); }} />
        <ActionCard icon={History} label="Check-In History" onClick={() => { onNavTab("more"); onSub("history"); }} />
      </div>

      {/* Guardian */}
      <div className="squircle bg-white p-5 shadow-soft">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Guardian Contact</div>
        <div className="mt-1.5 text-base font-semibold">{s.guardianName}</div>
        <a href={`tel:${s.guardianPhone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary">
          <Phone className="h-3.5 w-3.5" /> {s.guardianPhone}
        </a>
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm === "in" ? "Confirm Check In" : "Confirm Check Out"}
          body={confirm === "in" ? "Mark yourself as currently in the hostel?" : "Mark yourself as currently out of the hostel?"}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === "in") actions.checkIn(s.id); else actions.checkOut(s.id);
            toast.success(`Checked ${confirm} successfully`);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

/* =========================  PROFILE  ========================= */

function ProfileTab() {
  const id = useHostel((st) => st.currentStudentId)!;
  const s = useHostel((st) => st.students.find((x) => x.id === id)!);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ phone: s.phone, whatsapp: s.whatsapp, guardianName: s.guardianName, guardianPhone: s.guardianPhone });

  function save() {
    actions.updateStudent(s.id, form);
    setEdit(false);
    toast.success("Profile updated");
  }
  return (
    <div className="space-y-4">
      <div className="squircle bg-white p-6 text-center shadow-soft animate-slide-up">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-2xl font-bold text-white shadow-soft">
          {initials(s.fullName)}
        </div>
        <div className="mt-3 text-lg font-bold">{s.fullName}</div>
        <div className="text-xs text-muted-foreground">{s.id}</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge color={s.regStatus === "paid" ? "primary" : s.regStatus === "partial" ? "amber" : "destructive"}>
            Reg: {s.regStatus}
          </Badge>
          <Badge color={s.checkStatus === "in" ? "primary" : "muted"}>{s.checkStatus === "in" ? "Checked in" : "Checked out"}</Badge>
          <Badge color={s.policyAccepted ? "primary" : "amber"} icon={ShieldCheck}>
            {s.policyAccepted ? "Policy accepted" : "Policy pending"}
          </Badge>
        </div>
      </div>

      <SectionCard title="Account Info">
        <InfoRow label="Full Name" value={s.fullName} />
        <InfoRow label="Student ID" value={s.id} />
        <InfoRow label="Course" value={s.course} />
        <InfoRow label="Level" value={s.level} />
        <InfoRow label="Room Number" value={s.roomNo} />
      </SectionCard>

      <SectionCard
        title="Contact Details"
        right={!edit ? (
          <button onClick={() => setEdit(true)} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEdit(false); setForm({ phone: s.phone, whatsapp: s.whatsapp, guardianName: s.guardianName, guardianPhone: s.guardianPhone }); }} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
              <X className="h-3 w-3" /> Cancel
            </button>
            <button onClick={save} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              <Save className="h-3 w-3" /> Save
            </button>
          </div>
        )}
      >
        <EditableRow label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} edit={edit} />
        <EditableRow label="WhatsApp Number" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} edit={edit} />
        <EditableRow label="Guardian Name" value={form.guardianName} onChange={(v) => setForm({ ...form, guardianName: v })} edit={edit} />
        <EditableRow label="Guardian Phone" value={form.guardianPhone} onChange={(v) => setForm({ ...form, guardianPhone: v })} edit={edit} />
      </SectionCard>
    </div>
  );
}

/* =========================  FEES  ========================= */

function FeesTab() {
  const id = useHostel((st) => st.currentStudentId)!;
  const s = useHostel((st) => st.students.find((x) => x.id === id)!);
  const settings = useHostel((st) => st.settings);
  const payments = useHostel((st) => st.payments.filter((p) => p.studentId === id).sort((a, b) => b.date - a.date));

  return (
    <div className="space-y-4">
      <FeeBreakdown title="Hostel Fee" paid={s.hostelPaid} total={settings.hostelFee} accent="primary" />
      <FeeBreakdown title="Registration Fee" paid={s.regPaid} total={settings.registrationFee} accent="blue" />

      <div className="squircle bg-white p-5 shadow-soft">
        <div className="mb-3 text-base font-bold">How to Pay</div>
        <PayAccordion title="Bank Transfer" icon={Building2}
          fields={[
            { label: "Bank Name", value: settings.bankName },
            { label: "Account Name", value: settings.accountName },
            { label: "Account Number", value: settings.accountNumber },
            { label: "Branch", value: settings.branch },
          ]}
          reference={s.id}
        />
        <PayAccordion title="Mobile Money" icon={Phone}
          fields={[
            { label: "MoMo Number", value: settings.momoNumber },
            { label: "Account Name", value: settings.momoName },
          ]}
          reference={s.id}
        />
      </div>

      <SectionCard title="Payment History">
        {payments.length === 0 && <div className="text-sm text-muted-foreground">No payments yet.</div>}
        <div className="divide-y divide-border">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Receipt className="h-4 w-4 text-primary" /> {p.id}
                </div>
                <div className="text-xs text-muted-foreground">{p.type === "registration" ? "Registration" : "Hostel"} · {fmtDate(p.date)}</div>
              </div>
              <div className="text-sm font-semibold">{fmtGHS(p.amount)}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Need Help?">
        <a href={`tel:${settings.contactPhone}`} className="flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Call Management</span>
          <span>{settings.contactPhone}</span>
        </a>
      </SectionCard>
    </div>
  );
}

function PayAccordion({ title, icon: Icon, fields, reference }: {
  title: string; icon: typeof Phone;
  fields: { label: string; value: string }[]; reference: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3 squircle border border-border bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="space-y-2 px-4 pb-4">
          {fields.map((f) => <CopyRow key={f.label} label={f.label} value={f.value} />)}
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>Use <strong>{reference}</strong> as the payment reference so we can match your payment.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
      <div>
        <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
      <button onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); toast.success("Copied"); }}
        className="grid h-9 w-9 place-items-center rounded-xl bg-white text-primary hover:bg-primary/10">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* =========================  STORE  ========================= */

const CATEGORIES = ["All", "Water", "Drinks", "Food", "Toiletries", "Stationery", "Other"];

function StoreTab() {
  const items = useHostel((s) => s.storeItems);
  const studentId = useHostel((s) => s.currentStudentId)!;
  const orders = useHostel((s) => s.orders.filter((o) => o.studentId === studentId).sort((a, b) => b.createdAt - a.createdAt));

  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [placing, setPlacing] = useState(false);

  const visible = items.filter((i) => cat === "All" || i.category === cat);
  const total = useMemo(() => Object.entries(cart).reduce((s, [id, q]) => s + (items.find((i) => i.id === id)?.price ?? 0) * q, 0), [cart, items]);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  function add(it: StoreItem) { setCart((c) => ({ ...c, [it.id]: (c[it.id] ?? 0) + 1 })); }
  function dec(id: string) {
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const { [id]: _, ...rest } = c;
      return n <= 0 ? rest : { ...c, [id]: n };
    });
  }

  function place() {
    if (cartCount === 0) return;
    setPlacing(true);
    setTimeout(() => {
      const o: Order = {
        id: "O-" + Math.floor(1000 + Math.random() * 9000),
        studentId, createdAt: Date.now(),
        items: Object.entries(cart).map(([itemId, qty]) => ({ itemId, qty })),
        note: note || undefined, total, status: "pending", unread: true,
      };
      actions.placeOrder(o);
      setCart({}); setNote(""); setDrawer(false); setPlacing(false);
      toast.success("Order placed! Management has been notified.");
    }, 600);
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-foreground hover:bg-muted/40"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visible.map((it) => {
          const qty = cart[it.id] ?? 0;
          const lowStock = it.stock <= 5 && it.stock > 0;
          const out = !it.available || it.stock === 0;
          return (
            <div key={it.id} className="squircle bg-white p-3 shadow-soft animate-slide-up">
              <div className="text-3xl">{it.emoji}</div>
              <div className="mt-1 text-sm font-semibold leading-tight">{it.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{it.description}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm font-bold text-primary">{fmtGHS(it.price)}<span className="text-[10px] font-normal text-muted-foreground">/{it.unit}</span></div>
                {lowStock && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Low</span>}
              </div>
              <div className="mt-2">
                {out ? (
                  <div className="rounded-xl bg-muted py-2 text-center text-[11px] text-muted-foreground">Out of stock</div>
                ) : qty === 0 ? (
                  <button onClick={() => add(it)} className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-95">Add</button>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-primary/10 p-1">
                    <button onClick={() => dec(it.id)} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-primary"><Minus className="h-3 w-3" /></button>
                    <span className="text-sm font-bold text-primary">{qty}</span>
                    <button onClick={() => add(it)} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-primary"><Plus className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SectionCard title="My Orders">
        {orders.length === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
              <div>
                <div className="text-sm font-semibold">{o.id} · {o.items.reduce((s, l) => s + l.qty, 0)} items</div>
                <div className="text-xs text-muted-foreground">{fmtTime(o.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{fmtGHS(o.total)}</div>
                <OrderStatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button onClick={() => setDrawer(true)}
          className="fixed bottom-28 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-glass animate-pop">
          <ShoppingBag className="h-4 w-4" /> Cart · {cartCount} · {fmtGHS(total)}
        </button>
      )}

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in" onClick={() => setDrawer(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl rounded-t-3xl bg-white p-5 pb-8 shadow-glass animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Your Cart</div>
              <button onClick={() => setDrawer(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-3 space-y-2">
              {Object.entries(cart).map(([id, qty]) => {
                const it = items.find((i) => i.id === id)!;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-2xl bg-muted/40 p-3">
                    <div className="text-2xl">{it.emoji}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{fmtGHS(it.price)} × {qty} = {fmtGHS(it.price * qty)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => dec(id)} className="grid h-7 w-7 place-items-center rounded-lg bg-white"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm font-bold">{qty}</span>
                      <button onClick={() => add(it)} className="grid h-7 w-7 place-items-center rounded-lg bg-white"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => setCart(({ [id]: _, ...rest }) => rest)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
            <textarea placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-border bg-white p-3 text-sm" rows={2} />
            <div className="mt-3 flex items-center justify-between text-base font-bold">
              <span>Total</span><span>{fmtGHS(total)}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Pay on delivery — cash or MoMo.</div>
            <button onClick={place} disabled={placing}
              className="mt-3 w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50">
              {placing ? "Placing…" : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-sky-100 text-sky-700",
    ready: "bg-violet-100 text-violet-700",
    delivered: "bg-primary/10 text-primary",
    cancelled: "bg-muted text-muted-foreground",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status]}`}>{status}</span>;
}

/* =========================  MORE  ========================= */

function MoreTab({ onSub }: { onSub: (s: SubPage) => void }) {
  const settings = useHostel((s) => s.settings);
  return (
    <div className="space-y-3">
      <button onClick={() => onSub("history")} className="flex w-full items-center justify-between squircle bg-white p-5 shadow-soft hover:bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><History className="h-5 w-5" /></div>
          <div className="text-left">
            <div className="text-sm font-semibold">Check-In History</div>
            <div className="text-xs text-muted-foreground">All your check-ins & outs</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button onClick={() => onSub("meter")} className="flex w-full items-center justify-between squircle bg-white p-5 shadow-soft hover:bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Zap className="h-5 w-5" /></div>
          <div className="text-left">
            <div className="text-sm font-semibold">Meter Info</div>
            <div className="text-xs text-muted-foreground">Rooms & students sharing</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <Link to="/contact" className="flex items-center justify-between squircle bg-white p-5 shadow-soft hover:bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><Phone className="h-5 w-5" /></div>
          <div className="text-left">
            <div className="text-sm font-semibold">Emergency & Contacts</div>
            <div className="text-xs text-muted-foreground">Reach the hostel quickly</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      <SectionCard title="Hostel Info">
        <InfoRow label="Hostel" value={settings.hostelName} />
        <InfoRow label="Address" value={settings.address} />
        <InfoRow label="Phone" value={settings.contactPhone} />
        <InfoRow label="WhatsApp" value={settings.contactWhatsapp} />
      </SectionCard>
    </div>
  );
}

function MeterTab({ onBack }: { onBack: () => void }) {
  const id = useHostel((s) => s.currentStudentId)!;
  const me = useHostel((s) => s.students.find((x) => x.id === id)!);
  const meter = useHostel((s) => s.meters.find((m) => m.no === me.meterNo)!);
  const roommates = useHostel((s) => s.students.filter((st) => st.meterNo === me.meterNo));
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-primary">‹ Back</button>
      <div className="squircle bg-white p-6 text-center shadow-soft animate-slide-up">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Zap className="h-8 w-8" /></div>
        <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Your Meter</div>
        <div className="text-3xl font-bold">{meter.no}</div>
      </div>

      <SectionCard title="Rooms on this meter">
        <div className="flex flex-wrap gap-2">
          {meter.rooms.map((r) => (
            <span key={r} className={`rounded-full px-3 py-1 text-xs font-medium ${r === me.roomNo ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{r}</span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={`Students sharing (${roommates.length})`}>
        <div className="divide-y divide-border">
          {roommates.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">{initials(s.fullName)}</div>
                <div>
                  <div className="text-sm font-medium">{s.fullName}</div>
                  <div className="text-xs text-muted-foreground">{s.id}</div>
                </div>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{s.roomNo}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {meter.notice && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <div className="text-sm font-semibold text-amber-900">Management Notice</div>
            <div className="text-xs text-amber-800">{meter.notice}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ onBack }: { onBack: () => void }) {
  const id = useHostel((s) => s.currentStudentId)!;
  const s = useHostel((st) => st.students.find((x) => x.id === id)!);
  // build mock log entries
  const log = useMemo(() => {
    const out: { in: number; out?: number }[] = [];
    if (s.lastCheckIn) out.push({ in: s.lastCheckIn, out: s.checkStatus === "out" ? s.lastCheckOut : undefined });
    for (let i = 1; i < 10; i++) {
      const inTs = Date.now() - i * 86400_000 * 2;
      out.push({ in: inTs, out: inTs + 6 * 3600_000 });
    }
    return out;
  }, [s]);
  const month = new Date().getMonth();
  const thisMonth = log.filter((l) => new Date(l.in).getMonth() === month).length;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-primary">‹ Back</button>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={History} label="Total Check-Ins" value={String(log.length)} />
        <StatCard icon={CheckCircle2} label="This Month" value={String(thisMonth)} />
      </div>
      <SectionCard title="Activity Log">
        <div className="divide-y divide-border">
          {log.map((l, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{fmtDate(l.in)}</div>
                <div className="text-xs text-muted-foreground">In {fmtTime(l.in)} · Out {l.out ? fmtTime(l.out) : "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s.roomNo}</span>
                <Badge color={l.out ? "muted" : "primary"}>{l.out ? "Completed" : "Active"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================  SHARED  ========================= */

function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "profile", label: "Profile", icon: User },
    { key: "fees", label: "Fees", icon: Wallet },
    { key: "store", label: "Store", icon: ShoppingBag },
    { key: "more", label: "More", icon: MoreHorizontal },
  ];
  const idx = tabs.findIndex((t) => t.key === tab);
  return (
    <nav className="fixed bottom-3 left-1/2 z-30 -translate-x-1/2 safe-bottom">
      <div className="glass-strong relative flex items-center gap-1 rounded-full p-1.5">
        <div
          className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-primary shadow-soft transition-all duration-500"
          style={{ width: `calc((100% - 12px) / 5)`, transform: `translateX(calc(${idx} * 100%))`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        />
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <button key={t.key} onClick={() => onChange(t.key)}
              className={`relative z-10 flex w-16 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition ${active ? "text-white" : "text-foreground/70"}`}>
              <t.icon className="h-5 w-5" />
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Badge({ children, color, icon: Icon }: { children: React.ReactNode; color: "primary" | "amber" | "destructive" | "muted" | "blue"; icon?: typeof CheckCircle2 }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
    blue: "bg-sky-100 text-sky-700",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${map[color]}`}>{Icon && <Icon className="h-3 w-3" />}{children}</span>;
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className="squircle bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="mt-1 text-base font-bold">{value}</div>
    </div>
  );
}

function ActionCard({ icon: Icon, label, badge, onClick }: { icon: typeof Home; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative flex items-center gap-3 squircle bg-white p-4 text-left shadow-soft hover:bg-muted/30 transition">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div className="text-sm font-semibold leading-tight">{label}</div>
      {badge ? <span className="absolute right-3 top-3 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{badge}</span> : null}
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function FeeProgressCard({ title, amount, total, pct, accent, ctaLabel, onCta }: {
  title: string; amount: number; total: number; pct: number; accent: "primary" | "blue"; ctaLabel: string; onCta: () => void;
}) {
  const bar = accent === "primary" ? "bg-primary" : "bg-sky-500";
  return (
    <div className="squircle bg-white p-5 shadow-soft">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold">{fmtGHS(amount)}</div>
          <div className="text-xs text-muted-foreground">of {fmtGHS(total)}</div>
        </div>
        <button onClick={onCta} className={`rounded-full ${accent === "primary" ? "bg-primary text-primary-foreground" : "bg-sky-500 text-white"} px-4 py-2 text-xs font-semibold shadow-soft`}>
          {ctaLabel}
        </button>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeeBreakdown({ title, paid, total, accent }: { title: string; paid: number; total: number; accent: "primary" | "blue" }) {
  const balance = Math.max(0, total - paid);
  const pct = Math.min(100, (paid / total) * 100);
  const isPaid = balance === 0;
  return (
    <div className="squircle bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-base font-bold">{title}</div>
        <Badge color={isPaid ? "primary" : "amber"}>{isPaid ? "Paid" : "Outstanding"}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div><div className="text-xs text-muted-foreground">Total</div><div className="text-sm font-semibold">{fmtGHS(total)}</div></div>
        <div><div className="text-xs text-muted-foreground">Paid</div><div className="text-sm font-semibold text-primary">{fmtGHS(paid)}</div></div>
        <div><div className="text-xs text-muted-foreground">Balance</div><div className="text-sm font-semibold text-amber-700">{fmtGHS(balance)}</div></div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${accent === "primary" ? "bg-primary" : "bg-sky-500"} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionCard({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="squircle bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-bold">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-none">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function EditableRow({ label, value, onChange, edit }: { label: string; value: string; onChange: (v: string) => void; edit: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-none">
      <div className="text-xs text-muted-foreground">{label}</div>
      {edit ? (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-1/2 rounded-lg border border-border bg-white px-2 py-1 text-right text-sm" />
      ) : (
        <div className="text-sm font-medium">{value}</div>
      )}
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
          <button onClick={onConfirm} className="rounded-2xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Confirm</button>
        </div>
      </div>
    </div>
  );
}
