import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Bot, Wallet, ShieldCheck, MapPin, Sparkles, ArrowRight, CheckCircle2, Star, Building2, GraduationCap, Banknote, TrendingUp } from "lucide-react";
import { MOCK_JOBS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "WorkVerse.vn — Việc làm Sinh viên, Freelance & Escrow Fintech" },
      { name: "description", content: "Nền tảng kết nối việc làm part-time/freelance trong 2km, ký quỹ minh bạch và AI Chatbot Gemini hỗ trợ sinh viên & doanh nghiệp Việt Nam." },
    ],
  }),
});

const FEATURES = [
  { icon: MapPin, title: "Việc làm 2km", desc: "Định vị PostGIS, ưu tiên việc gần trường/nhà trọ.", to: "/jobs" as const },
  { icon: Bot, title: "AI Chatbot Gemini", desc: "Trợ lý nghề nghiệp / tuyển dụng / quản trị 24/7.", to: "/chatbot" as const },
  { icon: Wallet, title: "Escrow minh bạch", desc: "Ký quỹ theo milestone, giải ngân tự động khi nghiệm thu.", to: "/escrow" as const },
  { icon: ShieldCheck, title: "Bảo mật & Audit", desc: "Lưu vết 7 năm, IDS phát hiện bất thường thời gian thực.", to: "/admin" as const },
];

const STATS = [
  { value: "12,4K+", label: "Sinh viên đang dùng" },
  { value: "850+", label: "Doanh nghiệp & startup" },
  { value: "₫4.6 tỷ", label: "Đã ký quỹ an toàn" },
  { value: "2%", label: "Phí nền tảng (Pro 1.5%)" },
];

const STEPS = [
  { n: "01", t: "Tạo hồ sơ & xác minh", d: "SV xác minh thẻ SV, doanh nghiệp xác minh GPKD trong 2 phút." },
  { n: "02", t: "Match việc bằng AI", d: "Gemini gợi ý việc/ứng viên dựa trên kỹ năng và bán kính 2km." },
  { n: "03", t: "Ký hợp đồng & nạp Escrow", d: "Tiền giữ tại nền tảng, chia milestone rõ ràng." },
  { n: "04", t: "Bàn giao & nhận tiền", d: "Nghiệm thu xong, giải ngân trong 24h. Tranh chấp xử lý <72h." },
];

const TESTIMONIALS = [
  { name: "Minh Anh", role: "SV năm 4 · UEH", quote: "Mình tìm được job freelance đầu tiên cách nhà 1.2km, được trả tiền đúng hạn qua Escrow." },
  { name: "Anh Tuấn", role: "Founder Startup ABC", quote: "Tuyển intern UI/UX trong 3 ngày, AI lọc CV giúp tiết kiệm 80% thời gian." },
  { name: "Quỳnh Như", role: "SV ĐH Bách Khoa", quote: "Chatbot tư vấn lộ trình rất chi tiết, mock interview thật sự hữu ích." },
];

function Home() {
  const featured = MOCK_JOBS.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Badge variant="outline" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Mới · AI Gemini Live + Escrow Fintech
              </Badge>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
                Việc làm sinh viên,<br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  thanh toán an toàn.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                WorkVerse.vn kết nối sinh viên với việc part-time, freelance trong bán kính 2km.
                Mọi giao dịch đều bảo vệ bằng <b className="text-foreground">Escrow milestone</b> và hỗ trợ bởi <b className="text-foreground">AI Gemini</b>.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link to="/jobs"><Briefcase /> Tìm việc ngay <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                  <Link to="/chatbot"><Bot /> Trò chuyện với AI</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Xác minh CCCD/GPKD</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Hoàn tiền 100%</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
              <Card className="border-2 shadow-xl">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium"><Bot className="h-4 w-4 text-primary" /> AI Gợi ý hôm nay</div>
                    <Badge variant="secondary" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {featured.map((j) => (
                    <Link key={j.id} to="/jobs/$jobId" params={{ jobId: j.id }} className="block rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-accent/40">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{j.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{j.company} · {j.distanceKm}km</div>
                        </div>
                        <Badge variant={j.type === "Freelance" ? "default" : "secondary"} className="text-[10px]">{j.type}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-primary">{j.salary}</span>
                        <span className="text-muted-foreground">{j.postedAt}</span>
                      </div>
                    </Link>
                  ))}
                  <Button asChild variant="ghost" size="sm" className="w-full"><Link to="/jobs">Xem tất cả <ArrowRight /></Link></Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline">Tính năng cốt lõi</Badge>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Đầy đủ công cụ cho 3 vai trò</h2>
            <p className="mt-2 text-muted-foreground">Sinh viên · Nhà tuyển dụng · Quản trị viên — mỗi vai trò có không gian riêng tối ưu trải nghiệm.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, to }) => (
              <Link key={to} to={to} className="group">
                <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
                  <CardHeader>
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-3 text-base">{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-10 max-w-2xl">
              <Badge variant="outline">Quy trình</Badge>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">4 bước để bắt đầu</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="relative rounded-2xl border border-border bg-background p-5">
                  <div className="text-3xl font-bold text-primary/30">{s.n}</div>
                  <div className="mt-2 font-semibold">{s.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Cho Sinh viên", points: ["Việc gần trong 2km", "Mentor 1-1 (Premium)", "Đánh giá CV bằng AI"], cta: "Xem việc", to: "/jobs" as const },
              { icon: Building2, title: "Cho Doanh nghiệp", points: ["Đăng tin & lọc AI", "Escrow phí ưu đãi", "Báo cáo tuyển dụng"], cta: "Đăng tin", to: "/post-job" as const },
              { icon: ShieldCheck, title: "Cho Quản trị", points: ["Audit log 7 năm", "IDS impossible-travel", "Giám sát Escrow"], cta: "Bảng điều khiển", to: "/admin" as const },
            ].map((a) => (
              <Card key={a.title} className="flex flex-col">
                <CardHeader>
                  <a.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="mt-2">{a.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm">
                  {a.points.map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {p}
                    </div>
                  ))}
                  <Button asChild variant="outline" className="mt-4 w-full"><Link to={a.to}>{a.cta} <ArrowRight /></Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-y border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <Badge variant="outline">Cộng đồng</Badge>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Người dùng nói gì</h2>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                <span className="ml-2 text-sm text-muted-foreground">4.9/5 · 2,300 đánh giá</span>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <Card key={t.name}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">"{t.quote}"</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{t.name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/70 p-10 text-primary-foreground sm:p-14">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Sẵn sàng tăng tốc sự nghiệp?</h2>
                <p className="mt-3 max-w-xl opacity-90">Đăng ký miễn phí — không cần thẻ. Nâng cấp Pro chỉ 99k/tháng để mở khoá AI không giới hạn và Escrow ưu đãi.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary" className="h-12 px-6"><Link to="/register">Đăng ký miễn phí</Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/pricing"><TrendingUp /> Xem các gói</Link></Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded bg-primary text-primary-foreground">W</span>
              © 2026 WorkVerse.vn — Hệ sinh thái Việc làm & Fintech cho SV Việt Nam.
            </div>
            <div className="flex gap-4">
              <Link to="/jobs">Việc làm</Link>
              <Link to="/pricing">Gói</Link>
              <Link to="/chatbot">AI</Link>
              <span className="inline-flex items-center gap-1"><Banknote className="h-3 w-3" /> Escrow phí 2%</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
