import nodemailer from "nodemailer";
import { logger } from "./logger";

const ADMIN_EMAIL = "call@suryxnsh.in";
const STORE_NAME = "Vijay Electronics";
const STORE_ADDRESS = "Railway Road Mukerian, Hoshiarpur, Punjab";
const STORE_PHONE = "+91 9876898832";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  qty: number;
}

interface OrderEmailData {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  pincode: string;
  items: OrderItem[];
  totalAmount: string | number;
  status: string;
  upiTransactionId?: string | null;
  createdAt: Date | string;
}

function buildOrderEmailHtml(order: OrderEmailData): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align:center;">${item.qty}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align:right;">Rs. ${Number(item.price).toFixed(2)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align:right;">Rs. ${(Number(item.price) * item.qty).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order - ${STORE_NAME}</title></head>
<body style="font-family: Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 0; background: #f5f5f5;">
  <div style="max-width: 650px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 30px; text-align: center;">
      <h1 style="color: #f5a623; margin: 0; font-size: 28px; letter-spacing: 1px;">${STORE_NAME}</h1>
      <p style="color: #a0aec0; margin: 6px 0 0; font-size: 14px;">${STORE_ADDRESS}</p>
      <p style="color: #a0aec0; margin: 4px 0 0; font-size: 14px;">${STORE_PHONE}</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #0f3460; margin-top: 0; border-bottom: 2px solid #f5a623; padding-bottom: 10px;">
        New Order Received — #${order.id}
      </h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8faff; border-radius: 8px; overflow: hidden;">
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460; width: 40%;">Order Date</td><td style="padding: 8px 16px;">${new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460;">Status</td><td style="padding: 8px 16px; text-transform: capitalize; color: #f5a623; font-weight: bold;">${order.status}</td></tr>
        ${order.upiTransactionId ? `<tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460;">UPI Ref</td><td style="padding: 8px 16px;">${order.upiTransactionId}</td></tr>` : ""}
      </table>

      <h3 style="color: #0f3460; margin-bottom: 12px;">Customer Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8faff; border-radius: 8px; overflow: hidden;">
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460; width: 40%;">Name</td><td style="padding: 8px 16px;">${order.customerName}</td></tr>
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460;">Email</td><td style="padding: 8px 16px;">${order.customerEmail}</td></tr>
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460;">Phone</td><td style="padding: 8px 16px;">${order.customerPhone}</td></tr>
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460;">Address</td><td style="padding: 8px 16px;">${order.customerAddress}</td></tr>
        <tr><td style="padding: 8px 16px; font-weight: bold; color: #0f3460;">Pincode</td><td style="padding: 8px 16px;">${order.pincode}</td></tr>
      </table>

      <h3 style="color: #0f3460; margin-bottom: 12px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
        <thead>
          <tr style="background: #0f3460; color: #fff;">
            <th style="padding: 10px 12px; text-align:left;">Product</th>
            <th style="padding: 10px 12px; text-align:center;">Qty</th>
            <th style="padding: 10px 12px; text-align:right;">Unit Price</th>
            <th style="padding: 10px 12px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
        <tfoot>
          <tr style="background: #f5a623;">
            <td colspan="3" style="padding: 12px; font-weight: bold; font-size: 16px; text-align: right; color: #1a1a2e;">Grand Total:</td>
            <td style="padding: 12px; font-weight: bold; font-size: 16px; text-align: right; color: #1a1a2e;">Rs. ${Number(order.totalAmount).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background: #1a1a2e; color: #a0aec0; padding: 20px; border-radius: 8px; text-align: center; font-size: 13px;">
        <p style="margin: 0 0 4px; color: #f5a623; font-weight: bold;">${STORE_NAME}</p>
        <p style="margin: 0;">${STORE_ADDRESS} | ${STORE_PHONE}</p>
        <p style="margin: 6px 0 0;">UPI: 9915649068.eazypay@icici</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderNotification(order: OrderEmailData): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn("SMTP credentials not configured — skipping email notification");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${STORE_NAME}" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Order #${order.id} — ${order.customerName} — Rs. ${Number(order.totalAmount).toFixed(2)}`,
      html: buildOrderEmailHtml(order),
    });
    logger.info({ orderId: order.id }, "Order notification email sent");
  } catch (err) {
    logger.error({ err, orderId: order.id }, "Failed to send order notification email");
  }
}
