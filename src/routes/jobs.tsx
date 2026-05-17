import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { ApplyDialog } from "@/components/apply-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useJobs } from "@/lib/jobs-store";
import { useAuth, ROLE_LABEL, type Role } from "@/lib/auth";
import { useApplications } from "@/lib/applications-store";
import { pushNotification } from "@/lib/notifications";
import { toast } from "sonner";
import {
  MapPin, Clock, Banknote, Plus, Map as MapIcon, List,
  CheckCircle2, LogIn, UserPlus, Briefcase, Search,
} from "lucide-react";
import { JobMap } from "@/components/job-map";
import type { Job } from "@/lib/mock-data";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
  head: () => ({
    meta: [
      { title: "Việc làm trong 2km · WorkVerse.vn" },
      { name: "description", content: "Tìm việc làm part-time, full-time, freelance trong 2km quanh bạn." },
      { property: "og:title", content: "Việc làm trong 2km · WorkVerse.vn" },
      { property: "og:image", content: "/og-image.jpg" },
    ],
  }),
});

// ── Dialog đăng ký / đăng nhập inline ─────────────────────────────────────────

function AuthDialog({
  open, onOpenChange, onSuccess,
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

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const switchMode = (m: "register" | "login") => { setMode(m); setError(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = mode === "register"
        ? await register({ ...form, email: form.email.trim() })
        : await login(form.email.trim(), form.password);
      if (!res.ok) { setError(res.error); return; }
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
            {mode === "register"
              ? <><UserPlus className="h-5 w-5" /> Đăng ký để ứng tuyển</>
              : <><LogIn className="h-5 w-5" /> Đăng nhập để ứng tuyển</>}
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
                  {(["student", "employer", "admin"] as Role[]).map((r) => (
                    <button key={r} type="button" onClick={() => set("role", r)}
                      className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                        form.role === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                      }`}>
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jauth-name">Họ tên</Label>
                <Input id="jauth-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="jauth-email">Email</Label>
            <Input id="jauth-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jauth-pw">
              Mật khẩu{mode === "register" && <span className="text-xs text-muted-foreground ml-1">(tối thiểu 6 ký tự)</span>}
            </Label>
            <Input id="jauth-pw" type="password" value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required minLength={mode === "register" ? 6 : 1} />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý…"
              : mode === "register" ? "Tạo tài khoản & ứng tuyển"
              : "Đăng nhập & ứng tuyển"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "register" ? (
              <>Đã có tài khoản?{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => switchMode("login")}>Đăng nhập</button>
              </>
            ) : (
              <>Chưa có tài khoản?{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => switchMode("register")}>Đăng ký</button>
              </>
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Job Card ───────────────────────────────────────────────────────────────────

function JobCard({ job, onQuickApply }: { job: Job; onQuickApply: (job: Job) => void }) {
  const { user } = useAuth();
  const { hasApplied } = useApplications(user?.email);
  const applied = hasApplied(job.id);

  return (
    <Card className="h-full flex flex-col transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{job.title}</CardTitle>
          <Badge
            variant={job.type === "Freelance" ? "default" : job.type === "Full-time" ? "secondary" : "outline"}
            className="flex-shrink-0 text-xs"
          >
            {job.type}
          </Badge>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs flex-shrink-0">{job.distanceKm} km</span>
        </div>
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <Banknote className="h-3.5 w-3.5 flex-shrink-0" /> {job.salary}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" /> {job.postedAt}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills.slice(0, 3).map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
          {job.skills.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">+{job.skills.length - 3}</Badge>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
          <Link
            to="/jobs/$jobId"
            params={{ jobId: job.id }}
            className="text-sm text-primary hover:underline flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            Xem chi tiết →
          </Link>

          {applied ? (
            <Badge variant="secondary" className="text-xs">✓ Đã ứng tuyển</Badge>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs px-3 flex-shrink-0"
              onClick={(e) => { e.preventDefault(); onQuickApply(job); }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Ứng tuyển
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Trang chính ───────────────────────────────────────────────────────────────

const JOB_TYPES = ["Tất cả", "Full-time", "Part-time", "Freelance"] as const;

function JobsPage() {
  const { all } = useJobs();
  const { user } = useAuth();

  const [radius, setRadius] = useState(2);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [view, setView] = useState<"list" | "map">("list");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [authOpen, setAuthOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = all.filter((j) => {
    const inRadius = j.distanceKm <= radius;
    const matchQ = q === "" || j.title.toLowerCase().includes(q.toLowerCase()) || j.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()));
    const matchType = typeFilter === "Tất cả" || j.type === typeFilter;
    return inRadius && matchQ && matchType;
  });

  // Xử lý nút ứng tuyển nhanh từ card
  const handleQuickApply = (job: Job) => {
    setSelectedJob(job);
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (user.role === "employer") {
      toast.error("Tài khoản Nhà tuyển dụng không thể ứng tuyển.");
      return;
    }
    setApplyOpen(true);
  };

  // Sau khi đăng ký/đăng nhập thành công
  const onAuthSuccess = () => {
    toast.success("Đăng nhập thành công!");
    setTimeout(() => setApplyOpen(true), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Việc làm gần bạn</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tìm việc part-time, full-time, freelance phù hợp trong bán kính {radius} km
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center rounded-md border border-border p-0.5">
              <Button size="sm" variant={view === "list" ? "default" : "ghost"} onClick={() => setView("list")}>
                <List className="h-4 w-4" /> Danh sách
              </Button>
              <Button size="sm" variant={view === "map" ? "default" : "ghost"} onClick={() => setView("map")}>
                <MapIcon className="h-4 w-4" /> Bản đồ
              </Button>
            </div>
            {user?.role === "employer" && (
              <Button asChild><Link to="/post-job"><Plus className="h-4 w-4" /> Đăng tin</Link></Button>
            )}
          </div>
        </div>

        {/* Bộ lọc */}
        <Card className="mt-5">
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" /> Tìm theo kỹ năng / chức danh
                </label>
                <Input
                  placeholder="React, UI/UX, Pha chế, Marketing..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Bán kính: <span className="text-primary font-semibold">{radius} km</span>
                </label>
                <Slider
                  value={[radius]}
                  onValueChange={(v) => setRadius(v[0])}
                  min={0.5} max={5} step={0.1}
                  className="mt-3"
                />
              </div>
            </div>

            {/* Filter loại việc */}
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    typeFilter === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
              <span className="ml-auto self-center text-xs text-muted-foreground">
                {filtered.length} việc làm
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bản đồ */}
        {view === "map" && (
          <div className="mt-6">
            <JobMap jobs={filtered} radiusKm={radius} />
          </div>
        )}

        {/* Danh sách */}
        {view === "list" && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="space-y-3 pt-6">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center py-16 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="font-medium text-muted-foreground">Không có việc làm phù hợp</p>
                <p className="text-sm text-muted-foreground mt-1">Thử tăng bán kính hoặc thay đổi từ khoá tìm kiếm</p>
                <Button variant="outline" className="mt-4" onClick={() => { setQ(""); setRadius(5); setTypeFilter("Tất cả"); }}>
                  Xoá bộ lọc
                </Button>
              </div>
            ) : (
              filtered.map((j) => (
                <JobCard key={j.id} job={j} onQuickApply={handleQuickApply} />
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Dialogs ── */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onSuccess={onAuthSuccess} />
      {selectedJob && (
        <ApplyDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          job={{ id: selectedJob.id, title: selectedJob.title, company: selectedJob.company }}
        />
      )}
    </div>
  );
}