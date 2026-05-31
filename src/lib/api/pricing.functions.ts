import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

export const getRoomPricing = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("room_pricing")
    .select("*")
    .order("capacity");
  if (error) throw new Error(error.message);
  return data;
});

export const upsertRoomPricing = createServerFn({ method: "POST" })
  .inputValidator(
    z.array(z.object({ capacity: z.number().int().positive(), hostel_fee: z.number().min(0) }))
  )
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("room_pricing")
      .upsert(data.map((r) => ({ ...r, updated_at: new Date().toISOString() })));
    if (error) throw new Error(error.message);
    return { success: true };
  });

// Get the hostel fee for a specific room (looks up room capacity → pricing tier)
export const getHostelFeeForRoom = createServerFn({ method: "GET" })
  .inputValidator(z.object({ roomNo: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();

    const { data: room } = await db
      .from("rooms")
      .select("capacity")
      .eq("no", data.roomNo)
      .single();

    if (!room) return { hostelFee: 0, capacity: 0 };

    const { data: pricing } = await db
      .from("room_pricing")
      .select("hostel_fee")
      .eq("capacity", room.capacity)
      .maybeSingle();

    // Fall back to settings.hostel_fee if no pricing tier found
    if (!pricing) {
      const { data: settings } = await db
        .from("settings")
        .select("hostel_fee")
        .eq("id", 1)
        .single();
      return { hostelFee: settings?.hostel_fee ?? 0, capacity: room.capacity };
    }

    return { hostelFee: pricing.hostel_fee, capacity: room.capacity };
  });
