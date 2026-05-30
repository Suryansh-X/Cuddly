import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export function AdminLogin() {
  const [_, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const adminLogin = useAdminLogin();

  // If already authenticated in this session, go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const result = await adminLogin.mutateAsync({ data });
      if (result.success && result.token) {
        login(result.token);
        // Navigate after state is set
        setLocation("/admin/dashboard");
      } else {
        toast({ title: "Login Failed", description: "Invalid password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Login Failed", description: "Wrong password or server error.", variant: "destructive" });
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4"
      style={{ background: "linear-gradient(135deg, hsl(225,72%,14%) 0%, hsl(225,72%,22%) 100%)" }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-8 pt-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2"
            style={{ background: "hsl(24,100%,50%)" }}>
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="font-serif text-3xl font-black tracking-tight">Admin Panel</CardTitle>
          <CardDescription className="text-base font-medium">
            Vijay Electronics — Management
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Admin Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter admin password"
                          className="h-12 pl-10 text-base"
                          autoComplete="current-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 font-bold text-base"
                style={{ background: "hsl(24,100%,50%)", color: "#fff" }}
                disabled={adminLogin.isPending}
              >
                {adminLogin.isPending ? "Verifying..." : "Login to Dashboard"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
