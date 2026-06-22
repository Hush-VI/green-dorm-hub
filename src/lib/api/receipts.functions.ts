import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

export const submitReceipt = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    student_id: z.string().min(1),
    image_url: z.string().url(),
    amount: z.number().positive().optional(),
    description: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: receipt, error } = await db
      .from("payment_receipts")
      .insert({
        student_id: data.student_id,
        image_url: data.image_url,
        amount: data.amount ?? null,
        description: data.description ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return receipt;
  });

export const getStudentReceipts = createServerFn({ method: "GET" })
  .inputValidator(z.object({ studentId: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: receipts, error } = await db
      .from("payment_receipts")
      .select("*")
      .eq("student_id", data.studentId)
      .order("uploaded_at", { ascending: false });
    if (error) throw new Error(error.message);
    return receipts;
  });

export const getAllReceipts = createServerFn({ method: "GET" })
  .inputValidator(z.object({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    let query = db
      .from("payment_receipts")
      .select("*, students(full_name, id, room_no)")
      .order("uploaded_at", { ascending: false });
    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }
    const { data: receipts, error } = await query;
    if (error) throw new Error(error.message);
    return receipts;
  });

export const reviewReceipt = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string().min(1),
    status: z.enum(["verified", "rejected"]),
    admin_note: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: receipt, error } = await db
      .from("payment_receipts")
      .update({
        status: data.status,
        admin_note: data.admin_note ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return receipt;
  });
