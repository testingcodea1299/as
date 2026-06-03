import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, ROLE_LABEL, PLAN_LABEL } from "@/lib/auth";
import { useJobs } from "@/lib/jobs-store";
import { useApplications, APP_STATUS_LABEL, APP_STATUS_VARIANT } from "@/lib/applications-store";
import { toast } from "sonner";
import { User, Mail, Briefcase, Crown, LogOut, Save, FileText, Clock, Calendar, Bot, Sparkles } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Hồ sơ của tôi · WorkVerse.vn" }] }),
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const { userJobs, removeJob } = useJobs();
  const { items: myApplications } = useApplications(user?.email);
  const navigate = useNavigate();
  const [bio, setBio] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("workverse.bio") || "" : ""));
  const [skills, setSkills] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("workverse.skills") || "" : ""));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-bold">Bạn chưa đăng nhập</h1>
          <Button asChild className="mt-4"><Link to="/login">Đăng nhập</Link></Button>
        </main>
      </div>
    );
  }

  const save = () => {
    localStorage.setItem("workverse.bio", bio);
    localStorage.setItem("workverse.skills", skills);
    toast.success("Đã lưu hồ sơ");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-background p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {ROLE_LABEL[user.role]}</span>
                <Badge variant={user.plan === "free" ? "outline" : "default"}>
                  <Crown className="mr-1 h-3 w-3" /> {PLAN_LABEL[user.plan]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {user.plan === "free" && <Button asChild><Link to="/pricing"><Crown /> Nâng cấp</Link></Button>}
              <Button variant="outline" onClick={() => { logout(); navigate({ to: "/" }); }}><LogOut /> Đăng xuất</Button>
            </div>
          </div>
        </div>

        {user.role !== "employer" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">
                <FileText className="mr-2 inline h-4 w-4" /> Đơn ứng tuyển của tôi ({myApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myApplications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Bạn chưa gửi đơn nào. <Link to="/jobs" className="text-primary underline">Khám phá việc làm →</Link>
                </p>
              )}
              {myApplications.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to="/jobs/$jobId" params={{ jobId: a.jobId }} className="truncate text-sm font-medium hover:text-primary hover:underline">
                        {a.jobTitle}
                      </Link>
                      <Badge variant={APP_STATUS_VARIANT[a.status]}>{APP_STATUS_LABEL[a.status]}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{a.company}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Gửi {new Date(a.createdAt).toLocaleString("vi-VN")}
                      </span>
                      {a.cvName && <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {a.cvName}</span>}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/jobs/$jobId" params={{ jobId: a.jobId }}>Xem job</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base"><User className="mr-2 inline h-4 w-4" /> Thông tin cá nhân</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Giới thiệu bản thân</Label>
                <Textarea className="mt-2" rows={4} placeholder="Sinh viên năm 4 ngành CNTT, đam mê Web..." value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <Label>Kỹ năng (phân cách bằng dấu phẩy)</Label>
                <Input className="mt-2" placeholder="React, Node.js, TypeScript" value={skills} onChange={(e) => setSkills(e.target.value)} />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
              <Button onClick={save}><Save /> Lưu hồ sơ</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {user.role === "employer" ? `Tin tuyển dụng đã đăng (${userJobs.length})` : "Tính năng nhanh"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.role === "employer" ? (
                <>
                  {userJobs.length === 0 && <p className="text-sm text-muted-foreground">Bạn chưa đăng tin nào.</p>}
                  {userJobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <div className="text-sm font-medium">{j.title}</div>
                        <div className="text-xs text-muted-foreground">{j.salary} · {j.type}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button asChild size="sm" variant="outline"><Link to="/jobs/$jobId" params={{ jobId: j.id }}>Xem</Link></Button>
                        <Button size="sm" variant="outline" onClick={() => { removeJob(j.id); toast.success("Đã xoá tin"); }}>Xoá</Button>
                      </div>
                    </div>
                  ))}
                  <Button asChild className="w-full" variant="outline"><Link to="/post-job">+ Đăng tin mới</Link></Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/interviews" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors group">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" /> Lịch phỏng vấn
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
                  </Link>
                  <Link to="/cv-review" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors group">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" /> AI Review CV
                      {user.plan === "free" && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded">Pro</span>}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
                  </Link>
                  <Link to="/jobs" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors group">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="h-4 w-4 text-primary" /> Tìm việc trong 2km
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
                  </Link>
                  <Link to="/chatbot" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors group">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Bot className="h-4 w-4 text-primary" /> AI Career Assistant
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}