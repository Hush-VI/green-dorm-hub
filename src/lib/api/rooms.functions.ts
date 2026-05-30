import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

const RoomSchema = z.object({
  no: z.string().min(1),
  capacity: z.number().int().min(1),
  status: z.enum(["available", "full", "maintenance"]),
  meter_no: z.string().nullable(),
});

const MeterSchema = z.object({
  no: z.string().min(1),
  notice: z.string().nullable(),
});

// ── Rooms ─────────────────────────────────────────────────────────────────────

export const getRooms = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("rooms").select("*").order("no");
  if (error) throw new Error(error.message);
  return data;
});

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator(RoomSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: room, error } = await db
      .from("rooms")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return room;
  });

export const updateRoom = createServerFn({ method: "POST" })
  .inputValidator(z.object({ no: z.string(), patch: RoomSchema.partial() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: room, error } = await db
      .from("rooms")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("no", data.no)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return room;
  });

export const deleteRoom = createServerFn({ method: "POST" })
  .inputValidator(z.object({ no: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { error } = await db.from("rooms").delete().eq("no", data.no);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Meters ────────────────────────────────────────────────────────────────────

export const getMeters = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  // Fetch meters with their associated rooms
  const [metersRes, roomsRes] = await Promise.all([
    db.from("meters").select("*").order("no"),
    db.from("rooms").select("no, meter_no"),
  ]);

  if (metersRes.error) throw new Error(metersRes.error.message);
  if (roomsRes.error) throw new Error(roomsRes.error.message);

  // Attach rooms array to each meter
  return metersRes.data.map((m) => ({
    ...m,
    rooms: roomsRes.data.filter((r) => r.meter_no === m.no).map((r) => r.no),
  }));
});

export const createMeter = createServerFn({ method: "POST" })
  .inputValidator(MeterSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: meter, error } = await db
      .from("meters")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return meter;
  });

export const updateMeter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ no: z.string(), patch: MeterSchema.partial() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: meter, error } = await db
      .from("meters")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("no", data.no)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return meter;
  });

export const deleteMeter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ no: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { error } = await db.from("meters").delete().eq("no", data.no);
    if (error) throw new Error(error.message);
    return { success: true };
  });
