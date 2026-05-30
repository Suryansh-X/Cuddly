import { useParams, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Printer, Home as HomeIcon, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const STORE_WHATSAPP = "919876898832";

function buildWhatsAppMessage(order: {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  pincode: string;
  items: Array<{ productName: string; qty: number; price: number }>;
  totalAmount: number;
  createdAt: string;
}): string {
  const date = format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a");

  const itemLines = order.items
    .map(
      (item, i) =>
        `${i + 1}. ${item.productName} x${item.qty} = Rs. ${(item.price * item.qty).toLocaleString("en-IN")}`
    )
    .join("\n");

  return (
    `*NEW ORDER - Vijay Electronics*\n` +
    `Order ID: #${order.id}\n` +
    `Date: ${date}\n\n` +
    `*Customer Details:*\n` +
    `Name: ${order.customerName}\n` +
    `Phone: ${order.customerPhone}\n` +
    `Email: ${order.customerEmail}\n` +
    `Address: ${order.customerAddress}\n` +
    `Pincode: ${order.pincode}\n\n` +
    `*Items Ordered:*\n` +
    `${itemLines}\n\n` +
    `*Total Amount Paid: Rs. ${order.totalAmount.toLocaleString("en-IN")}*\n` +
    `UPI ID: 9915649068.eazypay@icici\n\n` +
    `Please confirm this order. Thank you!`
  );
}

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);

  const { data: order, isLoading, isError } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderQueryKey(orderId),
    },
  });

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-8">We couldn't find the order you're looking for.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <Skeleton className="w-20 h-20 rounded-full mx-auto mb-6" />
        <Skeleton className="h-10 w-2/3 mx-auto mb-12" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const handleWhatsApp = () => {
    const message = buildWhatsAppMessage(order);
    const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Success Hero - Hidden in Print */}
      <div className="text-center mb-12 print:hidden">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black font-serif tracking-tight mb-4 text-green-700">
          Order Successful!
        </h1>
        <p className="text-xl text-muted-foreground">
          Thank you for shopping at Vijay Electronics.
        </p>

        {/* WhatsApp CTA */}
        <div className="mt-8 bg-[#f0fdf4] border-2 border-[#25D366] rounded-2xl p-6 max-w-md mx-auto">
          <p className="font-bold text-gray-800 mb-2 text-base">Send your order details to the store</p>
          <p className="text-sm text-muted-foreground mb-4">
            Tap below to send a prefilled WhatsApp message with your complete order details to Vijay Electronics for confirmation.
          </p>
          <Button
            size="lg"
            onClick={handleWhatsApp}
            className="w-full font-bold h-12 bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Order on WhatsApp
          </Button>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <Button variant="outline" onClick={handlePrint} className="font-bold">
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
          <Button asChild className="font-bold">
            <Link href="/">
              <HomeIcon className="w-4 h-4 mr-2" /> Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white text-black p-8 md:p-12 border shadow-xl rounded-2xl print:border-none print:shadow-none print:rounded-none"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-8 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-black tracking-tight uppercase mb-2">
              VIJAY ELECTRONICS
            </h1>
            <p className="text-sm font-medium">Railway Road, Mukerian</p>
            <p className="text-sm font-medium">Hoshiarpur, Punjab, India</p>
            <p className="text-sm font-medium">Ph: +91 9876898832</p>
          </div>
          <div className="mt-6 sm:mt-0 text-left sm:text-right">
            <h2 className="text-2xl font-bold uppercase text-gray-400 mb-2">TAX INVOICE</h2>
            <p className="font-bold">
              Order ID: <span className="font-mono">#{order.id}</span>
            </p>
            <p className="text-sm">
              Date: {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
            </p>
            <p className="text-sm">
              Status: <span className="uppercase font-bold">{order.status}</span>
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-10">
          <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-3">
            Billed To
          </h3>
          <p className="font-bold text-lg">{order.customerName}</p>
          <p>{order.customerAddress}</p>
          <p>Pincode: {order.pincode}</p>
          <p>Ph: {order.customerPhone}</p>
          <p>{order.customerEmail}</p>
        </div>

        {/* Items Table */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-xs uppercase tracking-wider text-gray-600">
                <th className="py-3 px-2">Item Description</th>
                <th className="py-3 px-2 text-right">Qty</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-4 px-2 font-medium">{item.productName}</td>
                  <td className="py-4 px-2 text-right">{item.qty}</td>
                  <td className="py-4 px-2 text-right">
                    Rs. {item.price.toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-2 text-right font-bold">
                    Rs. {(item.price * item.qty).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3 border-t-2 border-black pt-4">
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span>Rs. {order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Delivery</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>Rs. {order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200 text-sm font-medium text-gray-500">
          <p className="mb-2">Thank you for your business!</p>
          <p>For any queries: <strong>+91 9876898832</strong> · <strong>contact@vijayelectronics.in</strong></p>
          <p className="mt-4 text-xs font-mono">
            Payment UPI: 9915649068.eazypay@icici
          </p>
        </div>
      </div>
    </div>
  );
}
