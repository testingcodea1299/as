import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, DEMO_ACCOUNTS, ROLE_LABEL } from "@/lib/auth";
import { LogIn, UserCheck, Building2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Đăng nhập — WorkVerse.vn" }] }),
});

const ICONS = { student: UserCheck, employer: Building2, admin: ShieldCheck } as const;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const DEMO_PW_MAP: Record<string, string> = {
    "student@workverse.vn": "student123",
    "employer@workverse.vn": "employer123",
    "admin@workverse.vn": "admin123",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(email.trim(), password);
    if (!res.ok) return setError(res.error);
    navigate({ to: "/" });
  };

  const quickLogin = async (acc: typeof DEMO_ACCOUNTS[number]) => {
    const pw = DEMO_PW_MAP[acc.email] ?? "";
    setEmail(acc.email);
    setPassword(pw);
    const res = await login(acc.email, pw);
    if (res.ok) navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5" /> Đăng nhập</CardTitle>
            <CardDescription>Sử dụng email & mật khẩu hoặc chọn tài khoản demo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Đăng nhập</Button>
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-primary hover:underline">Đăng ký ngay</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài khoản demo</CardTitle>
            <CardDescription>Click để đăng nhập nhanh theo từng vai trò</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = ICONS[acc.role];
              return (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{ROLE_LABEL[acc.role]} · {acc.name}</div>
                    <div className="text-xs text-muted-foreground">{acc.email} / {DEMO_PW_MAP[acc.email]}</div>
                  </div>
                  <span className="text-xs text-primary">Đăng nhập →</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
