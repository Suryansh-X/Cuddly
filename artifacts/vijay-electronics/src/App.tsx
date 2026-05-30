import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { Layout } from "@/components/Layout";

import { Home } from "@/pages/Home";
import { Products } from "@/pages/Products";
import { ProductDetail } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { OrderConfirmation } from "@/pages/OrderConfirmation";
import { AdminLogin } from "@/pages/AdminLogin";
import { AdminDashboard } from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/admin">
        <AdminLogin />
      </Route>
      <Route path="/admin/dashboard">
        <AdminDashboard />
      </Route>
      
      {/* Client Routes */}
      <Route path="/">
        <Layout><Home /></Layout>
      </Route>
      <Route path="/products">
        <Layout><Products /></Layout>
      </Route>
      <Route path="/products/:id">
        <Layout><ProductDetail /></Layout>
      </Route>
      <Route path="/cart">
        <Layout><Cart /></Layout>
      </Route>
      <Route path="/checkout">
        <Layout><Checkout /></Layout>
      </Route>
      <Route path="/order/:id">
        <Layout><OrderConfirmation /></Layout>
      </Route>
      
      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <CartProvider>
              <Router />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
