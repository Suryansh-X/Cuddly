import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  useGetAdminStats,
  useListProducts,
  useListOrders,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateOrderStatus,
  getListProductsQueryKey,
  getListOrdersQueryKey,
  getGetAdminStatsQueryKey,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LogOut, Package, ShoppingBag, IndianRupee, Clock,
  Plus, Edit, Trash2, ChevronDown, ChevronUp, Home as HomeIcon,
  RefreshCw, Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const productSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price required"),
  mrp: z.coerce.number().optional(),
  category: z.string().min(1, "Category required"),
  brand: z.string().optional(),
  imageUrl: z.string().optional(),
  qty: z.coerce.number().min(0),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  specs: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ── Image Upload Helper ────────────────────────────────────────────
function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5 MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, mimeType: file.type }),
        });
        if (!res.ok) throw new Error("Upload failed");
        const json = await res.json() as { url: string };
        setPreview(json.url);
        onChange(json.url);
      } catch {
        // Fallback to base64 data URL if upload fails
        setPreview(dataUrl);
        onChange(dataUrl);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {/* Preview box */}
        <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/50 shrink-0 overflow-hidden">
          {preview
            ? <img src={preview} alt="Product" className="w-full h-full object-cover rounded-xl" />
            : <Package className="w-7 h-7 text-muted-foreground/40" />
          }
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm"
              className="gap-1.5 text-xs font-semibold"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : preview ? "Change Photo" : "Upload Photo"}
            </Button>
            {preview && (
              <Button type="button" variant="ghost" size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={() => { setPreview(""); onChange(""); }}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5 MB</p>
          {/* Manual URL fallback */}
          <Input
            placeholder="Or paste image URL..."
            value={preview}
            className="h-8 text-xs"
            onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

const CATEGORIES = ["TV", "AC", "Refrigerator", "Washing Machine", "Fan", "Cooler", "Small Appliance", "Other"];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped:    "bg-purple-100 text-purple-800 border-purple-200",
  delivered:  "bg-green-100 text-green-800 border-green-200",
  cancelled:  "bg-red-100 text-red-800 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
}

export function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auth guard — only redirect on mount if not authenticated
  // Using [] dependency intentionally to avoid race conditions with login flow
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useGetAdminStats({
    query: { enabled: isAuthenticated },
  });
  const { data: products, isLoading: isProductsLoading } = useListProducts(undefined, {
    query: { enabled: isAuthenticated },
  });
  const { data: orders, isLoading: isOrdersLoading } = useListOrders({
    query: { enabled: isAuthenticated },
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, mrp: 0, category: "TV",
      brand: "", imageUrl: "", qty: 10, available: true, featured: false, specs: "",
    },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description ?? "",
        price: editingProduct.price,
        mrp: editingProduct.mrp ?? undefined,
        category: editingProduct.category,
        brand: editingProduct.brand ?? "",
        imageUrl: editingProduct.imageUrl ?? "",
        qty: editingProduct.qty,
        available: editingProduct.available,
        featured: editingProduct.featured ?? false,
        specs: editingProduct.specs ?? "",
      });
    } else {
      form.reset({
        name: "", description: "", price: 0, mrp: undefined, category: "TV",
        brand: "", imageUrl: "", qty: 10, available: true, featured: false, specs: "",
      });
    }
  }, [editingProduct, form]);

  if (!isAuthenticated) return null;

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  };

  const closeModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
  };

  const onProductSubmit = async (data: ProductFormValues) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        mrp: data.mrp || undefined,
        category: data.category,
        brand: data.brand || undefined,
        imageUrl: data.imageUrl || undefined,
        qty: data.qty,
        available: data.available,
        featured: data.featured,
        specs: data.specs || undefined,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: payload });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast({ title: "Product added successfully" });
      }
      closeModal();
      invalidateAll();
    } catch {
      toast({ title: "Error saving product", description: "Please check all fields and try again.", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct.mutateAsync({ id });
      toast({ title: "Product deleted" });
      invalidateAll();
    } catch {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id, data: { status } });
      toast({ title: `Order #${id} → ${status}` });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="min-h-screen pb-16" style={{ background: "hsl(36,20%,97%)" }}>

      {/* Admin Top Bar */}
      <header style={{ background: "linear-gradient(135deg, hsl(225,72%,14%) 0%, hsl(225,72%,22%) 100%)" }}
        className="sticky top-0 z-20 shadow-lg"
      >
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: "hsl(24,100%,50%)", color: "#fff" }}>V</div>
            <div>
              <span className="font-serif font-black tracking-tight text-white text-lg leading-none">
                VIJAY <span style={{ color: "hsl(24,100%,65%)" }}>ADMIN</span>
              </span>
              <p className="text-white/50 text-xs leading-none mt-0.5">Management Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => invalidateAll()}
              className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
                <HomeIcon className="w-3.5 h-3.5" /> Store
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}
              className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats?.totalProducts, icon: <Package className="w-6 h-6" />, color: "blue", loading: isStatsLoading },
            { label: "Total Orders",   value: stats?.totalOrders,   icon: <ShoppingBag className="w-6 h-6" />, color: "green", loading: isStatsLoading },
            { label: "Total Revenue",  value: stats ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : null, icon: <IndianRupee className="w-6 h-6" />, color: "amber", loading: isStatsLoading },
            { label: "Pending Orders", value: stats?.pendingOrders, icon: <Clock className="w-6 h-6" />, color: "orange", loading: isStatsLoading },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-${s.color}-100 text-${s.color}-600`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground truncate">{s.label}</p>
                {s.loading
                  ? <Skeleton className="h-7 w-16 mt-1" />
                  : <p className="text-2xl font-black truncate">{s.value ?? 0}</p>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <Tabs defaultValue="products">
            <div className="px-6 pt-5 border-b">
              <TabsList className="grid w-full max-w-xs grid-cols-2 h-10">
                <TabsTrigger value="products" className="font-bold text-sm">Products</TabsTrigger>
                <TabsTrigger value="orders"   className="font-bold text-sm">Orders</TabsTrigger>
              </TabsList>
            </div>

            {/* ── PRODUCTS TAB ── */}
            <TabsContent value="products" className="m-0">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Manage Products</h2>
                  <p className="text-xs text-muted-foreground">{products?.length ?? 0} products in catalog</p>
                </div>
                <Button onClick={openAddModal}
                  className="font-bold gap-2 rounded-full px-5"
                  style={{ background: "hsl(24,100%,50%)", color: "#fff" }}>
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-14 pl-6">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isProductsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-6"><Skeleton className="w-10 h-10 rounded-lg" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : products?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                          No products yet. Click "Add Product" to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products?.map((p) => (
                        <TableRow key={p.id} className="hover:bg-muted/20">
                          <TableCell className="pl-6">
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center border">
                              {p.imageUrl
                                ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                : <Package className="w-5 h-5 text-muted-foreground" />
                              }
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold max-w-[180px]">
                            <div className="truncate" title={p.name}>{p.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-semibold">{p.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.brand ?? "—"}</TableCell>
                          <TableCell className="text-right font-bold" style={{ color: "hsl(225,72%,22%)" }}>
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground line-through">
                            {p.mrp ? `₹${Number(p.mrp).toLocaleString("en-IN")}` : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold text-sm ${p.qty < 5 ? "text-red-600" : "text-green-700"}`}>{p.qty}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col gap-1 items-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {p.available ? "Active" : "Hidden"}
                              </span>
                              {p.featured && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ background: "hsl(24,100%,12%)", color: "hsl(24,100%,65%)" }}>
                                  Featured
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => openEditModal(p)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteProduct(p.id, p.name)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ── ORDERS TAB ── */}
            <TabsContent value="orders" className="m-0">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">All Orders</h2>
                  <p className="text-xs text-muted-foreground">{orders?.length ?? 0} total orders</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Click a row to expand details</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-6">Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrdersLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((__, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : orders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                          No orders yet. They'll appear here once customers start ordering.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders?.map((o) => (
                        <React.Fragment key={o.id}>
                          <TableRow
                            className={`cursor-pointer transition-colors ${expandedOrder === o.id ? "bg-blue-50/60" : "hover:bg-muted/20"}`}
                            onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                          >
                            <TableCell className="pl-6 font-mono font-bold text-sm" style={{ color: "hsl(225,72%,28%)" }}>
                              #{o.id}
                            </TableCell>
                            <TableCell className="font-semibold">{o.customerName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{o.customerPhone}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                            </TableCell>
                            <TableCell className="text-right font-black" style={{ color: "hsl(225,72%,22%)" }}>
                              ₹{Number(o.totalAmount).toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(o.createdAt), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select defaultValue={o.status} onValueChange={(v) => handleStatusChange(o.id, v)}>
                                <SelectTrigger className="w-[130px] h-8 text-xs font-bold border-0 bg-transparent focus:ring-0 p-0">
                                  <StatusBadge status={o.status} />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      <StatusBadge status={s} />
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                              <Button variant="ghost" size="icon" className="w-7 h-7">
                                {expandedOrder === o.id
                                  ? <ChevronUp className="w-4 h-4" />
                                  : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>

                          {expandedOrder === o.id && (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={8} className="p-0 border-b-2" style={{ borderColor: "hsl(225,72%,22%,0.15)" }}>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/40">

                                  {/* Customer Details */}
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Customer Details</h4>
                                    <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
                                      <div className="flex gap-2"><span className="font-semibold text-muted-foreground w-24 shrink-0">Name</span><span className="font-bold">{o.customerName}</span></div>
                                      <div className="flex gap-2"><span className="font-semibold text-muted-foreground w-24 shrink-0">Phone</span><span>{o.customerPhone}</span></div>
                                      <div className="flex gap-2"><span className="font-semibold text-muted-foreground w-24 shrink-0">Email</span><span className="break-all">{o.customerEmail}</span></div>
                                      <div className="flex gap-2"><span className="font-semibold text-muted-foreground w-24 shrink-0">Address</span><span>{o.customerAddress}</span></div>
                                      <div className="flex gap-2"><span className="font-semibold text-muted-foreground w-24 shrink-0">Pincode</span><span>{o.pincode}</span></div>
                                      {o.upiTransactionId && (
                                        <div className="flex gap-2"><span className="font-semibold text-muted-foreground w-24 shrink-0">UPI Ref</span><span className="font-mono text-xs">{o.upiTransactionId}</span></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Order Items</h4>
                                    <div className="bg-white rounded-xl border overflow-hidden text-sm">
                                      <table className="w-full">
                                        <thead style={{ background: "hsl(225,72%,22%)", color: "#fff" }}>
                                          <tr>
                                            <th className="px-4 py-2.5 text-left font-semibold text-xs">Product</th>
                                            <th className="px-4 py-2.5 text-center font-semibold text-xs">Qty</th>
                                            <th className="px-4 py-2.5 text-right font-semibold text-xs">Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {o.items.map((item, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                              <td className="px-4 py-2.5 font-medium">{item.productName}</td>
                                              <td className="px-4 py-2.5 text-center text-muted-foreground">{item.qty}</td>
                                              <td className="px-4 py-2.5 text-right font-bold">
                                                ₹{(item.price * item.qty).toLocaleString("en-IN")}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot style={{ background: "hsl(24,100%,50%)", color: "#fff" }}>
                                          <tr>
                                            <td colSpan={2} className="px-4 py-2.5 font-bold text-sm">Total</td>
                                            <td className="px-4 py-2.5 text-right font-black">
                                              ₹{Number(o.totalAmount).toLocaleString("en-IN")}
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>

                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={(open) => { if (!open) closeModal(); else setIsProductModalOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-black">
              {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProductSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl><Input placeholder="e.g. Samsung 55&quot; 4K Smart TV" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl><Input placeholder="e.g. Samsung, LG, Voltas" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (₹) *</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="mrp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP / Strike Price (₹)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="Optional" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="qty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <ImageUploader value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="col-span-2 flex flex-wrap gap-6 p-4 bg-muted/40 rounded-xl border">
                  <FormField control={form.control} name="available" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer">Visible on store</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="featured" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer">Featured on homepage</FormLabel>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Short Description</FormLabel>
                    <FormControl><Textarea rows={2} placeholder="Brief product description..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="specs" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Technical Specifications</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder={"Display: 55&quot; 4K UHD\nResolution: 3840x2160\nSmart TV: Yes\nHDMI Ports: 3"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                <Button type="submit" className="flex-1 font-bold" disabled={isSaving}
                  style={{ background: "hsl(24,100%,50%)", color: "#fff" }}>
                  {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
