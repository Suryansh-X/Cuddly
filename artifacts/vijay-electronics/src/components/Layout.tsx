import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

const WA_NUMBER = "919876898832";
const WA_MESSAGE = "Hi! I visited Vijay Electronics online and would like to know more about your products. Can you help me?";

function WhatsAppButton() {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="wa-float-btn"
    >
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <path
          d="M16 2C8.268 2 2 8.268 2 16c0 2.444.65 4.738 1.787 6.718L2 30l7.473-1.762A13.937 13.937 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
          fill="#fff"
        />
        <path
          d="M22.548 19.13c-.31-.155-1.831-.903-2.115-1.006-.283-.103-.49-.155-.696.155-.206.31-.8 1.006-.98 1.213-.181.207-.361.232-.671.078-.31-.155-1.31-.483-2.494-1.54-.922-.822-1.545-1.836-1.727-2.147-.181-.31-.02-.477.136-.631.14-.139.31-.362.465-.542.155-.18.206-.31.31-.516.103-.207.051-.388-.026-.542-.077-.155-.696-1.677-.954-2.296-.251-.604-.507-.522-.696-.532l-.593-.01c-.206 0-.542.077-.826.388-.283.31-1.08 1.057-1.08 2.577s1.106 2.99 1.26 3.196c.155.207 2.177 3.322 5.274 4.659.737.318 1.312.508 1.76.65.74.236 1.413.203 1.945.123.593-.089 1.831-.748 2.09-1.471.258-.724.258-1.344.18-1.473-.077-.129-.284-.206-.594-.361z"
          fill="#25D366"
        />
      </svg>
      <span className="wa-float-label">Chat with us</span>
      <span className="wa-float-ping" />
    </a>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
