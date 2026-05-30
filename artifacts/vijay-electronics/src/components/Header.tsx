import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Menu, Phone, MapPin, Search, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

function useAdminToken() {
  // Uses sessionStorage to match auth-context (clears on tab close)
  const token = typeof window !== "undefined" ? sessionStorage.getItem("ve_admin_session") : null;
  return !!token;
}

export function Header() {
  const { totalItems } = useCart();
  const [_, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const isAdmin = useAdminToken();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("ve_admin_session");
    localStorage.removeItem("admin_token"); // clear any legacy key
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All Products" },
    { href: "/products?category=TV", label: "TVs" },
    { href: "/products?category=AC", label: "ACs" },
    { href: "/products?category=Refrigerator", label: "Refrigerators" },
    { href: "/admin", label: "Admin Panel" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-md animate-slide-in-header"
      style={{ background: "linear-gradient(135deg, hsl(225,72%,16%) 0%, hsl(225,72%,22%) 60%, hsl(230,65%,28%) 100%)" }}
    >
      {/* Top bar */}
      <div className="text-xs py-1.5 hidden md:block"
        style={{ background: "hsl(24,100%,48%)", color: "#fff" }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-semibold">
              <MapPin size={11} className="opacity-80" /> Railway Road, Mukerian, Punjab
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Phone size={11} className="opacity-80" /> +91 9876898832
            </span>
          </div>
          <span className="font-semibold tracking-wide">Trusted Electronics Retailer since 1995</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[360px] bg-background">
              <div className="flex items-center gap-2 mb-8 mt-2">
                <span className="font-serif text-2xl font-black">
                  <span style={{ color: "hsl(24,100%,50%)" }}>VIJAY</span>
                  <span className="text-foreground"> ELECTRONICS</span>
                </span>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-semibold px-3 py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <button
                    onClick={handleAdminLogout}
                    className="text-base font-semibold px-3 py-2.5 rounded-lg hover:bg-destructive hover:text-white transition-colors text-left text-destructive flex items-center gap-2 mt-2"
                  >
                    <LogOut size={16} /> Logout Admin
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center font-black text-lg"
              style={{ background: "hsl(24,100%,50%)", color: "#fff" }}
            >
              V
            </div>
            <span className="font-serif text-2xl md:text-3xl font-black tracking-tight leading-none">
              <span style={{ color: "hsl(24,100%,65%)" }}>VIJAY</span>
              <span className="text-white"> ELECTRONICS</span>
            </span>
          </Link>
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-6">
          <form onSubmit={handleSearch} className="w-full relative">
            <Input
              type="search"
              placeholder="Search TVs, ACs, Refrigerators..."
              className="w-full pl-10 pr-4 h-10 rounded-full border-white/20 text-white placeholder:text-white/55 focus-visible:ring-secondary"
              style={{ background: "rgba(255,255,255,0.12)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/55" />
            <button type="submit" className="sr-only">Search</button>
          </form>
        </div>

        {/* Desktop nav + actions */}
        <div className="flex items-center gap-1">
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold mr-2">
            <Link href="/" className="px-3 py-2 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-all">
              Home
            </Link>
            <Link href="/products" className="px-3 py-2 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-all">
              Products
            </Link>
          </nav>

          {/* Mobile search icon */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => {
              const s = prompt("Search products:");
              if (s) setLocation(`/products?search=${encodeURIComponent(s)}`);
            }}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 transition-all">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black animate-badge-bounce"
                  style={{ background: "hsl(24,100%,50%)", color: "#fff" }}
                >
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {/* Admin button */}
          {isAdmin ? (
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Link href="/admin/dashboard">
                <Button
                  size="sm"
                  className="font-bold gap-1.5 text-xs rounded-full px-4 transition-all hover:scale-105"
                  style={{ background: "hsl(24,100%,50%)", color: "#fff", boxShadow: "0 0 0 2px hsl(24,100%,50%/0.4)" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Dashboard
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 text-xs gap-1"
                onClick={handleAdminLogout}
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </div>
          ) : (
            <Link href="/admin" className="hidden md:block ml-2">
              <Button
                size="sm"
                variant="outline"
                className="font-bold gap-1.5 text-xs rounded-full px-4 border-white/30 text-white hover:bg-white/15 hover:border-white/50 transition-all hover:scale-105 admin-btn-ring"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
