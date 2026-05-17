import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { ApplyDialog } from "@/components/apply-dialog";
import { useApplications, APP_STATUS_LABEL } from "@/lib/applications-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useJobs } from "@/lib/jobs-store";
import { useAuth, ROLE_LABEL, type Role } from "@/lib/auth";
import { pushNotification } from "@/lib/notifications";
import { toast } from "sonner";
import {
  ArrowLeft, MapPin, Banknote, Clock, Building2, CheckCircle2,
  Bot, Share2, Briefcase, LogIn, UserPlus, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetailPage,
  head: ({ params }) => ({ meta: [{ title: `Việc làm ${params.jobId} · WorkVerse.vn` }] }),
});

// ─── Dialog đăng ký / đăng nhập inline ───────────────────────────────────────

function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as Role });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roles: Role[] = ["student", "employer", "admin"];

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "register"
          ? await register({ ...form, email: form.email.trim() })
          : await login(form.email.trim(), form.password);
      if (!res.ok) return setError(res.error);
      onOpenChange(false);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "register" ? (
              <><UserPlus className="h-5 w-5" /> Đăng ký để ứng tuyển</>
            ) : (
              <><LogIn className="h-5 w-5" /> Đăng nhập để ứng tuyển</>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "register"
              ? "Tạo tài khoản miễn phí — xong là ứng tuyển ngay."
              : "Đăng nhập vào tài khoản của bạn."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 pt-1">
          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <Label>Vai trò</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set("role", r)}
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

              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Họ tên</Label>
                <Input id="auth-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-pw">
              Mật khẩu{" "}
              {mode === "register" && <span className="text-xs text-muted-foreground">(tối thiểu 6 ký tự)</span>}
            </Label>
            <Input
              id="auth-pw"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
              minLength={mode === "register" ? 6 : 1}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Đang xử lý…"
              : mode === "register"
              ? "Tạo tài khoản & tiếp tục ứng tuyển"
              : "Đăng nhập & tiếp tục ứng tuyển"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "register" ? (
              <>Đã có tài khoản?{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => { setMode("login"); setError(null); }}>
                  Đăng nhập
                </button>
              </>
            ) : (
              <>Chưa có tài khoản?{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => { setMode("register"); setError(null); }}>
                  Đăng ký
                </button>
              </>
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Trang chính ──────────────────────────────────────────────────────────────

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const { all } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const job = all.find((j) => j.id === jobId);
  const [applyOpen, setApplyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { hasApplied, items } = useApplications(user?.email);
  const myApp = job ? items.find((a) => a.jobId === job.id) : undefined;

  // Việc làm liên quan: cùng type hoặc chung skill, loại job hiện tại
  const related = job
    ? all
        .filter(
          (j) =>
            j.id !== job.id &&
            (j.type === job.type || j.skills.some((s) => job.skills.includes(s)))
        )
        .slice(0, 3)
    : [];

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="text-xl font-bold">Không tìm thấy việc làm</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tin này có thể đã hết hạn hoặc bị xoá.</p>
          <Button asChild className="mt-6"><Link to="/jobs">Xem danh sách việc</Link></Button>
        </main>
      </div>
    );
  }

  // ── Logic ứng tuyển ──
  const handleApply = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (user.role === "employer") {
      toast.error("Tài khoản Nhà tuyển dụng không thể ứng tuyển.");
      return;
    }
    if (hasApplied(job.id)) {
      toast.message("Bạn đã ứng tuyển job này.", {
        action: { label: "Xem Hồ sơ", onClick: () => navigate({ to: "/profile" }) },
      });
      return;
    }
    setApplyOpen(true);
  };

  const onAuthSuccess = () => {
    // Sau khi đăng ký/đăng nhập thành công → mở form ứng tuyển luôn
    setTimeout(() => setApplyOpen(true), 200);
  };

  const share = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: job.title, text: `${job.title} tại ${job.company}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Đã sao chép link việc làm!");
    }
  };

  const typeVariant = job.type === "Freelance" ? "default" : job.type === "Full-time" ? "secondary" : "outline";

  // Nút ứng tuyển dùng lại nhiều nơi
  const ApplyBtn = ({ className = "" }: { className?: string }) =>
    myApp ? (
      <div className={`rounded-md border border-primary/30 bg-primary/5 p-3 text-sm ${className}`}>
        <div className="font-medium text-primary">✓ Đã ứng tuyển</div>
        <div className="text-xs text-muted-foreground">Trạng thái: {APP_STATUS_LABEL[myApp.status]}</div>
        <Button asChild size="sm" variant="link" className="h-auto p-0 mt-0.5">
          <Link to="/profile">Xem tiến trình →</Link>
        </Button>
      </div>
    ) : (
      <Button className={`w-full ${className}`} onClick={handleApply}>
        <CheckCircle2 className="h-4 w-4" /> Ứng tuyển ngay
      </Button>
    );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-28 lg:pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/jobs" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Việc làm
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate max-w-[200px] text-foreground">{job.title}</span>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── Cột trái ── */}
          <div className="space-y-6">
            {/* Header card */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-background p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Badge variant={typeVariant}>{job.type}</Badge>
                  <h1 className="mt-2 text-2xl font-bold sm:text-3xl leading-tight">{job.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Building2 className="h-4 w-4 text-primary" /> {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {job.location}
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">{job.distanceKm} km</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-green-600" /> {job.salary}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {job.postedAt}
                    </span>
                  </div>
                </div>
                <button
                  onClick={share}
                  className="flex-shrink-0 rounded-lg border border-border p-2 hover:bg-accent transition-colors"
                  title="Chia sẻ"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Skills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>

              {/* Apply CTA trong header (mobile ẩn vì có sticky bar) */}
              <div className="mt-4 hidden lg:block">
                <ApplyBtn />
              </div>
            </div>

            {/* Mô tả công việc */}
            <Card>
              <CardHeader><CardTitle className="text-base">Mô tả công việc</CardTitle></CardHeader>
              <CardContent className="space-y-5 text-sm leading-relaxed">
                <p className="text-muted-foreground">
                  {job.description ?? `${job.company} đang tìm kiếm ${job.title} tại ${job.location}.`}
                </p>

                <div>
                  <h3 className="mb-2 font-semibold">Trách nhiệm chính</h3>
                  <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                    {(job.responsibilities ?? [
                      "Phối hợp với team thực hiện công việc theo yêu cầu dự án",
                      "Đảm bảo deadline và chất lượng đầu ra",
                    ]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-semibold">Yêu cầu ứng viên</h3>
                  <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                    {(job.requirements ?? [
                      `Thành thạo: ${job.skills.join(", ")}`,
                      "Tinh thần học hỏi, giao tiếp tốt",
                    ]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-semibold">Quyền lợi</h3>
                  <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                    {(job.benefits ?? [
                      `Mức ${job.type === "Freelance" ? "thù lao" : "lương"}: ${job.salary}`,
                      "Thanh toán an toàn qua Escrow WorkVerse",
                    ]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>

                {/* Thông tin bổ sung */}
                {(job.workingHours || job.deadline || job.contactEmail) && (
                  <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                    {job.workingHours && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Thời gian làm việc</div>
                        <div className="text-sm">{job.workingHours}</div>
                      </div>
                    )}
                    {job.deadline && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Hạn nộp hồ sơ</div>
                        <div className="text-sm font-medium text-orange-600">{job.deadline}</div>
                      </div>
                    )}
                    {job.contactEmail && (
                      <div className="sm:col-span-2">
                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Liên hệ</div>
                        <a href={`mailto:${job.contactEmail}`} className="text-sm text-primary hover:underline">
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Việc làm liên quan */}
            {related.length > 0 && (
              <div>
                <h2 className="mb-3 text-base font-semibold">Việc làm tương tự</h2>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to="/jobs/$jobId"
                      params={{ jobId: r.id }}
                      className="flex items-center justify-between rounded-xl border border-border bg-background p-4 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">{r.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {r.company} · {r.distanceKm} km · {r.salary}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <Badge variant={r.type === "Freelance" ? "default" : "secondary"} className="text-xs">
                          {r.type}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
                <Button asChild variant="ghost" className="mt-2 w-full text-sm">
                  <Link to="/jobs">Xem tất cả việc làm →</Link>
                </Button>
              </div>
            )}
          </div>

          {/* ── Cột phải (desktop) ── */}
          <aside className="hidden lg:flex flex-col gap-4">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-4 w-4 text-green-600" /> {job.salary}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ApplyBtn />
                <Button asChild variant="outline" className="w-full">
                  <Link to="/chatbot"><Bot className="h-4 w-4" /> Hỏi AI về job này</Link>
                </Button>
                <button onClick={share} className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <Share2 className="h-4 w-4" /> Chia sẻ việc làm
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">🔒 Thanh toán an toàn</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>Khoản tiền được giữ tại Escrow WorkVerse đến khi bàn giao thành công.</p>
                <p>Phí nền tảng: <span className="font-medium text-foreground">2%</span> (Pro 1.5% / Premium 1%)</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* ── Sticky bar mobile ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{job.title}</div>
            <div className="text-xs text-green-600 font-medium">{job.salary}</div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/chatbot"><Bot className="h-4 w-4" /></Link>
          </Button>
          <div className="w-36">
            <ApplyBtn />
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onSuccess={onAuthSuccess} />
      {job && (
        <ApplyDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          job={{ id: job.id, title: job.title, company: job.company }}
        />
      )}
    </div>
  );
}