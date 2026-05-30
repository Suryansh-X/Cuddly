import { Router, type IRouter } from "express";
import { eq, sql, and, like } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
  GetProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .limit(12);
  res.json(products.map(formatProduct));
});

router.get("/products/categories", async (_req, res): Promise<void> => {
  const cats = await db
    .select({
      category: productsTable.category,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(productsTable.category);
  res.json(cats);
});

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, available, search } = parsed.data;

  let query = db.select().from(productsTable).$dynamic();

  const conditions = [];
  if (category) conditions.push(eq(productsTable.category, category));
  if (available !== undefined) conditions.push(eq(productsTable.available, available));
  if (search) conditions.push(like(productsTable.name, `%${search}%`));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const products = await query.orderBy(productsTable.createdAt);
  res.json(products.map(formatProduct));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [product] = await db
    .insert(productsTable)
    .values({
      name: data.name,
      description: data.description ?? null,
      price: String(data.price),
      mrp: data.mrp != null ? String(data.mrp) : null,
      category: data.category,
      brand: data.brand ?? null,
      imageUrl: data.imageUrl ?? null,
      qty: data.qty,
      available: data.available ?? true,
      featured: data.featured ?? false,
      specs: data.specs ?? null,
    })
    .returning();

  res.status(201).json(formatProduct(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.mrp !== undefined) updateData.mrp = data.mrp != null ? String(data.mrp) : null;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.qty !== undefined) updateData.qty = data.qty;
  if (data.available !== undefined) updateData.available = data.available;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.specs !== undefined) updateData.specs = data.specs;

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price: Number(p.price),
    mrp: p.mrp != null ? Number(p.mrp) : null,
    category: p.category,
    brand: p.brand ?? null,
    imageUrl: p.imageUrl ?? null,
    qty: p.qty,
    available: p.available,
    featured: p.featured,
    specs: p.specs ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
