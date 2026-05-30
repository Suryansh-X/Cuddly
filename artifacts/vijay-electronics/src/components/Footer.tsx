import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-12 pb-8 border-t-4 border-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold tracking-tight text-secondary">
                VIJAY <span className="text-white">ELECTRONICS</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 max-w-xs text-sm">
              Your trusted neighborhood electronics retailer in Mukerian. Providing genuine appliances and exceptional service since 1995.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-secondary">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/products" className="hover:text-secondary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=TV" className="hover:text-secondary transition-colors">Televisions</Link></li>
              <li><Link href="/products?category=AC" className="hover:text-secondary transition-colors">Air Conditioners</Link></li>
              <li><Link href="/products?category=Refrigerator" className="hover:text-secondary transition-colors">Refrigerators</Link></li>
              <li><Link href="/products?category=Washing Machine" className="hover:text-secondary transition-colors">Washing Machines</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-secondary">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>Railway Road<br/>Mukerian, Hoshiarpur<br/>Punjab, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>+91 9876898832</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>contact@vijayelectronics.in</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-secondary">Store Hours</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <p className="font-medium text-white">Monday - Saturday</p>
                  <p>9:30 AM - 8:30 PM</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <p className="font-medium text-white">Sunday</p>
                  <p>10:00 AM - 6:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Vijay Electronics, Mukerian. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
