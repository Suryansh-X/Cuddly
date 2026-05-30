import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingCart, CreditCard, ChevronRight, Home as HomeIcon, CheckCircle2, AlertCircle, MapPin, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
      queryKey: getGetProductQueryKey(productId)
    }
  });

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 items-center text-sm">
          <Skeleton className="w-16 h-4" /> <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Skeleton className="w-24 h-4" /> <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="w-full aspect-square rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100) : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      qty,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "Added to Cart",
      description: `${qty}x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setLocation("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground font-medium overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-primary flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-primary">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* 3D Product Image Showcase */}
        <div className="product-3d-card relative w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center bg-gradient-to-tr from-muted/50 to-muted rounded-3xl p-8 overflow-hidden group">
          {/* Ambient light effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="product-3d-card-inner relative w-full h-full flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="product-image-layer object-contain max-h-full max-w-full drop-shadow-2xl"
              />
            ) : (
              <div className="text-muted-foreground font-medium text-lg product-image-layer">No Image Available</div>
            )}
          </div>

          {hasDiscount && (
            <div className="absolute top-6 right-6 bg-destructive text-destructive-foreground font-black px-4 py-2 rounded-full shadow-lg z-10">
              {discountPercent}% OFF
            </div>
          )}
          
          {product.brand && (
            <div className="absolute top-6 left-6 bg-white text-black font-black px-4 py-2 rounded shadow-lg z-10 tracking-widest uppercase text-xs">
              {product.brand}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-primary font-bold tracking-widest uppercase text-xs">{product.category}</span>
            {product.available ? (
              <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock
              </span>
            ) : (
              <span className="flex items-center text-destructive text-xs font-bold bg-destructive/10 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3 mr-1" /> Out of Stock
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl md:text-5xl font-black text-primary">₹{product.price.toLocaleString()}</span>
            {hasDiscount && (
              <div className="flex flex-col pb-1">
                <span className="text-sm text-muted-foreground font-medium">M.R.P.</span>
                <span className="text-lg text-muted-foreground line-through decoration-2">₹{product.mrp?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          <div className="bg-card border rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="space-y-3">
                <Label htmlFor="qty" className="font-bold">Quantity</Label>
                <div className="flex items-center border-2 rounded-lg overflow-hidden h-12 bg-background w-32">
                  <button 
                    className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1 || !product.available}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-bold text-lg">{qty}</div>
                  <button 
                    className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
                    onClick={() => setQty(qty + 1)}
                    disabled={!product.available}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex gap-3 w-full">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-12 font-bold text-base border-2" 
                  onClick={handleAddToCart}
                  disabled={!product.available}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 h-12 font-bold text-base bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                  onClick={handleBuyNow}
                  disabled={!product.available}
                >
                  <CreditCard className="w-5 h-5 mr-2" /> Buy Now
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm font-medium">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-secondary shrink-0" />
              <div>
                <span className="block font-bold text-foreground">1 Year Brand Warranty</span>
                <span className="text-muted-foreground">Original product with manufacturer warranty</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <MapPin className="w-6 h-6 text-secondary shrink-0" />
              <div>
                <span className="block font-bold text-foreground">Available at Store</span>
                <span className="text-muted-foreground">Visit Railway Road, Mukerian to see this product</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specs && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black font-serif tracking-tight mb-6">Technical Specifications</h2>
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <div className="prose prose-slate max-w-none whitespace-pre-wrap">
              {product.specs}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
