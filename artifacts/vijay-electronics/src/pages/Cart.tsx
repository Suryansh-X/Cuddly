import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Cart() {
  const { items, updateQty, removeFromCart, totalPrice, totalItems } = useCart();
  const [_, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-black font-serif tracking-tight mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto font-bold px-8">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-black font-serif tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Link href={`/products/${item.productId}`} className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="object-contain max-h-full max-w-full p-2 hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No Image</span>
                  )}
                </Link>
                
                <div className="flex-1 min-w-0 w-full">
                  <Link href={`/products/${item.productId}`} className="hover:text-primary transition-colors">
                    <h3 className="font-bold text-lg sm:text-xl line-clamp-2 mb-2">{item.productName}</h3>
                  </Link>
                  <div className="text-2xl font-black text-primary mb-4">₹{item.price.toLocaleString()}</div>
                  
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center border-2 rounded-lg overflow-hidden h-10 bg-background w-28">
                      <button 
                        className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="flex-1 text-center font-bold text-sm">{item.qty}</div>
                      <button 
                        className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-2 border-primary/10 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({totalItems})</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="text-3xl font-black text-primary">₹{totalPrice.toLocaleString()}</span>
              </div>
              
              <Button 
                size="lg" 
                className="w-full font-bold text-base h-14 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20"
                onClick={() => setLocation("/checkout")}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Secure checkout. Pay via UPI.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
