import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function Products() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Parse query params
  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const categoryParam = searchParams.get("category") || "";
  const searchQ = searchParams.get("search") || "";
  const availableOnly = searchParams.get("available") === "true";

  // Local state for the filter sidebar (synced with URL)
  const [localSearch, setLocalSearch] = useState(searchQ);

  const { data: products, isLoading: isProductsLoading } = useListProducts({
    category: categoryParam || undefined,
    search: searchQ || undefined,
    available: availableOnly || undefined,
  });

  const { data: categories } = useListCategories();

  const updateFilters = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchString);
    if (value === null || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setLocation(`/products?${newParams.toString()}`);
  };

  const clearFilters = () => {
    setLocalSearch("");
    setLocation("/products");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", localSearch);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-4">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="cat-all" 
              checked={!categoryParam}
              onCheckedChange={() => updateFilters("category", null)}
            />
            <Label htmlFor="cat-all" className="cursor-pointer font-medium">All Categories</Label>
          </div>
          {categories?.map((c) => (
            <div key={c.category} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${c.category}`} 
                checked={categoryParam === c.category}
                onCheckedChange={() => updateFilters("category", c.category)}
              />
              <Label htmlFor={`cat-${c.category}`} className="cursor-pointer">
                {c.category} <span className="text-muted-foreground text-xs ml-1">({c.count})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-bold text-lg mb-4">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="avail-in-stock" 
            checked={availableOnly}
            onCheckedChange={(checked) => updateFilters("available", checked ? "true" : null)}
          />
          <Label htmlFor="avail-in-stock" className="cursor-pointer">In Stock Only</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-3xl font-black font-serif tracking-tight flex-1">
          {categoryParam ? categoryParam : "All Products"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Input 
              placeholder="Search products..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </form>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="shrink-0 gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterContent />
              {(categoryParam || searchQ || availableOnly) && (
                <Button variant="ghost" onClick={clearFilters} className="w-full mt-6 text-destructive hover:text-destructive">
                  Clear All Filters
                </Button>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input 
                placeholder="Search products..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </form>
            
            <div className="bg-card border rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">Filters</h2>
                {(categoryParam || searchQ || availableOnly) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                    <X className="w-3 h-3 mr-1" /> Clear
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active Filters Display */}
          {(categoryParam || searchQ || availableOnly) && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-muted-foreground flex items-center">Active filters:</span>
              {categoryParam && (
                <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  Category: {categoryParam}
                  <button onClick={() => updateFilters("category", null)} className="ml-1 hover:text-primary/70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQ && (
                <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  Search: "{searchQ}"
                  <button onClick={() => updateFilters("search", null)} className="ml-1 hover:text-primary/70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {availableOnly && (
                <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  In Stock Only
                  <button onClick={() => updateFilters("available", null)} className="ml-1 hover:text-primary/70"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any products matching your current filters. Try adjusting your search or category selection.
              </p>
              <Button onClick={clearFilters} variant="outline" className="font-bold">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
