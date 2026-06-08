import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, CreditCard, BookOpen, ShoppingBag,
  Zap, Phone, LogOut, ChevronRight, CheckCircle2,
  AlertTriangle, DoorOpen, User,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import building from "@/assets/building.jpg";
import { useStudent, useSettings } from "@/lib/queries";
import { initials } from "@/lib/hostel-store";

export const Route = createFileRoute("/student-home")({
  head: () => ({ meta: [{ title: "My Account — SME Hostels" }] }),
  component: StudentHome,
});

function getCurrentStudentId(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("sme_student_id") ?? "";
}

function StudentHome() {
  const navigate = useNavigate();
  const currentId = getCurrentStudentId();
  const { data: student, isLoading } = useStudent(currentId);
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!currentId) navigate({ to: "/" });
  }, [currentId]);

  useEffect(() => {
    if (!isLoading && currentId && !student) {
      sessionStorage.removeItem("sme_student_id");
      navigate({ to: "/" });
    }
  }, [isLoading, student, currentId]);

  function signOut() {
    sessionStorage.removeItem("sme_student_id");
    localStorage.removeItem("sme_student_profile");
    navigate({ to: "/" });
  }

  const regStatus = student?.reg_status ?? "unpaid";
  const regFee = settings?.registration_fee ?? 100;
  const regPending = regStatus !== "paid";

  // All icons use primary colour — amber is reserved for warning badges only
  const sections = [
    {
      icon: LayoutDashboard,
      label: "Student Dashboard",
      description: "Check-in status, room details and activity history",
      to: "/portal" as const,
    },
    {
      icon: CreditCard,
      label: "Fees & Payments",
      description: regPending
        ? `GHS ${regFee.toLocaleString()} registration fee outstanding`
        : "Your registration fee has been settled",
      badge: regPending ? "Pending" : undefined,
      to: "/portal" as const,
    },
    {
      icon: BookOpen,
      label: "Hostel Policy",
      description: "Full guidelines, rules and code of conduct",
      to: "/policy" as const,
    },
    {
      icon: ShoppingBag,
      label: "Hostel Store",
      description: "Order items for delivery — pay on receipt",
      to: "/portal" as const,
    },
    {
      icon: Zap,
      label: "Electricity & Meter",
      description: "View shared meter and log prepaid top-ups",
      to: "/portal" as const,
    },
    {
      icon: Phone,
      label: "Contact & Emergency",
      description: "Management contacts and emergency lines",
      to: "/contact" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── fix: pb-20 so the overlapping card has room below */}
      <div className="relative overflow-hidden bg-gradient-primary pb-20 pt-8">
        <img src={building} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <img src={logo} alt="SME Hostels" className="h-10 w-auto squircle bg-white p-1.5 object-contain shadow-soft" />
            <div className="flex items-center gap-2">
              {student && (
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/15 pl-3 pr-4 py-1.5 text-sm text-white backdrop-blur-md">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-xs font-bold">
                    {initials(student.full_name)}
                  </div>
                  <span className="font-medium">{student.full_name.split(" ")[0]}</span>
                </div>
              )}
              <button onClick={signOut}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-md hover:bg-white/25 transition">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Greeting */}
          <div className="mt-8 text-white">
            <div className="text-xs font-semibold uppercase tracking-widest opacity-70">
              {settings?.hostel_name ?? "SME Hostels"}
            </div>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {student ? `Welcome back, ${student.full_name.split(" ")[0]}` : "Welcome"}
            </h1>
            {student && (
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm opacity-80">
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{student.id}</span>
                <span className="flex items-center gap-1.5"><DoorOpen className="h-3.5 w-3.5" />Room {student.room_no ?? "—"}</span>
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />Meter {student.meter_no ?? "—"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status card — sits below hero with mt-negative to overlap slightly ── */}
      {student && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-10 relative z-10">
          <div className={`rounded-2xl p-4 flex items-start gap-3 shadow-soft ${
            regPending
              ? "bg-amber-50 border border-amber-200"
              : "bg-white border border-primary/20"
          }`}>
            {regPending
              ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              : <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${regPending ? "text-amber-800" : "text-primary"}`}>
                {regPending ? "Registration fee outstanding" : "Account fully active"}
              </div>
              {regPending && (
                <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
                  Pay GHS {regFee.toLocaleString()} to management via bank transfer or MoMo.
                  Use your Student ID as the payment reference.
                </p>
              )}
            </div>
            {regPending && (
              <Link to="/portal"
                className="shrink-0 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition">
                View details
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Section grid ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <p className="text-sm font-semibold text-muted-foreground mb-4">
          Select a section to continue
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link key={s.label} to={s.to}
              className="group relative flex items-start gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-border/50 transition hover:shadow-glass hover:-translate-y-0.5 active:scale-[.98]">
              {/* All icons use primary colour — amber is reserved for badges */}
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  {s.badge && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      {s.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:text-primary group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings?.hostel_name ?? "SME Hostels"}
          {settings?.address ? ` · ${settings.address}` : ""}
        </div>
      </div>
    </div>
  );
}
