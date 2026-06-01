import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import {
  submitKyb, useMyKyb, BUSINESS_TYPES, KYB_STATUS_LABEL,
} from "@/lib/kyb-store";
import { pushNotification } from "@/lib/notifications";
import { toast } from "sonner";
import { ShieldCheck, Clock, XCircle, Building2, FileText, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/kyb-verify")({
  component: KybVerifyPage,
  head: () => ({ meta: [{ title: "Xác thực doanh nghiệp (KYB) · WorkVerse.vn" }] }),
});

function StatusBanner({ status, reason }: { status: string; reason?: string }) {
  if (status === "verified") return (
    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-4">
      <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
      <div>
        <div className="font-semibold text-green-800 dark:text-green-300">Doanh nghiệp đã được xác thực</div>
        <div className="text-sm text-green-700 dark:text-green-400">Tích xanh ✓ đã được gắn trên profile và tin tuyển dụng của bạn.</div>
      </div>
    </div>
  );
  if (status === "pending") return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4">
      <Clock className="h-8 w-8 text-amber-600 flex-shrink-0" />
      <div>
        <div className="font-semibold text-amber-800 dark:text-amber-300">Đang xét duyệt</div>
        <div className="text-sm text-amber-700 dark:text-amber-400">Hồ sơ của bạn đang được kiểm tra. Thường mất 1–2 ngày làm việc.</div>
      </div>
    </div>
  );
  if (status === "rejected") return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-4">
      <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
      <div>
        <div className="font-semibold text-red-800 dark:text-red-300">Hồ sơ bị từ chối</div>
        {reason && <div className="text-sm text-red-700 dark:text-red-400">Lý do: {reason}</div>}
        <div className="text-sm text-red-600 dark:text-red-400 mt-1">Bạn có thể cập nhật hồ sơ và nộp lại bên dưới.</div>
      </div>
    </div>
  );
  return null;
}

function KybVerifyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myKyb = useMyKyb(user?.email);

  const [form, setForm] = useState({
    companyName: myKyb?.companyName ?? user?.name ?? "",
    taxCode: myKyb?.taxCode ?? "",
    address: myKyb?.address ?? "",
    contactPhone: myKyb?.contactPhone ?? "",
    businessType: myKyb?.businessType ?? "",
    docUrl: myKyb?.docUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="text-xl font-bold">Cần đăng nhập</h1>
          <Button asChild className="mt-4"><Link to="/login">Đăng nhập</Link></Button>
        </main>
      </div>
    );
  }

  if (user.role !== "employer") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="text-xl font-bold">Chỉ dành cho Nhà tuyển dụng</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tính năng KYB chỉ áp dụng cho tài khoản Nhà tuyển dụng.</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/profile">Quay lại hồ sơ</Link></Button>
        </main>
      </div>
    );
  }

  const canSubmit = !myKyb || myKyb.status === "rejected" || myKyb.status === "none";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.taxCode || !form.address || !form.contactPhone || !form.businessType) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // simulate async
      submitKyb({ ...form, email: user.email });
      pushNotification({
        type: "info",
        title: "Hồ sơ KYB đã được gửi",
        description: "Chúng tôi sẽ xét duyệt trong 1–2 ngày làm việc.",
        link: "/kyb-verify",
      });
      toast.success("Đã gửi hồ sơ xác thực! Chúng tôi sẽ phản hồi trong 1–2 ngày.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Xác thực doanh nghiệp (KYB)</h1>
            <p className="text-sm text-muted-foreground">Nhận tích xanh ✓ để tăng uy tín khi đăng tin tuyển dụng</p>
          </div>
        </div>

        {/* Trạng thái hiện tại */}
        {myKyb && <StatusBanner status={myKyb.status} reason={myKyb.rejectReason} />}

        {/* Lợi ích */}
        {(!myKyb || myKyb.status === "none") && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, title: "Tích xanh ✓", desc: "Hiển thị trên mọi tin đăng" },
              { icon: Building2, title: "Ưu tiên hiển thị", desc: "Job lên top kết quả tìm kiếm" },
              { icon: FileText, title: "Tăng tỉ lệ ứng tuyển", desc: "SV tin tưởng hơn 3× so với chưa xác thực" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-background p-4 text-center">
                <Icon className="mx-auto h-6 w-6 text-primary mb-2" />
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {canSubmit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {myKyb?.status === "rejected" ? "Nộp lại hồ sơ" : "Điền thông tin doanh nghiệp"}
              </CardTitle>
              <CardDescription>Thông tin sẽ được xác minh với cơ sở dữ liệu doanh nghiệp quốc gia</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="kyb-company">Tên công ty / doanh nghiệp <span className="text-destructive">*</span></Label>
                    <Input id="kyb-company" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Công ty TNHH ABC" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kyb-tax">Mã số thuế (MST) <span className="text-destructive">*</span></Label>
                    <Input id="kyb-tax" value={form.taxCode} onChange={(e) => set("taxCode", e.target.value)} placeholder="0123456789" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="kyb-type">Loại hình kinh doanh <span className="text-destructive">*</span></Label>
                  <Select value={form.businessType} onValueChange={(v) => set("businessType", v)}>
                    <SelectTrigger id="kyb-type">
                      <SelectValue placeholder="Chọn loại hình..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="kyb-address">Địa chỉ đăng ký kinh doanh <span className="text-destructive">*</span></Label>
                  <Input id="kyb-address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Số nhà, đường, phường, quận, tỉnh/TP" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="kyb-phone">Số điện thoại liên hệ <span className="text-destructive">*</span></Label>
                    <Input id="kyb-phone" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="0901234567" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kyb-doc">
                      Link GPKD / Giấy tờ pháp lý
                      <span className="text-xs text-muted-foreground ml-1">(tùy chọn)</span>
                    </Label>
                    <Input id="kyb-doc" value={form.docUrl} onChange={(e) => set("docUrl", e.target.value)} placeholder="https://drive.google.com/..." />
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                  ℹ️ Thông tin của bạn được mã hoá và chỉ dùng cho mục đích xác thực danh tính doanh nghiệp.
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang gửi…" : "Gửi hồ sơ xác thực"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Đã verified hoặc đang pending */}
        {myKyb && myKyb.status !== "rejected" && myKyb.status !== "none" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin đã nộp</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              {[
                ["Công ty", myKyb.companyName],
                ["Mã số thuế", myKyb.taxCode],
                ["Loại hình", myKyb.businessType],
                ["Địa chỉ", myKyb.address],
                ["Điện thoại", myKyb.contactPhone],
                ["Trạng thái", KYB_STATUS_LABEL[myKyb.status]],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link to="/profile">← Quay lại hồ sơ</Link>
        </Button>
      </main>
    </div>
  );
}