import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

const StoreItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  emoji: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  unit: z.string().min(1),
  stock: z.number().int().min(0),
  category: z.string().min(1),
  available: z.boolean(),
});

const OrderItemSchema = z.object({
  item_id: z.string(),
  qty: z.number().int().positive(),
});

const PlaceOrderSchema = z.object({
  id: z.string().min(1),
  student_id: z.string().min(1),
  note: z.string().nullable(),
  total: z.number().positive(),
  items: z.array(OrderItemSchema).min(1),
});

// ── Store Items ───────────────────────────────────────────────────────────────

export const getStoreItems = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("store_items")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
});

export const createStoreItem = createServerFn({ method: "POST" })
  .inputValidator(StoreItemSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: item, error } = await db
      .from("store_items")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return item;
  });

export const updateStoreItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), patch: StoreItemSchema.partial() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: item, error } = await db
      .from("store_items")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return item;
  });

export const deleteStoreItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { error } = await db.from("store_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Orders ────────────────────────────────────────────────────────────────────

export const getOrders = createServerFn({ method: "GET" })
  .inputValidator(z.object({ studentId: z.string().optional() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();

    let query = db
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (data.studentId) {
      query = query.eq("student_id", data.studentId);
    }

    const { data: orders, error } = await query;
    if (error) throw new Error(error.message);
    return orders;
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator(PlaceOrderSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();

    // Insert the order
    const { data: order, error: orderErr } = await db
      .from("orders")
      .insert({
        id: data.id,
        student_id: data.student_id,
        note: data.note,
        total: data.total,
        status: "pending",
        unread: true,
      })
      .select()
      .single();

    if (orderErr) throw new Error(orderErr.message);

    // Insert order items
    const orderItems = data.items.map((item) => ({
      id: crypto.randomUUID(),
      order_id: order.id,
      item_id: item.item_id,
      qty: item.qty,
    }));

    const { error: itemsErr } = await db.from("order_items").insert(orderItems);
    if (itemsErr) throw new Error(itemsErr.message);

    // Decrement stock for each item
    for (const item of data.items) {
      const { data: storeItem } = await db
        .from("store_items")
        .select("stock")
        .eq("id", item.item_id)
        .single();

      if (storeItem) {
        await db
          .from("store_items")
          .update({
            stock: Math.max(0, storeItem.stock - item.qty),
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.item_id);
      }
    }

    return { ...order, order_items: orderItems };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(["pending", "confirmed", "ready", "delivered", "cancelled"]),
    }),
  )
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { data: order, error } = await db
      .from("orders")
      .update({
        status: data.status,
        unread: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return order;
  });

export const markOrderRead = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("orders")
      .update({ unread: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
