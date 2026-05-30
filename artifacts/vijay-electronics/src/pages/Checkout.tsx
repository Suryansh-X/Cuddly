import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { useCreateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Valid 10-digit phone number required").max(10),
  customerAddress: z.string().min(10, "Full address is required"),
  pincode: z.string().min(6, "Valid 6-digit pincode required").max(6),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const STORE_WHATSAPP = "919876898832";

function buildWhatsAppMessage(
  orderId: number,
  formValues: CheckoutFormValues,
  items: Array<{ productId: number; productName: string; price: number; qty: number }>,
  totalPrice: number
): string {
  const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const itemLines = items
    .map(
      (item, i) =>
        `${i + 1}. ${item.productName} x${item.qty} = Rs. ${(item.price * item.qty).toLocaleString("en-IN")}`
    )
    .join("\n");

  return (
    `*NEW ORDER - Vijay Electronics*\n` +
    `Order ID: #${orderId}\n` +
    `Date: ${date}\n\n` +
    `*Customer Details:*\n` +
    `Name: ${formValues.customerName}\n` +
    `Phone: ${formValues.customerPhone}\n` +
    `Email: ${formValues.customerEmail}\n` +
    `Address: ${formValues.customerAddress}\n` +
    `Pincode: ${formValues.pincode}\n\n` +
    `*Items Ordered:*\n` +
    `${itemLines}\n\n` +
    `*Total Amount Paid: Rs. ${totalPrice.toLocaleString("en-IN")}*\n` +
    `UPI ID: 9915649068.eazypay@icici\n\n` +
    `Please confirm this order. Thank you!`
  );
}

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"form" | "payment">("form");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [savedFormValues, setSavedFormValues] = useState<CheckoutFormValues | null>(null);

  const createOrder = useCreateOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      pincode: "",
    },
  });

  if (items.length === 0 && step === "form") {
    setLocation("/cart");
    return null;
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const order = await createOrder.mutateAsync({
        data: {
          ...data,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            qty: item.qty,
          })),
        },
      });

      setCreatedOrderId(order.id);
      setSavedFormValues(data);
      setStep("payment");
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    } catch {
      toast({
        title: "Order Failed",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentComplete = () => {
    if (!createdOrderId || !savedFormValues) return;

    const message = buildWhatsAppMessage(createdOrderId, savedFormValues, items, totalPrice);
    const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;

    clearCart();
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setLocation(`/order/${createdOrderId}`);
  };

  const upiLink = createdOrderId
    ? `upi://pay?pa=9915649068.eazypay@icici&pn=Vijay%20Electronics&am=${totalPrice}&cu=INR&tn=Order-${createdOrderId}`
    : "#";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-black font-serif tracking-tight mb-8 text-center">Checkout</h1>

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-12 max-w-md mx-auto">
        <div className="flex flex-col items-center text-primary">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 bg-primary text-primary-foreground">1</div>
          <span className="text-sm font-medium">Details</span>
        </div>
        <div className={`flex-1 h-1 mx-4 ${step === "payment" ? "bg-primary" : "bg-muted"}`}></div>
        <div className={`flex flex-col items-center ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
          <span className="text-sm font-medium">Payment</span>
        </div>
      </div>

      {step === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" maxLength={10} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="House No, Street, Landmark" className="resize-none" rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="144211" maxLength={6} className="max-w-[200px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 mt-4 shadow-xl shadow-secondary/20"
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? "Processing..." : "Continue to Payment"}{" "}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-primary/10 shadow-lg bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <div className="flex-1 pr-4">
                        <span className="font-medium">{item.qty}x</span>{" "}
                        <span className="text-muted-foreground">{item.productName}</span>
                      </div>
                      <span className="font-medium whitespace-nowrap">
                        Rs. {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="font-bold">Total Pay</span>
                  <span className="text-2xl font-black text-primary">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-white p-3 rounded-lg border">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> Secure SSL Checkout
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-primary text-center overflow-hidden">
            <div className="bg-primary text-primary-foreground py-4 font-bold text-lg flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" /> Pay with UPI
            </div>
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-3xl font-black text-primary mb-2">
                Rs. {totalPrice.toLocaleString()}
              </h2>
              <p className="text-muted-foreground font-medium mb-8">Order ID: #{createdOrderId}</p>

              <div className="bg-white p-6 rounded-2xl border-2 border-dashed inline-block mb-8 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`}
                  alt="UPI QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="bg-muted p-4 rounded-xl text-sm font-medium mb-8 flex flex-col gap-1">
                <span>Scan with GPay, PhonePe, Paytm or any UPI app</span>
                <span className="text-muted-foreground">UPI ID: 9915649068.eazypay@icici</span>
              </div>

              <div className="space-y-4">
                {/* UPI Pay button — visible on all devices */}
                <Button
                  asChild
                  size="lg"
                  className="w-full font-bold h-14 text-base gap-2"
                  style={{ background: "hsl(225,72%,22%)", color: "#fff" }}
                >
                  <a href={upiLink}>
                    <QrCode className="w-5 h-5" />
                    Open UPI App to Pay Now
                  </a>
                </Button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">After paying</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  size="lg"
                  onClick={handlePaymentComplete}
                  className="w-full font-bold h-14 text-base bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  I've Paid — Confirm on WhatsApp
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Click only after completing UPI payment. This sends your order details to the store.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
