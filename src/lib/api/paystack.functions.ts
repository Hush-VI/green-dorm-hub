import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";
import { sendSms } from "../mnotify.server";

// ── Paystack helpers ──────────────────────────────────────────────────────────

import { getEnv } from "../env.server";

function getPaystackKey() {
  const key = getEnv().PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Missing PAYSTACK_SECRET_KEY environment variable.");
  return key;
}

// Initialise a Paystack transaction and return the checkout URL.
export const initPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      studentId: z.string().min(1),
      email: z.string().email(),
      amountGhs: z.number().positive(), // in GHS — we convert to pesewas
      callbackUrl: z.string().url(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getPaystackKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: Math.round(data.amountGhs * 100), // pesewas
        currency: "GHS",
        reference: `REG-${data.studentId}-${Date.now()}`,
        callback_url: data.callbackUrl,
        metadata: { student_id: data.studentId, payment_type: "registration" },
      }),
    });

    const json = (await res.json()) as { status: boolean; data?: { authorization_url: string; reference: string } };
    if (!json.status || !json.data) {
      throw new Error("Paystack initialisation failed");
    }

    return { url: json.data.authorization_url, reference: json.data.reference };
  });

// Verify a Paystack transaction reference, record the payment, and send SMS.
export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ reference: z.string().min(1) }))
  .handler(async ({ data }) => {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, {
      headers: { Authorization: `Bearer ${getPaystackKey()}` },
    });

    const json = (await res.json()) as {
      status: boolean;
      data?: {
        status: string;
        amount: number; // pesewas
        metadata: { student_id: string; payment_type: string };
        reference: string;
      };
    };

    if (!json.status || !json.data) throw new Error("Paystack verification failed");
    if (json.data.status !== "success") throw new Error(`Payment not successful: ${json.data.status}`);

    const { student_id, payment_type } = json.data.metadata;
    const amountGhs = json.data.amount / 100;
    const db = getSupabaseAdmin();

    // Fetch student
    const { data: student, error: stuErr } = await db
      .from("students")
      .select("id, full_name, phone, reg_paid, hostel_paid")
      .eq("id", student_id)
      .single();
    if (stuErr) throw new Error(stuErr.message);

    // Fetch settings for fee totals
    const { data: settings, error: setErr } = await db
      .from("settings")
      .select("registration_fee, hostel_fee, sms_sender_id")
      .eq("id", 1)
      .single();
    if (setErr) throw new Error(setErr.message);

    // Avoid double-recording the same reference
    const { data: existing } = await db
      .from("payments")
      .select("id")
      .eq("id", data.reference)
      .maybeSingle();
    if (existing) return { alreadyRecorded: true, student };

    // Record payment
    await db.from("payments").insert({
      id: data.reference,
      student_id,
      type: payment_type as "registration" | "hostel",
      amount: amountGhs,
      method: "momo", // Paystack in Ghana is typically MoMo/card
      payment_date: new Date().toISOString(),
    });

    // Update student paid amounts
    if (payment_type === "registration") {
      const newPaid = (student.reg_paid ?? 0) + amountGhs;
      const regStatus = newPaid >= settings.registration_fee ? "paid" : "partial";
      await db.from("students").update({ reg_paid: newPaid, reg_status: regStatus, updated_at: new Date().toISOString() }).eq("id", student_id);
    } else {
      const newPaid = (student.hostel_paid ?? 0) + amountGhs;
      await db.from("students").update({ hostel_paid: newPaid, updated_at: new Date().toISOString() }).eq("id", student_id);
    }

    // Send SMS confirmation to student
    const smsBody =
      `SME Hostels: Payment of GHS ${amountGhs.toFixed(2)} received for ${payment_type} fee. ` +
      `Ref: ${data.reference}. Thank you, ${student.full_name.split(" ")[0]}!`;

    await sendSms({ to: student.phone, message: smsBody, senderId: settings.sms_sender_id });

    return { alreadyRecorded: false, student, amountGhs };
  });
