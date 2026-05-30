// SME Hostels — client-side mock data + persistence.
// Single source of truth shared by Student Portal and Admin Portal.
import { useSyncExternalStore } from "react";

export type RegStatus = "paid" | "partial" | "unpaid";
export type CheckStatus = "in" | "out";

export type Student = {
  id: string;            // Student ID, e.g. SME-2024-001
  fullName: string;
  course: string;
  level: string;
  roomNo: string;
  meterNo: string;
  phone: string;
  whatsapp: string;
  guardianName: string;
  guardianPhone: string;
  username: string;
  regStatus: RegStatus;
  regPaid: number;        // GHS
  hostelPaid: number;     // GHS
  checkStatus: CheckStatus;
  lastCheckIn?: number;   // ts
  lastCheckOut?: number;  // ts
  policyAccepted?: boolean;
  acceptedAt?: number;
};

export type Room = { no: string; capacity: number; status: "available" | "full" | "maintenance"; meterNo: string };

export type Meter = { no: string; rooms: string[]; notice?: string };

export type Payment = {
  id: string;             // receipt
  studentId: string;
  type: "registration" | "hostel";
  amount: number;
  date: number;
  method: "bank" | "momo" | "cash";
};

export type StoreItem = {
  id: string; name: string; emoji: string; description: string;
  price: number; unit: string; stock: number; category: string; available: boolean;
};

export type Order = {
  id: string; studentId: string; createdAt: number;
  items: { itemId: string; qty: number }[];
  note?: string;
  total: number;
  status: "pending" | "confirmed" | "ready" | "delivered" | "cancelled";
  unread?: boolean;
};

export type SmsMessage = {
  id: string; sentAt: number; recipients: string; recipientCount: number;
  template?: string; body: string; status: "sent" | "delivered" | "failed";
};

export type Settings = {
  hostelName: string;
  address: string;
  contactPhone: string;
  contactWhatsapp: string;
  email: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  momoNumber: string;
  momoName: string;
  registrationFee: number;
  hostelFee: number;
  smsApiKey: string;
  smsSenderId: string;
  brand: { primary: string; soft: string; mint: string };
};

export type HostelState = {
  currentStudentId: string | null;
  students: Student[];
  rooms: Room[];
  meters: Meter[];
  payments: Payment[];
  storeItems: StoreItem[];
  orders: Order[];
  sms: SmsMessage[];
  settings: Settings;
};

const KEY = "sme_hostel_state_v2";

function seed(): HostelState {
  const settings: Settings = {
    hostelName: "SME Hostels",
    address: "Behind UCC Science Block, Cape Coast",
    contactPhone: "+233 20 000 0000",
    contactWhatsapp: "+233 20 000 0000",
    email: "hello@smehostels.com",
    bankName: "GCB Bank",
    accountName: "SME Hostels Ltd",
    accountNumber: "1234567890123",
    branch: "Cape Coast Main",
    momoNumber: "0200000000",
    momoName: "SME Hostels",
    registrationFee: 200,
    hostelFee: 4500,
    smsApiKey: "sk_demo_••••••••",
    smsSenderId: "SMEHOSTEL",
    brand: { primary: "#4CAF50", soft: "#66BB6A", mint: "#A5D6A7" },
  };

  const meters: Meter[] = [
    { no: "M-001", rooms: ["A-101", "A-102", "A-103", "A-104"] },
    { no: "M-002", rooms: ["B-201", "B-202", "B-203", "B-204"], notice: "Conserve electricity — bill ran high last month." },
    { no: "M-003", rooms: ["C-301", "C-302", "C-303"] },
    { no: "M-004", rooms: ["C-304", "C-305", "C-306"] },
  ];

  const allRooms = meters.flatMap((m) => m.rooms);
  const rooms: Room[] = allRooms.map((no, i) => ({
    no, capacity: 4,
    status: i % 9 === 0 ? "maintenance" : i % 3 === 0 ? "full" : "available",
    meterNo: meters.find((m) => m.rooms.includes(no))!.no,
  }));

  const seedStudents: Omit<Student, "username" | "whatsapp" | "guardianName" | "guardianPhone" | "level">[] = [
    { id: "SME-2024-001", fullName: "Ama Mensah", course: "BSc Computer Science", roomNo: "A-101", meterNo: "M-001", phone: "+233 24 111 0001", regStatus: "paid", regPaid: 200, hostelPaid: 4500, checkStatus: "in", lastCheckIn: Date.now() - 3 * 3600_000, policyAccepted: true, acceptedAt: Date.now() - 9e7 },
    { id: "SME-2024-002", fullName: "Kojo Asante", course: "BA Economics", roomNo: "B-201", meterNo: "M-002", phone: "+233 24 111 0002", regStatus: "partial", regPaid: 100, hostelPaid: 2000, checkStatus: "out", lastCheckIn: Date.now() - 5 * 86400_000, lastCheckOut: Date.now() - 2 * 86400_000, policyAccepted: true },
    { id: "SME-2024-003", fullName: "Yaa Owusu", course: "BSc Nursing", roomNo: "A-103", meterNo: "M-001", phone: "+233 24 111 0003", regStatus: "paid", regPaid: 200, hostelPaid: 4500, checkStatus: "in", lastCheckIn: Date.now() - 26 * 3600_000, policyAccepted: true },
    { id: "SME-2024-004", fullName: "Akua Frimpong", course: "BSc Biochemistry", roomNo: "B-202", meterNo: "M-002", phone: "+233 24 111 0004", regStatus: "unpaid", regPaid: 0, hostelPaid: 0, checkStatus: "out", policyAccepted: false },
    { id: "SME-2024-005", fullName: "Kwame Boateng", course: "BBA Marketing", roomNo: "C-301", meterNo: "M-003", phone: "+233 24 111 0005", regStatus: "paid", regPaid: 200, hostelPaid: 3000, checkStatus: "in", lastCheckIn: Date.now() - 6 * 3600_000, policyAccepted: true },
    { id: "SME-2024-006", fullName: "Efua Adjei", course: "LLB Law", roomNo: "C-304", meterNo: "M-004", phone: "+233 24 111 0006", regStatus: "paid", regPaid: 200, hostelPaid: 4500, checkStatus: "in", lastCheckIn: Date.now() - 9 * 3600_000, policyAccepted: true },
    { id: "SME-2024-007", fullName: "Selasi Tetteh", course: "BSc Engineering", roomNo: "B-203", meterNo: "M-002", phone: "+233 24 111 0007", regStatus: "partial", regPaid: 100, hostelPaid: 1500, checkStatus: "out", policyAccepted: true },
    { id: "SME-2024-008", fullName: "Naa Korkoi", course: "BA Sociology", roomNo: "A-104", meterNo: "M-001", phone: "+233 24 111 0008", regStatus: "paid", regPaid: 200, hostelPaid: 4500, checkStatus: "in", lastCheckIn: Date.now() - 12 * 3600_000, policyAccepted: true },
    { id: "SME-2024-009", fullName: "Yusif Mohammed", course: "BSc Statistics", roomNo: "C-302", meterNo: "M-003", phone: "+233 24 111 0009", regStatus: "paid", regPaid: 200, hostelPaid: 4500, checkStatus: "in", lastCheckIn: Date.now() - 4 * 3600_000, policyAccepted: true },
    { id: "SME-2024-010", fullName: "Abena Pokuaa", course: "BSc Geology", roomNo: "C-305", meterNo: "M-004", phone: "+233 24 111 0010", regStatus: "unpaid", regPaid: 0, hostelPaid: 0, checkStatus: "out", policyAccepted: false },
  ];

  const students: Student[] = seedStudents.map((s, i) => ({
    ...s,
    level: ["100", "200", "300", "400"][i % 4],
    whatsapp: s.phone,
    guardianName: ["Mr. Mensah", "Mrs. Asante", "Mr. Owusu", "Mrs. Frimpong", "Mr. Boateng", "Mrs. Adjei", "Mr. Tetteh", "Mrs. Korkoi", "Mr. Mohammed", "Mrs. Pokuaa"][i],
    guardianPhone: `+233 27 555 00${(i + 10).toString().padStart(2, "0")}`,
    username: s.fullName.toLowerCase().replace(/\s+/g, ".").slice(0, 20),
  }));

  const payments: Payment[] = [];
  let pCount = 1;
  for (const s of students) {
    if (s.regPaid > 0) payments.push({ id: `R-${(1000 + pCount++).toString()}`, studentId: s.id, type: "registration", amount: s.regPaid, date: Date.now() - Math.random() * 4e9, method: "momo" });
    if (s.hostelPaid > 0) payments.push({ id: `H-${(2000 + pCount++).toString()}`, studentId: s.id, type: "hostel", amount: s.hostelPaid, date: Date.now() - Math.random() * 4e9, method: "bank" });
  }

  const storeItems: StoreItem[] = [
    { id: "i1", name: "Sachet Water (bag)", emoji: "💧", description: "30 sachets, 500ml each", price: 8, unit: "bag", stock: 24, category: "Water", available: true },
    { id: "i2", name: "Bottled Water 1.5L", emoji: "🧴", description: "Voltic mineral", price: 5, unit: "bottle", stock: 60, category: "Water", available: true },
    { id: "i3", name: "Coca-Cola 350ml", emoji: "🥤", description: "Chilled", price: 4, unit: "bottle", stock: 40, category: "Drinks", available: true },
    { id: "i4", name: "Malta Guinness", emoji: "🍺", description: "Non-alcoholic malt", price: 8, unit: "bottle", stock: 18, category: "Drinks", available: true },
    { id: "i5", name: "Indomie Noodles", emoji: "🍜", description: "Onion chicken flavour", price: 6, unit: "pack", stock: 4, category: "Food", available: true },
    { id: "i6", name: "Bread (large)", emoji: "🍞", description: "Sliced sugar bread", price: 12, unit: "loaf", stock: 10, category: "Food", available: true },
    { id: "i7", name: "Toilet Roll", emoji: "🧻", description: "Premier 2-ply", price: 3, unit: "roll", stock: 80, category: "Toiletries", available: true },
    { id: "i8", name: "Bath Soap", emoji: "🧼", description: "Geisha bar", price: 5, unit: "bar", stock: 35, category: "Toiletries", available: true },
    { id: "i9", name: "A4 Notebook", emoji: "📒", description: "200 pages, ruled", price: 15, unit: "book", stock: 22, category: "Stationery", available: true },
    { id: "i10", name: "Ballpoint Pen", emoji: "🖊️", description: "Bic blue", price: 2, unit: "pen", stock: 0, category: "Stationery", available: false },
    { id: "i11", name: "Phone Charger Cable", emoji: "🔌", description: "USB-C 1m", price: 25, unit: "piece", stock: 6, category: "Other", available: true },
    { id: "i12", name: "Mosquito Coil", emoji: "🦟", description: "Pack of 10", price: 7, unit: "pack", stock: 15, category: "Other", available: true },
  ];

  const orders: Order[] = [
    { id: "O-1001", studentId: "SME-2024-001", createdAt: Date.now() - 40 * 60_000, items: [{ itemId: "i1", qty: 2 }, { itemId: "i7", qty: 4 }], total: 28, status: "pending", unread: true, note: "Please bring before 8pm" },
    { id: "O-1002", studentId: "SME-2024-003", createdAt: Date.now() - 4 * 3600_000, items: [{ itemId: "i5", qty: 5 }], total: 30, status: "delivered" },
    { id: "O-1003", studentId: "SME-2024-005", createdAt: Date.now() - 90 * 60_000, items: [{ itemId: "i6", qty: 1 }, { itemId: "i3", qty: 2 }], total: 20, status: "ready", unread: true },
    { id: "O-1004", studentId: "SME-2024-008", createdAt: Date.now() - 26 * 3600_000, items: [{ itemId: "i9", qty: 1 }], total: 15, status: "confirmed" },
  ];

  const sms: SmsMessage[] = [
    { id: "s1", sentAt: Date.now() - 2 * 86400_000, recipients: "All Students", recipientCount: 10, template: "Payment Reminder", body: "Kindly settle outstanding hostel fees by Friday.", status: "delivered" },
    { id: "s2", sentAt: Date.now() - 5 * 86400_000, recipients: "Meter M-002", recipientCount: 4, template: "Meter Notice", body: "Please conserve electricity — bill ran high last month.", status: "delivered" },
    { id: "s3", sentAt: Date.now() - 10 * 86400_000, recipients: "Unpaid Reg.", recipientCount: 2, body: "Registration fee outstanding. See portal for payment details.", status: "sent" },
  ];

  return { currentStudentId: "SME-2024-001", students, rooms, meters, payments, storeItems, orders, sms, settings };
}

function load(): HostelState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seed();
  }
}

let state: HostelState = load();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }
  listeners.forEach((l) => l());
}

export function setState(patch: Partial<HostelState> | ((s: HostelState) => Partial<HostelState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
}

export function getState() { return state; }

export function useHostel<T>(selector: (s: HostelState) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => selector(state),
    () => selector(state),
  );
}

// --- Actions ---
export const actions = {
  setCurrentStudent(id: string | null) { setState({ currentStudentId: id }); },
  acceptPolicy(studentId: string) {
    setState((s) => ({ students: s.students.map((st) => st.id === studentId ? { ...st, policyAccepted: true, acceptedAt: Date.now() } : st) }));
  },
  checkIn(studentId: string) {
    setState((s) => ({ students: s.students.map((st) => st.id === studentId ? { ...st, checkStatus: "in", lastCheckIn: Date.now() } : st) }));
  },
  checkOut(studentId: string) {
    setState((s) => ({ students: s.students.map((st) => st.id === studentId ? { ...st, checkStatus: "out", lastCheckOut: Date.now() } : st) }));
  },
  updateStudent(id: string, patch: Partial<Student>) {
    setState((s) => ({ students: s.students.map((st) => st.id === id ? { ...st, ...patch } : st) }));
  },
  addStudent(st: Student) { setState((s) => ({ students: [...s.students, st] })); },
  removeStudent(id: string) { setState((s) => ({ students: s.students.filter((st) => st.id !== id) })); },
  recordPayment(p: Payment) {
    setState((s) => ({
      payments: [p, ...s.payments],
      students: s.students.map((st) => {
        if (st.id !== p.studentId) return st;
        if (p.type === "registration") {
          const np = st.regPaid + p.amount;
          return { ...st, regPaid: np, regStatus: np >= s.settings.registrationFee ? "paid" : "partial" };
        }
        return { ...st, hostelPaid: st.hostelPaid + p.amount };
      }),
    }));
  },
  addRoom(r: Room) { setState((s) => ({ rooms: [...s.rooms, r] })); },
  updateRoom(no: string, patch: Partial<Room>) {
    setState((s) => ({ rooms: s.rooms.map((r) => r.no === no ? { ...r, ...patch } : r) }));
  },
  removeRoom(no: string) { setState((s) => ({ rooms: s.rooms.filter((r) => r.no !== no) })); },
  addMeter(m: Meter) { setState((s) => ({ meters: [...s.meters, m] })); },
  updateMeter(no: string, patch: Partial<Meter>) {
    setState((s) => ({ meters: s.meters.map((m) => m.no === no ? { ...m, ...patch } : m) }));
  },
  removeMeter(no: string) { setState((s) => ({ meters: s.meters.filter((m) => m.no !== no) })); },
  addItem(it: StoreItem) { setState((s) => ({ storeItems: [...s.storeItems, it] })); },
  updateItem(id: string, patch: Partial<StoreItem>) {
    setState((s) => ({ storeItems: s.storeItems.map((i) => i.id === id ? { ...i, ...patch } : i) }));
  },
  removeItem(id: string) { setState((s) => ({ storeItems: s.storeItems.filter((i) => i.id !== id) })); },
  placeOrder(o: Order) {
    setState((s) => ({
      orders: [o, ...s.orders],
      storeItems: s.storeItems.map((it) => {
        const line = o.items.find((l) => l.itemId === it.id);
        return line ? { ...it, stock: Math.max(0, it.stock - line.qty) } : it;
      }),
    }));
  },
  setOrderStatus(id: string, status: Order["status"]) {
    setState((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status, unread: false } : o) }));
  },
  markOrderRead(id: string) {
    setState((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, unread: false } : o) }));
  },
  sendSms(msg: SmsMessage) { setState((s) => ({ sms: [msg, ...s.sms] })); },
  updateSettings(patch: Partial<Settings>) {
    setState((s) => ({ settings: { ...s.settings, ...patch } }));
  },
  reset() { state = seed(); emit(); },
};

// Helpers
export const fmtGHS = (n: number) => `GHS ${n.toLocaleString()}`;
export const fmtTime = (ts?: number) => ts ? new Date(ts).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : "—";
export const fmtDate = (ts?: number) => ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const initials = (name: string) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
