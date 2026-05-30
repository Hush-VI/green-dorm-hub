import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User, Phone, MessageCircle, BookOpen, Layers, DoorOpen, ShieldCheck,
  AtSign, Lock, ArrowRight, ArrowLeft, CheckCircle2, FileText, Sparkles,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import building from "@/assets/building.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Student Onboarding — SME Hostels" },
      { name: "description", content: "Create your SME Hostels student account in two simple steps." },
    ],
  }),
  component: Onboarding,
});

type Form = {
  fullName: string; phone: string; whatsapp: string; course: string;
  level: string; room: string; guardianPhone: string; username: string; password: string;
};

const empty: Form = {
  fullName: "", phone: "", whatsapp: "", course: "", level: "",
  room: "", guardianPhone: "", username: "", password: "",
};

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Form>(empty);
  const [accepted, setAccepted] = useState(false);

  const upd = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  function submitInfo(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    if (!accepted) return;
    navigate({ to: "/portal" });
  }

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
        <div className="mb-5 flex items-center gap-3">
          <StepDot n={1} active={step >= 1} done={step > 1} label="Your details" />
          <div className={`h-1 flex-1 rounded-full ${step > 1 ? "bg-white" : "bg-white/30"}`} />
          <StepDot n={2} active={step >= 2} done={false} label="Guidelines" />
        </div>

        <div className="glass squircle p-6 shadow-glass animate-slide-up sm:p-8">
          {step === 1 ? (
            <form onSubmit={submitInfo} className="space-y-4">
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
                <SelectField icon={Layers} label="Level" value={form.level} onChange={upd("level")} required
                  options={["100", "200", "300", "400", "500", "600"]} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={DoorOpen} label="Room number" placeholder="B-304" value={form.room} onChange={upd("room")} required />
                <Field icon={ShieldCheck} type="tel" label="Guardian's phone" placeholder="+233 24 000 0000" value={form.guardianPhone} onChange={upd("guardianPhone")} required />
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
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Hostel guidelines & code of conduct</h2>
                  <p className="text-sm text-muted-foreground">Please read carefully before continuing.</p>
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
                <button onClick={finish} disabled={!accepted}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50">
                  Accept & enter portal <ArrowRight className="h-4 w-4" />
                </button>
              </div>
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

function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${active ? "bg-white text-primary shadow-soft" : "bg-white/30 text-white"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className="hidden text-sm font-medium text-white sm:inline">{label}</span>
    </div>
  );
}

function Field({
  icon: Icon, label, ...props
}: { icon: typeof User; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input {...props}
          className="w-full rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2" />
      </div>
    </label>
  );
}

function SelectField({
  icon: Icon, label, options, ...props
}: { icon: typeof User; label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select {...props}
          className="w-full appearance-none rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2">
          <option value="">Select level</option>
          {options.map((o) => <option key={o} value={o}>Level {o}</option>)}
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
  { title: "Report issues promptly", body: "Use the Maintenance tab for plumbing, electrical, Wi-Fi or any safety concerns." },
  { title: "Emergency contact awareness", body: "Memorize the 24/7 hostel security line: +233 20 000 0001. In medical emergencies, call +233 20 000 0002." },
];
