import { useListFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ShieldCheck, Zap, ThumbsUp, Wrench, MapPin, Phone,
  Tv, Wind, Refrigerator, WashingMachine
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string }> = {
  "TV":              { emoji: "📺", color: "hsl(225,72%,22%)", bg: "hsl(225,72%,95%)" },
  "AC":              { emoji: "❄️", color: "hsl(195,80%,25%)", bg: "hsl(195,80%,94%)" },
  "Refrigerator":    { emoji: "🧊", color: "hsl(210,70%,28%)", bg: "hsl(210,70%,94%)" },
  "Washing Machine": { emoji: "🌀", color: "hsl(250,60%,35%)", bg: "hsl(250,60%,94%)" },
  "Fan":             { emoji: "💨", color: "hsl(180,70%,25%)", bg: "hsl(180,70%,93%)" },
  "Cooler":          { emoji: "🌬️", color: "hsl(200,75%,25%)", bg: "hsl(200,75%,94%)" },
  "Small Appliance": { emoji: "⚡", color: "hsl(24,100%,40%)", bg: "hsl(24,100%,94%)" },
  "Other":           { emoji: "🔌", color: "hsl(220,20%,35%)", bg: "hsl(220,20%,94%)" },
};

export function Home() {
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useListFeaturedProducts();
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();

  return (
    <div className="flex flex-col min-h-screen">

      {/* ══════════════ HERO ══════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{
          background: "linear-gradient(135deg, hsl(225,72%,14%) 0%, hsl(225,72%,22%) 50%, hsl(230,60%,30%) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(24,100%,55%) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, hsl(24,100%,55%) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(hsl(24,100%,60%) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm mb-6 animate-fade-in-down border"
              style={{ background: "hsl(24,100%,50%/0.2)", borderColor: "hsl(24,100%,50%/0.4)", color: "hsl(24,100%,72%)" }}
            >
              <Zap className="w-4 h-4 animate-badge-bounce" fill="currentColor" />
              <span>Mukerian's #1 Electronics Destination</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight leading-tight mb-6 animate-fade-in-up delay-100 text-white">
              Upgrade Your Home with{" "}
              <span className="text-shimmer">Premium Appliances</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 max-w-xl animate-fade-in-up delay-200"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Authentic TVs, ACs, Refrigerators, and more. Backed by Vijay Electronics'
              25+ years of trust and after-sales support on Railway Road.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <Button
                asChild size="lg"
                className="font-bold text-lg px-8 h-12 btn-glow rounded-full"
                style={{ background: "hsl(24,100%,50%)", color: "#fff" }}
              >
                <Link href="/products">Shop Now <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button
                asChild size="lg" variant="outline"
                className="font-bold text-lg px-8 h-12 rounded-full border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <Link href="/products?category=AC">Explore ACs</Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-12 animate-fade-in-up delay-400">
              {[
                { value: "25+", label: "Years of Trust" },
                { value: "500+", label: "Products" },
                { value: "10K+", label: "Happy Customers" },
              ].map((s) => (
                <div key={s.label} className="text-white">
                  <div className="text-2xl font-black" style={{ color: "hsl(24,100%,65%)" }}>{s.value}</div>
                  <div className="text-xs font-medium opacity-70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TRUST BADGES ══════════════ */}
      <section className="bg-white border-b py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <ShieldCheck className="w-9 h-9" />, title: "100% Genuine", sub: "Original brand warranty", delay: "delay-100" },
              { icon: <ThumbsUp className="w-9 h-9" />, title: "Trusted Local",  sub: "Serving Mukerian since 1995", delay: "delay-200" },
              { icon: <Zap className="w-9 h-9" />,         title: "Best Prices",  sub: "Competitive market rates", delay: "delay-300" },
              { icon: <Wrench className="w-9 h-9" />,      title: "After Sales",  sub: "Support whenever you need", delay: "delay-400" },
            ].map((b) => (
              <div key={b.title} className={`flex flex-col items-center gap-2 p-5 rounded-xl trust-badge-hover animate-scale-in ${b.delay} cursor-default`}>
                <div style={{ color: "hsl(24,100%,50%)" }}>{b.icon}</div>
                <h3 className="font-bold text-base">{b.title}</h3>
                <p className="text-xs text-muted-foreground text-center">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CATEGORIES ══════════════ */}
      <section className="py-16" style={{ background: "hsl(36,20%,97%)" }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div className="animate-fade-in-left">
              <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "hsl(24,100%,50%)" }}>
                Browse
              </p>
              <h2 className="text-3xl md:text-4xl font-black font-serif tracking-tight">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Find exactly what you need for your home</p>
            </div>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories?.map((cat, i) => {
                const meta = CATEGORY_META[cat.category] ?? CATEGORY_META["Other"];
                return (
                  <Link key={cat.category} href={`/products?category=${encodeURIComponent(cat.category)}`}>
                    <div
                      className={`category-card-hover rounded-2xl border p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer h-full animate-scale-in delay-${Math.min((i + 1) * 100, 500)}`}
                      style={{ background: meta.bg, borderColor: meta.color + "22" }}
                    >
                      <div className="text-4xl">{meta.emoji}</div>
                      <h3 className="font-bold text-base" style={{ color: meta.color }}>{cat.category}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: meta.color + "18", color: meta.color }}
                      >
                        {cat.count} Products
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ FEATURED PRODUCTS ══════════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div className="animate-fade-in-left">
              <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "hsl(24,100%,50%)" }}>
                Handpicked
              </p>
              <h2 className="text-3xl md:text-4xl font-black font-serif tracking-tight">Featured Deals</h2>
              <p className="text-muted-foreground mt-1">Bestsellers at unbeatable prices</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex font-bold group text-primary hover:text-primary/80">
              <Link href="/products">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {isFeaturedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-square rounded-2xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : featuredProducts?.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-2xl">
              <p className="text-muted-foreground">No featured products currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 8).map((product, i) => (
                <div key={product.id} className={`animate-fade-in-up delay-${Math.min((i + 1) * 100, 500)}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="w-full font-bold rounded-full">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════ STORE CALLOUT ══════════════ */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(225,72%,14%) 0%, hsl(225,72%,22%) 100%)" }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(hsl(24,100%,60%) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[-60px] right-[10%] w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(24,100%,55%) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border"
            style={{ background: "hsl(24,100%,50%/0.15)", borderColor: "hsl(24,100%,50%/0.4)", color: "hsl(24,100%,72%)" }}
          >
            <MapPin className="w-4 h-4" /> Visit Us In Store
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-serif tracking-tight mb-4 text-white">
            Come See It In Person
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-10 text-white/70">
            Visit our showroom at Railway Road, Mukerian. Our experts will help you find the perfect appliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="font-bold w-full sm:w-auto rounded-full px-8 btn-glow"
              style={{ background: "hsl(24,100%,50%)", color: "#fff" }}
              asChild
            >
              <a href="https://maps.google.com/?q=Vijay+Electronics+Mukerian" target="_blank" rel="noreferrer">
                <MapPin className="w-5 h-5 mr-2" /> Get Directions
              </a>
            </Button>
            <Button
              size="lg" variant="outline"
              className="font-bold w-full sm:w-auto rounded-full px-8 border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <a href="tel:+919876898832">
                <Phone className="w-5 h-5 mr-2" /> Call +91 9876898832
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
