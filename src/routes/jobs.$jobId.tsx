import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { ApplyDialog } from "@/components/apply-dialog";
import { useApplications, APP_STATUS_LABEL } from "@/lib/applications-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/lib/jobs-store";
import { useAuth } from "@/lib/auth";
import { pushNotification } from "@/lib/notifications";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Banknote, Clock, Building2, CheckCircle2, Bot } from "lucide-react";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetailPage,
  head: ({ params }) => ({ meta: [{ title: `Việc làm ${params.jobId} · WorkVerse.vn` }] }),
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const { all } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const job = all.find((j) => j.id === jobId);
  const [applyOpen, setApplyOpen] = useState(false);
  const { hasApplied, items } = useApplications(user?.email);
  const myApp = job ? items.find((a) => a.jobId === job.id) : undefined;

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-xl font-bold">Không tìm thấy việc làm</h1>
          <Button asChild className="mt-4"><Link to="/jobs">Về danh sách việc</Link></Button>
        </main>
      </div>
    );
  }

  const apply = () => {
    if (!user) {
      toast.message("Bạn cần đăng nhập / đăng ký để ứng tuyển", {
        description: "Chuyển tới trang đăng ký…",
        action: { label: "Đăng nhập", onClick: () => navigate({ to: "/login" }) },
      });
      navigate({ to: "/register" });
      return;
    }
    if (user.role === "employer") {
      toast.error("Tài khoản Nhà tuyển dụng không thể ứng tuyển. Hãy dùng tài khoản Ứng viên.");
      return;
    }
    if (hasApplied(job!.id)) {
      toast.message("Bạn đã ứng tuyển job này. Xem trạng thái trong Hồ sơ.", {
        action: { label: "Xem Hồ sơ", onClick: () => navigate({ to: "/profile" }) },
      });
      return;
    }
    setApplyOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Button asChild variant="ghost" size="sm"><Link to="/jobs"><ArrowLeft /> Quay lại</Link></Button>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-background p-6">
              <Badge variant={job.type === "Freelance" ? "default" : "secondary"}>{job.type}</Badge>
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{job.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.company}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location} · {job.distanceKm} km</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {job.postedAt}</span>
              </div>
            </div>

            <Card className="mt-6">
              <CardHeader><CardTitle className="text-base">Mô tả công việc</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p className="text-muted-foreground">
                  {job.description ?? `${job.company} đang tìm kiếm ${job.title} làm việc tại ${job.location}.`}
                </p>
                <div>
                  <h3 className="mb-1.5 font-semibold">Trách nhiệm chính</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {(job.responsibilities ?? [
                      "Phối hợp với team thực hiện công việc theo yêu cầu dự án",
                      "Đảm bảo deadline và chất lượng đầu ra",
                    ]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold">Yêu cầu ứng viên</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {(job.requirements ?? [`Thành thạo: ${job.skills.join(", ")}`, "Tinh thần học hỏi, giao tiếp tốt"]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold">Quyền lợi</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {(job.benefits ?? [`Mức ${job.type === "Freelance" ? "thù lao" : "lương"}: ${job.salary}`, "Thanh toán an toàn qua Escrow WorkVerse"]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
                  {job.workingHours && (<div><div className="text-xs font-medium text-muted-foreground">Thời gian làm việc</div><div>{job.workingHours}</div></div>)}
                  {job.deadline && (<div><div className="text-xs font-medium text-muted-foreground">Hạn nộp hồ sơ</div><div>{job.deadline}</div></div>)}
                  {job.contactEmail && (<div className="sm:col-span-2"><div className="text-xs font-medium text-muted-foreground">Liên hệ</div><div>{job.contactEmail}</div></div>)}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Banknote className="h-4 w-4 text-primary" /> {job.salary}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {myApp ? (
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                    <div className="font-medium text-primary">Đã ứng tuyển</div>
                    <div className="text-xs text-muted-foreground">Trạng thái: {APP_STATUS_LABEL[myApp.status]}</div>
                    <Button asChild size="sm" variant="link" className="h-auto p-0"><Link to="/profile">Xem tiến trình →</Link></Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={apply}><CheckCircle2 /> Ứng tuyển ngay</Button>
                )}
                <Button asChild variant="outline" className="w-full"><Link to="/chatbot"><Bot /> Hỏi AI về job này</Link></Button>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {job.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Thanh toán an toàn</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Khoản tiền được giữ tại Escrow đến khi bạn bàn giao thành công. Phí 2% (Pro 1.5% / Premium 1%).
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      {job && <ApplyDialog open={applyOpen} onOpenChange={setApplyOpen} job={{ id: job.id, title: job.title, company: job.company }} />}
    </div>
  );
}
