import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
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
      toast.error("Vui lòng đăng nhập để ứng tuyển");
      navigate({ to: "/login" });
      return;
    }
    if (user.role !== "student") {
      toast.error("Chỉ tài khoản sinh viên mới ứng tuyển được");
      return;
    }
    toast.success("Đã gửi đơn ứng tuyển! NTD sẽ phản hồi trong 3-5 ngày.");
    pushNotification({ type: "success", title: "Đã ứng tuyển", description: `${job.title} · ${job.company}`, link: `/jobs/${job.id}` });
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
              <CardContent className="space-y-3 text-sm leading-relaxed">
                <p>
                  {job.company} đang tìm kiếm <b>{job.title}</b> làm việc tại {job.location}.
                  Đây là cơ hội tốt cho sinh viên muốn tích luỹ kinh nghiệm thực tế và xây dựng portfolio chuyên nghiệp.
                </p>
                <div>
                  <h3 className="mb-1 font-semibold">Trách nhiệm chính</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Phối hợp với team thực hiện công việc theo yêu cầu dự án</li>
                    <li>Đảm bảo deadline và chất lượng đầu ra</li>
                    <li>Tham gia review, đề xuất cải tiến quy trình</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Yêu cầu</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Thành thạo: {job.skills.join(", ")}</li>
                    <li>Tinh thần học hỏi, giao tiếp tốt</li>
                    <li>Ưu tiên SV năm 3-4 hoặc đã có 1 dự án thực tế</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Quyền lợi</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Mức {job.type === "Freelance" ? "thù lao" : "lương"}: {job.salary}</li>
                    <li>Mentor 1-1 trong 3 tháng đầu</li>
                    <li>Thanh toán an toàn qua Escrow của WorkVerse</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Banknote className="h-4 w-4 text-primary" /> {job.salary}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={apply}><CheckCircle2 /> Ứng tuyển ngay</Button>
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
    </div>
  );
}
