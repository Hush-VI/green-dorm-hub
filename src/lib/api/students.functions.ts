import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ── Schemas ──────────────────────────────────────────────────────────────────

const StudentSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().min(1),
  course: z.string().min(1),
  level: z.string().min(1),
  room_no: z.string().nullable(),
  meter_no: z.string().nullable(),
  phone: z.string().min(1),
  whatsapp: z.string(),
  guardian_name: z.string(),
  guardian_phone: z.string(),
  username: z.string(),
  reg_status: z.enum(["paid", "partial", "unpaid"]),
  reg_paid: z.number().min(0),
  hostel_paid: z.number().min(0),
  check_status: z.enum(["in", "out"]),
  policy_accepted: z.boolean().optional(),
});

// ── Queries ───────────────────────────────────────────────────────────────────

export const getStudents = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("students")
    .select("*")
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
});

export const getStudent = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: student, error } = await db
      .from("students")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error) throw new Error(error.message);
    return student;
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createStudent = createServerFn({ method: "POST" })
  .inputValidator(StudentSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: student, error } = await db
      .from("students")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return student;
  });

export const updateStudent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), patch: StudentSchema.partial() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: student, error } = await db
      .from("students")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return student;
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { error } = await db.from("students").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const checkInStudent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: student, error } = await db
      .from("students")
      .update({
        check_status: "in",
        last_check_in: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return student;
  });

export const checkOutStudent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: student, error } = await db
      .from("students")
      .update({
        check_status: "out",
        last_check_out: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return student;
  });

export const acceptPolicy = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: student, error } = await db
      .from("students")
      .update({
        policy_accepted: true,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return student;
  });
