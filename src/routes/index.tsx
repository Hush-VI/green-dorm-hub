import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, ShieldCheck, GraduationCap, Phone, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.jpg";
import building from "@/assets/building.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SME Hostels — Sign In" },
      { name: "description", content: "Sign in to your SME Hostels portal — manage bookings, payments, and stay updates." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [studentName, setStudentName] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sme_student_profile");
      if (raw) {
        const p = JSON.parse(raw);
        setHasOnboarded(true);
        setStudentName(p?.fullName?.split(" ")?.[0] ?? "");
      } else {
        setHasOnboarded(false);
      }
    } catch {
      setHasOnboarded(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: role === "admin" ? "/admin" : "/portal" });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img src={building} alt="SME Hostels building" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/30 to-background/80" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 lg:flex-row lg:gap-12">
        <div className="hidden lg:flex flex-1 flex-col gap-6 text-white animate-fade-in">
          <img src={logo} alt="SME Hostels logo" className="h-24 w-auto squircle bg-white p-3 shadow-glass" />
          <h1 className="text-5xl font-bold leading-tight tracking-tight drop-shadow">
            A home away from home.
          </h1>
          <p className="max-w-md text-lg text-white/90">
            Premium student living, simplified. Book rooms, pay fees, request maintenance — all in one beautiful place.
          </p>
          <div className="flex items-center gap-3 text-white/90">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm">Secure portal · 24/7 hostel support</span>
          </div>
        </div>

        <div className="w-full max-w-md animate-slide-up">
          <div className="glass squircle p-8 shadow-glass">
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <img src={logo} alt="SME Hostels logo" className="h-20 w-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${role === "student" ? "bg-white text-primary shadow-soft" : "text-muted-foreground"}`}
              >
                <GraduationCap className="h-4 w-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${role === "admin" ? "bg-white text-primary shadow-soft" : "text-muted-foreground"}`}
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  defaultValue={role === "admin" ? "admin@smehostels.com" : "student@smehostels.com"}
                  className="w-full rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2"
                  placeholder="Email address"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  defaultValue="demo1234"
                  className="w-full rounded-2xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2"
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 active:scale-[.98]"
              >
                Sign in to {role === "admin" ? "admin dashboard" : "student portal"}
              </button>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Link to="/contact" className="hover:text-primary">Need help?</Link>
                <a href="tel:+233200000000" className="inline-flex items-center gap-1 hover:text-primary">
                  <Phone className="h-3 w-3" /> Emergency
                </a>
              </div>
            </form>

            {role === "student" && hasOnboarded === false && (
              <Link
                to="/onboarding"
                className="group relative mt-5 flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-primary p-4 text-left text-primary-foreground shadow-soft ring-2 ring-primary/40 ring-offset-2 ring-offset-white/40 transition hover:scale-[1.01] active:scale-[.99]"
              >
                <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      New student? Start here
                      <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] uppercase tracking-wide">Required</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/90">
                      Set up your profile in under 2 minutes to access the portal.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            )}

            {role === "student" && hasOnboarded === true && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-2 text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>
                    Welcome back{studentName ? `, ${studentName}` : ""} · profile on this device
                  </span>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-white/80 drop-shadow">
            © {new Date().getFullYear()} SME Hostels. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
