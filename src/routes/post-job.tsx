import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useJobs } from "@/lib/jobs-store";
import { Briefcase, Lock, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/post-job")({
  component: PostJobPage,
  head: () => ({ meta: [{ title: "Đăng tin tuyển dụng — WorkVerse.vn" }] }),
});

const TYPES = ["Full-time", "Part-time", "Freelance"] as const;

function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userJobs, addJob, removeJob } = useJobs();
  const [form, setForm] = useState({
    title: "",
    type: "Full-time" as (typeof TYPES)[number],
    company: user?.name ?? "",
    location: "",
    salary: "",
    skills: "",
  });

  if (!user || user.role !== "employer") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Chỉ dành cho Nhà tuyển dụng</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đăng nhập với tài khoản nhà tuyển dụng để đăng tin việc làm.
          </p>
          <Button asChild className="mt-6"><Link to="/login">Đăng nhập</Link></Button>
        </main>
      </div>
    );
  }

  const limit = user.plan === "free" ? 1 : user.plan === "pro" ? 20 : Infinity;
  const used = userJobs.length;
  const reachLimit = used >= limit;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reachLimit) {
      toast.error(`Gói ${user.plan.toUpperCase()} đã đạt giới hạn ${limit} tin/tháng`, {
        description: "Nâng cấp gói để đăng nhiều tin hơn.",
      });
      return;
    }
    if (!form.title || !form.company || !form.location || !form.salary) {
      toast.error("Vui lòng điền đủ thông tin");
      return;
    }
    addJob({
      title: form.title,
      type: form.type,
      company: form.company,
      location: form.location,
      salary: form.salary,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    toast.success("Đã đăng tin tuyển dụng!", { description: "Tin của bạn xuất hiện trong /jobs ngay lập tức." });
    setForm({ ...form, title: "", location: "", salary: "", skills: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Đăng tin mới</CardTitle>
            <CardDescription>
              Gói <Badge variant="outline">{user.plan.toUpperCase()}</Badge> · Đã dùng {used}/{limit === Infinity ? "∞" : limit} tin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Loại hình</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`rounded-md border px-3 py-2 text-sm transition-colors ${form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Chức danh</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Lập trình viên Web Junior" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Công ty</Label>
                <Input id="company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Q.1, TP.HCM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Mức lương</Label>
                  <Input id="salary" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} placeholder="10-15 triệu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Kỹ năng (cách nhau bằng dấu phẩy)</Label>
                <Textarea id="skills" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} placeholder="React, TypeScript, Tailwind" rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={reachLimit}>
                <Briefcase /> {reachLimit ? "Đã đạt giới hạn — nâng cấp gói" : "Đăng tin"}
              </Button>
              {reachLimit && (
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate({ to: "/pricing" })}>
                  Xem gói Pro/Premium
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tin đã đăng ({userJobs.length})</CardTitle>
            <CardDescription>Quản lý các tin tuyển dụng của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userJobs.length === 0 && (
              <p className="text-sm text-muted-foreground">Bạn chưa có tin nào. Hãy đăng tin đầu tiên!</p>
            )}
            {userJobs.map((j) => (
              <div key={j.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{j.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{j.type}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {j.company} · {j.location} · {j.salary}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => { removeJob(j.id); toast.success("Đã xoá tin"); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
