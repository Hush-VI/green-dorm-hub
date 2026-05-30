import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";
import { sendBulkSms } from "../mnotify.server";

const SendSmsSchema = z.object({
  // Who to send to — pass an array of phone numbers
  phones: z.array(z.string().min(1)).min(1),
  // Human-readable label for the log, e.g. "All Students" or "Meter M-002"
  recipientsLabel: z.string().min(1),
  message: z.string().min(1).max(160),
  template: z.string().optional(),
});

export const getSmsMessages = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("sms_messages")
    .select("*")
    .order("sent_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});

export const sendSmsToStudents = createServerFn({ method: "POST" })
  .inputValidator(SendSmsSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();

    // Send via mNotify
    const result = await sendBulkSms(data.phones, data.message);

    const status = result.success ? "sent" : "failed";

    // Log to database regardless of outcome
    const { data: logged, error } = await db
      .from("sms_messages")
      .insert({
        recipients: data.recipientsLabel,
        recipient_count: data.phones.length,
        template: data.template ?? null,
        body: data.message,
        status,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (!result.success) {
      // Return the log entry but surface the error so the UI can show it
      return { ...logged, mnotifyError: result.error };
    }

    return logged;
  });

// Convenience: resolve recipient phones from a group label
export const resolveSmsRecipients = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      // "all" | "checked_in" | "unpaid_reg" | "unpaid_hostel" | "meter:<no>"
      group: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();

    let query = db.from("students").select("id, full_name, phone, check_status, reg_status, hostel_paid, meter_no");

    if (data.group === "checked_in") {
      query = query.eq("check_status", "in");
    } else if (data.group === "unpaid_reg") {
      query = query.neq("reg_status", "paid");
    } else if (data.group === "unpaid_hostel") {
      // Will filter in JS since we need settings.hostel_fee
      // For now return all and let the caller filter
    } else if (data.group.startsWith("meter:")) {
      const meterNo = data.group.replace("meter:", "");
      query = query.eq("meter_no", meterNo);
    }
    // "all" — no extra filter

    const { data: students, error } = await query;
    if (error) throw new Error(error.message);

    return students.map((s) => ({
      id: s.id,
      name: s.full_name,
      phone: s.phone,
    }));
  });
