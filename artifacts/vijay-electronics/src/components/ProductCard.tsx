import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      qty: 1,
      imageUrl: product.imageUrl,
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const hasDiscount = product.mrp && product.mrp > product.price;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full flex flex-col hover-elevate transition-all duration-300 group overflow-hidden border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="object-contain max-h-full max-w-full transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              {Math.round(((product.mrp! - product.price) / product.mrp!) * 100)}% OFF
            </div>
          )}
          {!product.available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-black text-white px-4 py-2 font-bold rotate-[-15deg] uppercase tracking-widest text-lg border-2 border-white">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <div className="text-xs text-muted-foreground mb-1 font-medium tracking-wide uppercase">{product.category}</div>
          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-black text-secondary">₹{product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">₹{product.mrp?.toLocaleString()}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full gap-2 font-bold" 
            onClick={handleAddToCart}
            disabled={!product.available}
            variant={product.available ? "default" : "secondary"}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.available ? "Add to Cart" : "Out of Stock"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
