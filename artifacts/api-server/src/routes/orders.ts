import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { sendOrderNotification } from "../lib/email";

const router: IRouter = Router();

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);
  res.json(orders.map(formatOrder));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const items = data.items as Array<{ productId: number; productName: string; price: number; qty: number }>;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      pincode: data.pincode,
      items: items,
      totalAmount: String(totalAmount.toFixed(2)),
      status: "pending",
      upiTransactionId: data.upiTransactionId ?? null,
    })
    .returning();

  // Decrement product stock
  for (const item of items) {
    await db
      .update(productsTable)
      .set({
        qty: Math.max(0, (await db.select().from(productsTable).where(eq(productsTable.id, item.productId)))[0]?.qty - item.qty || 0),
      })
      .where(eq(productsTable.id, item.productId));
  }

  const formatted = formatOrder(order);

  // Fire and forget email notification
  void sendOrderNotification({
    ...formatted,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
  });

  res.status(201).json(formatted);
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    pincode: o.pincode,
    items: o.items as Array<{ productId: number; productName: string; price: number; qty: number }>,
    totalAmount: Number(o.totalAmount),
    status: o.status,
    upiTransactionId: o.upiTransactionId ?? null,
    createdAt: o.createdAt.toISOString(),
  };
}

export default router;
