import fs from "fs";
import path from "path";
import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, productsTable, ordersTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_TOKEN = "vijay_admin_token_2024";

// ── Login ──────────────────────────────────────────────────────────
router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "vijay@admin2024";

  if (parsed.data.password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json({ success: true, token: ADMIN_TOKEN });
});

// ── Stats ─────────────────────────────────────────────────────────
router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [productCount] = await db
    .select({ count: count() })
    .from(productsTable);

  const [orderCount] = await db
    .select({ count: count() })
    .from(ordersTable);

  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(cast(total_amount as numeric)), 0)` })
    .from(ordersTable);

  const [pendingResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));

  res.json({
    totalProducts: productCount.count,
    totalOrders: orderCount.count,
    totalRevenue: Number(revenueResult.total),
    pendingOrders: pendingResult.count,
  });
});

// ── Image Upload ───────────────────────────────────────────────────
// Accepts base64 image, saves to /uploads/, returns the public URL
router.post("/admin/upload", async (req, res): Promise<void> => {
  const { base64, mimeType } = req.body as { base64?: string; mimeType?: string };

  if (!base64 || !mimeType) {
    res.status(400).json({ error: "base64 and mimeType are required" });
    return;
  }

  if (!mimeType.startsWith("image/")) {
    res.status(400).json({ error: "Only image files are allowed" });
    return;
  }

  const ext = mimeType === "image/jpeg" ? "jpg"
    : mimeType === "image/png" ? "png"
    : mimeType === "image/webp" ? "webp"
    : mimeType === "image/gif" ? "gif"
    : "jpg";

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "uploads");

  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    const buffer = Buffer.from(base64, "base64");

    if (buffer.length > 5 * 1024 * 1024) {
      res.status(413).json({ error: "Image too large (max 5 MB)" });
      return;
    }

    fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
    res.json({ url: `/api/uploads/${fileName}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to save image" });
  }
});

export default router;
