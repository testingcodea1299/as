import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, ROLE_LABEL, type Role } from "@/lib/auth";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Đăng ký — WorkVerse.vn" }] }),
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as Role });
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await register({ ...form, email: form.email.trim() });
    if (!res.ok) return setError(res.error);
    navigate({ to: "/" });
  };

  const roles: Role[] = ["student", "employer", "admin"];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Đăng ký tài khoản</CardTitle>
            <CardDescription>Tạo tài khoản mới (lưu cục bộ trong trình duyệt cho demo)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r }))}
                      className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                        form.role === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên / Tên công ty</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu (tối thiểu 6 ký tự)</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Tạo tài khoản</Button>
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
