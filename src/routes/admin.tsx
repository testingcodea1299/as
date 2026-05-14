import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_AUDIT } from "@/lib/mock-data";
import { Users, Wallet, AlertTriangle, FileCheck2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard · WorkVerse.vn" }] }),
});

const KPIS = [
  { icon: Users, label: "User mới (24h)", value: "142" },
  { icon: Wallet, label: "Escrow hold", value: "86.5tr ₫" },
  { icon: FileCheck2, label: "Hợp đồng mới", value: "18" },
  { icon: AlertTriangle, label: "Cảnh báo IDS", value: "3" },
];

function AdminPage() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Khu vực dành cho Quản trị viên</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn cần đăng nhập bằng tài khoản admin để truy cập trang này.
          </p>
          <Button asChild className="mt-6"><Link to="/login">Đăng nhập admin</Link></Button>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          RBAC + MFA · Audit logs lưu vết 7 năm · IDS impossible-travel detector.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 pt-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-lg font-bold">{value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Audit logs</CardTitle>
            <CardDescription>Mỗi hành động Admin / Chatbot tool-call đều được lưu vết</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="pb-2 pr-4">Time</th>
                    <th className="pb-2 pr-4">Actor</th>
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Target</th>
                    <th className="pb-2">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_AUDIT.map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 font-mono text-xs">{row.ts}</td>
                      <td className="py-2 pr-4">{row.actor}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={row.action.startsWith("ALERT") ? "destructive" : "secondary"}>
                          {row.action}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">{row.target}</td>
                      <td className="py-2 font-mono text-xs text-muted-foreground">{row.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
