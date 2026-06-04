import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  User, Phone, MessageCircle, BookOpen, Layers, DoorOpen, ShieldCheck,
  AtSign, Lock, ArrowRight, ArrowLeft, CheckCircle2, FileText, Sparkles,
  Zap, CreditCard, Loader2,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import building from "@/assets/building.jpg";
import { useRegisterStudent, useRooms, useMeters, useSettings, useHostelFeeForRoom } from "@/lib/queries";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Student Onboarding — SME Hostels" },
      { name: "description", content: "Create your SME Hostels student account." },
    ],
  }),
  component: Onboarding,
});

type Step = 1 | 2 | 3; // 1=details, 2=policy, 3=payment

type Form = {
  fullName: string; phone: string; whatsapp: string; course: string;
  level: string; roomNo: string; guardianName: string; guardianPhone: string; username: string; password: string;
};

const empty: Form = {
  fullName: "", phone: "", whatsapp: "", course: "", level: "",
  roomNo: "", guardianName: "", guardianPhone: "", username: "", password: "",
};

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<Form>(empty);
  const [accepted, setAccepted] = useState(false);
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: meters = [] } = useMeters();
  const { data: settings } = useSettings();
  const { data: roomFeeData } = useHostelFeeForRoom(form.roomNo);
  const createStudent = useRegisterStudent();
  // hostelFee shown on step 3 notice

  // Registration fee is flat; hostel fee depends on room capacity
  const hostelFee = roomFeeData?.hostelFee ?? settings?.hostel_fee ?? 0;

  const upd = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Auto-resolve meter from selected room
  const resolvedMeter = useMemo(() => {
    if (!form.roomNo) return null;
    const room = rooms.find((r: any) => r.no === form.roomNo);
    return room?.meter_no ?? null;
  }, [form.roomNo, rooms]);

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function acceptPolicy() {
    if (!accepted) return;
    // Create the student account now (policy_accepted = true)
    const studentId = "SME-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900));
    createStudent.mutate(
      {
        id: studentId,
        full_name: form.fullName,
        phone: form.phone,
        whatsapp: form.whatsapp,
        course: form.course,
        level: form.level,
        room_no: form.roomNo || null,
        meter_no: resolvedMeter,
        guardian_name: form.guardianName,
        guardian_phone: form.guardianPhone,
        username: form.username,
        password: form.password,
        accepted_at: new Date().toISOString(),
      },
      {
        onSuccess: (student) => {
          try {
            localStorage.setItem("sme_student_profile", JSON.stringify({ id: student.id, fullName: student.full_name }));
          } catch {}
          sessionStorage.setItem("sme_student_id", student.id);
          setCreatedStudentId(student.id);
          setStep(3);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    );
  }

  const stepLabels: { n: Step; label: string }[] = [
    { n: 1, label: "Your details" },
    { n: 2, label: "Policy" },
    { n: 3, label: "Done" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img src={building} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-background/90" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="SME Hostels" className="h-14 w-auto squircle bg-white p-2 shadow-glass" />
          <div className="text-white">
            <div className="text-xs uppercase tracking-wider opacity-80">SME Hostels</div>
            <div className="text-xl font-semibold">Student onboarding</div>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-5 flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${step >= s.n ? "bg-white text-primary shadow-soft" : "bg-white/30 text-white"}`}>
                {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span className="hidden text-sm font-medium text-white sm:inline">{s.label}</span>
              {i < stepLabels.length - 1 && <div className={`h-1 flex-1 rounded-full ${step > s.n ? "bg-white" : "bg-white/30"}`} />}
            </div>
          ))}
        </div>

        <div className="glass squircle p-6 shadow-glass animate-slide-up sm:p-8">
          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <form onSubmit={submitDetails} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Tell us about you</h2>
                <p className="text-sm text-muted-foreground">We use this to set up your room access and billing.</p>
              </div>

              <Field icon={User} label="Full name" placeholder="Ama Mensah" value={form.fullName} onChange={upd("fullName")} required />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={Phone} type="tel" label="Phone number" placeholder="+233 20 000 0000" value={form.phone} onChange={upd("phone")} required />
                <Field icon={MessageCircle} type="tel" label="WhatsApp number" placeholder="+233 20 000 0000" value={form.whatsapp} onChange={upd("whatsapp")} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={BookOpen} label="Course / Program" placeholder="BSc Computer Science" value={form.course} onChange={upd("course")} required />
                <SelectField icon={Layers} label="Level" value={form.level} onChange={upd("level")} required placeholder="Select level"
                  options={["100", "200", "300", "400", "500", "600"].map((o) => ({ value: o, label: `Level ${o}` }))} />
              </div>

              {/* Room dropdown — populated from DB */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Room number</label>
                  <div className="relative">
                    <DoorOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select value={form.roomNo} onChange={upd("roomNo")} required
                      className="w-full appearance-none rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2">
                      <option value="">{roomsLoading ? "Loading rooms…" : "Select your room"}</option>
                      {rooms
                        .filter((r: any) => r.status === "available")
                        .map((r: any) => (
                          <option key={r.no} value={r.no}>{r.no}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Meter — auto-resolved, read-only */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Electricity meter</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <div className={`w-full rounded-2xl border border-border py-3 pl-10 pr-4 text-sm ${resolvedMeter ? "bg-primary/5 text-primary font-medium" : "bg-white/50 text-muted-foreground"}`}>
                      {resolvedMeter ?? (form.roomNo ? "No meter assigned" : "Auto-filled from room")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={ShieldCheck} label="Guardian's name" placeholder="Mr. Mensah" value={form.guardianName} onChange={upd("guardianName")} required />
                <Field icon={Phone} type="tel" label="Guardian's phone" placeholder="+233 24 000 0000" value={form.guardianPhone} onChange={upd("guardianPhone")} required />
              </div>

              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Create your sign-in
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field icon={AtSign} label="Username" placeholder="ama.mensah" value={form.username} onChange={upd("username")} required />
                  <Field icon={Lock} type="password" label="Password" placeholder="At least 8 characters" value={form.password} onChange={upd("password")} required minLength={8} />
                </div>
              </div>

              <button type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 active:scale-[.98]">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ── STEP 2: Policy ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Hostel guidelines & code of conduct</h2>
                  <p className="text-sm text-muted-foreground">Read carefully — acceptance is mandatory to proceed.</p>
                </div>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-border bg-white/70 p-5 text-sm leading-relaxed text-foreground">
                {GUIDELINES.map((g, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium">{g.title}</div>
                      <p className="text-muted-foreground">{g.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary/60 p-4">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[oklch(0.68_0.17_145)]" />
                <span className="text-sm">
                  I, <strong>{form.fullName || "the student"}</strong>, have read and agree to abide by the
                  SME Hostels guidelines and code of conduct. I understand violations may result in disciplinary action.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={acceptPolicy} disabled={!accepted || createStudent.isPending}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50">
                  {createStudent.isPending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                    : <>Accept & continue <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Registration fee notice ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Almost there!</h2>
                  <p className="text-sm text-muted-foreground">One last thing before you enter the portal.</p>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-semibold">{form.fullName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-semibold">{form.roomNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Meter</span>
                  <span className="font-semibold">{resolvedMeter ?? "—"}</span>
                </div>
                {roomFeeData?.capacity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Annual hostel fee</span>
                    <span className="font-semibold">GHS {hostelFee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Registration fee notice */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Registration fee required</div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      GHS {settings?.registration_fee?.toLocaleString() ?? "—"}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      This one-time fee must be paid to management to activate your account fully.
                      You can pay via <strong>bank transfer or MoMo</strong> — details are in the Fees section of your portal.
                      Use your Student ID as the payment reference.
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => navigate({ to: "/portal" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
                Enter portal <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-white/80">
          Already onboarded? <Link to="/" className="font-medium underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

/* ── Shared field components ── */

function Field({ icon: Icon, label, ...props }: { icon: typeof User; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input {...props} className="w-full rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2" />
      </div>
    </label>
  );
}

function SelectField({ icon: Icon, label, options, placeholder, ...props }: {
  icon: typeof User; label: string; options: { value: string; label: string }[]; placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select {...props} className="w-full appearance-none rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2">
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </label>
  );
}

const GUIDELINES = [
  { title: "Quiet hours (10pm – 6am)", body: "Keep noise to a minimum to respect fellow residents preparing for classes and rest." },
  { title: "No unauthorized visitors", body: "Visitors must sign in at reception. Overnight guests are not permitted without prior approval." },
  { title: "Keep your room & shared spaces clean", body: "Weekly inspections take place. Damages will be billed to the responsible student." },
  { title: "Fire & safety compliance", body: "No cooking appliances, candles, or smoking in rooms. Know your nearest fire exit." },
  { title: "Respect & zero tolerance for harassment", body: "Discrimination, bullying, or harassment of any kind will lead to immediate review." },
  { title: "Timely fee payments", body: "Rent and utilities must be settled by the posted due dates. Late fees apply after grace periods." },
  { title: "Report issues promptly", body: "Contact management for plumbing, electrical, Wi-Fi or any safety concerns." },
  { title: "Emergency contact awareness", body: "Memorize the 24/7 hostel security line. In medical emergencies, call the posted emergency numbers." },
];
