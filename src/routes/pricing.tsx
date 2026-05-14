import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, CreditCard } from "lucide-react";
import { useAuth, type Plan, type Role } from "@/lib/auth";
import { PaymentDialog } from "@/components/payment-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({ meta: [{ title: "Gói Pro & Premium — WorkVerse.vn" }] }),
});

type PlanDef = {
  id: Plan;
  name: string;
  price: string;
  icon: typeof Sparkles;
  color: string;
  features: Record<Role, string[]>;
};

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    price: "0₫",
    icon: Sparkles,
    color: "text-muted-foreground",
    features: {
      student: ["Tìm việc trong 2km", "5 lượt chat AI/ngày", "Nộp 10 đơn/tháng"],
      employer: ["Đăng 1 tin/tháng", "5 lượt chat AI/ngày", "Xem 20 ứng viên/tháng"],
      admin: ["Bảng điều khiển cơ bản", "Audit logs 30 ngày"],
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "99.000₫/tháng",
    icon: Zap,
    color: "text-primary",
    features: {
      student: ["Tất cả Free", "Chat AI không giới hạn", "Ưu tiên ứng tuyển", "CV được verify", "Nộp đơn không giới hạn"],
      employer: ["Tất cả Free", "Đăng 20 tin/tháng", "Lọc ứng viên bằng AI", "Báo cáo escrow chi tiết", "Phí escrow giảm còn 1.5%"],
      admin: ["Tất cả Free", "Audit logs 1 năm", "Cảnh báo IDS realtime"],
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: "299.000₫/tháng",
    icon: Crown,
    color: "text-amber-500",
    features: {
      student: ["Tất cả Pro", "Mentor 1-1 hàng tuần", "Khoá học premium", "Headhunter giới thiệu trực tiếp"],
      employer: ["Tất cả Pro", "Đăng tin không giới hạn", "Account Manager riêng", "API tích hợp ATS", "Phí escrow chỉ 1%"],
      admin: ["Tất cả Pro", "Audit logs 7 năm", "Export báo cáo tuỳ biến", "SLA 99.99%"],
    },
  },
];

function PricingPage() {
  const { user, upgrade } = useAuth();
  const navigate = useNavigate();
  const role: Role = user?.role ?? "student";
  const [payOpen, setPayOpen] = useState(false);
  const [payPlan, setPayPlan] = useState<Plan>("pro");

  const handleUpgrade = (plan: Plan) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập trước khi nâng cấp");
      navigate({ to: "/login" });
      return;
    }
    if (plan === "free") {
      upgrade("free");
      toast.success("Bạn đã chuyển về gói miễn phí.");
      return;
    }
    setPayPlan(plan);
    setPayOpen(true);
  };

  const handlePaid = () => {
    upgrade(payPlan);
    toast.success(`Thanh toán thành công — đã kích hoạt gói ${payPlan.toUpperCase()} 🎉`, {
      description: "Hoá đơn đã được gửi tới email của bạn (mô phỏng).",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">
          <Badge variant="outline" className="mb-3"><Crown className="mr-1 h-3 w-3" /> Gói nâng cấp</Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">Chọn gói phù hợp với bạn</h1>
          <p className="mt-2 text-muted-foreground">
            Tính năng hiển thị theo vai trò: <span className="font-medium text-foreground">{role === "student" ? "Sinh viên" : role === "employer" ? "Nhà tuyển dụng" : "Quản trị viên"}</span>
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const current = user?.plan === p.id;
            const featured = p.id === "pro";
            return (
              <Card key={p.id} className={featured ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-6 w-6 ${p.color}`} />
                    {featured && <Badge>Phổ biến</Badge>}
                    {current && <Badge variant="secondary">Đang dùng</Badge>}
                  </div>
                  <CardTitle className="mt-2 text-2xl">{p.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-foreground">{p.price}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {p.features[role].map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={featured ? "default" : "outline"}
                    disabled={current}
                    onClick={() => handleUpgrade(p.id)}
                  >
                    {current ? "Gói hiện tại" : p.id === "free" ? "Hạ về Free" : <><CreditCard /> Nâng cấp {p.name}</>}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4 text-center text-sm">
          <p className="font-medium">Phương thức thanh toán hỗ trợ</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <Badge variant="outline">VISA</Badge>
            <Badge variant="outline">Mastercard</Badge>
            <Badge variant="outline">JCB</Badge>
            <Badge variant="outline">ATM Napas</Badge>
            <Badge variant="outline">VNPay</Badge>
            <Badge variant="outline">Momo</Badge>
            <Badge variant="outline">ZaloPay</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * Demo mô phỏng — thanh toán thực sẽ tích hợp Stripe / VNPay khi triển khai production.
          </p>
        </div>

        <PaymentDialog open={payOpen} onClose={() => setPayOpen(false)} plan={payPlan} onSuccess={handlePaid} />
      </main>
    </div>
  );
}
