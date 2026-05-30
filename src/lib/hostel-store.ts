// Utility functions only — all data now lives in Supabase.
// The mock store and localStorage persistence have been removed.

export type RegStatus = "paid" | "partial" | "unpaid";
export type CheckStatus = "in" | "out";

// Kept for backwards-compat with any remaining imports
export type Student = Record<string, unknown>;
export type Room = Record<string, unknown>;
export type Meter = Record<string, unknown>;
export type Payment = Record<string, unknown>;
export type StoreItem = Record<string, unknown>;
export type Order = Record<string, unknown>;
export type SmsMessage = Record<string, unknown>;
export type Settings = Record<string, unknown>;

export const fmtGHS = (n: number) =>
  `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const fmtTime = (ts?: number) =>
  ts
    ? new Date(ts).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      })
    : "—";

export const fmtDate = (ts?: number) =>
  ts
    ? new Date(ts).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
