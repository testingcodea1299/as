import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Bot, Wallet, ShieldCheck, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "WorkVerse.vn — Hệ sinh thái Việc làm Sinh viên, Freelance & Fintech" },
      { name: "description", content: "Kết nối việc làm part-time, freelance trong bán kính 2km, ký quỹ minh bạch và AI Chatbot RAG đa vai trò." },
    ],
  }),
});

const FEATURES = [
  { icon: MapPin, title: "Tìm việc trong 2km", desc: "PostGIS định vị, gợi ý việc gần trường/nhà trọ.", to: "/jobs" },
  { icon: Bot, title: "AI Chatbot RAG", desc: "Career / Recruiter / Admin với Gemini + pgvector.", to: "/chatbot" },
  { icon: Wallet, title: "Ký quỹ minh bạch", desc: "Escrow theo milestone, phí 2%, giải ngân tự động.", to: "/escrow" },
  { icon: ShieldCheck, title: "Audit & IDS", desc: "Lưu vết 7 năm, cảnh báo impossible travel.", to: "/admin" },
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> MVP demo · Next.js + FastAPI + PostGIS + pgvector
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Việc làm sinh viên, Freelance & Fintech<br />
            <span className="text-primary">trong cùng một hệ sinh thái.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            WorkVerse.vn kết hợp tìm việc theo định vị 2km, ký quỹ milestone minh bạch
            và AI Chatbot RAG đa vai trò để hỗ trợ sinh viên, nhà tuyển dụng và admin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/jobs"><Briefcase /> Tìm việc gần đây</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/chatbot"><Bot /> Hỏi AI Chatbot</Link>
            </Button>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc, to }) => (
            <Link key={to} to={to} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardHeader>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 text-base">{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Kiến trúc MVP</CardTitle>
              <CardDescription>Stack đề xuất theo yêu cầu kỹ thuật</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">{`┌──────────────┐    ┌────────────────┐    ┌───────────────────────────┐
│ Next.js 14   │───▶│ FastAPI / Nest │───▶│ PostgreSQL + PostGIS      │
│ App Router   │    │ JWT + RBAC     │    │ + pgvector (RAG)          │
└──────────────┘    └───────┬────────┘    └───────────────────────────┘
                            │
                ┌───────────┴────────────┐
                ▼                        ▼
        ┌───────────────┐       ┌──────────────────┐
        │ Gemini (LLM)  │       │ Escrow Wallet    │
        │ Tool calling  │       │ Milestone state  │
        └───────────────┘       └──────────────────┘`}</pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>4 Job mẫu seeded</CardTitle>
              <CardDescription>Sinh từ 02_seed.sql</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>• Full-time · FPT Software</div>
              <div>• Part-time · Highlands Coffee</div>
              <div>• Freelance · UI/UX</div>
              <div>• Freelance · Content</div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
