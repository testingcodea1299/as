import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/lib/jobs-store";
import { useAuth } from "@/lib/auth";
import { MapPin, Clock, Banknote, Plus, Map as MapIcon, List } from "lucide-react";
import { JobMap } from "@/components/job-map";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
  head: () => ({
    meta: [
      { title: "Việc làm trong 2km · WorkVerse.vn" },
      { name: "description", content: "Tìm việc làm part-time, full-time, freelance trong 2km quanh bạn." },
      { property: "og:title", content: "Việc làm trong 2km · WorkVerse.vn" },
      { property: "og:image", content: "https://workverse-ai-connect.lovable.app/og-image.jpg" },
    ],
  }),
});

function JobsPage() {
  const { all } = useJobs();
  const { user } = useAuth();
  const [radius, setRadius] = useState(2);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = all.filter(
    (j) =>
      j.distanceKm <= radius &&
      (q === "" ||
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        j.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()))),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Việc làm gần bạn</h1>
            <p className="text-sm text-muted-foreground">
              PostGIS <code className="rounded bg-muted px-1">jobs_within(lng, lat, radius_m)</code> · auto-matching theo skill.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center rounded-md border border-border p-0.5">
              <Button size="sm" variant={view === "list" ? "default" : "ghost"} onClick={() => setView("list")}><List /> Danh sách</Button>
              <Button size="sm" variant={view === "map" ? "default" : "ghost"} onClick={() => setView("map")}><MapIcon /> Bản đồ</Button>
            </div>
            {user?.role === "employer" && (
              <Button asChild><Link to="/post-job"><Plus /> Đăng tin</Link></Button>
            )}
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tìm theo kỹ năng / chức danh</label>
              <Input placeholder="React, UI/UX, Pha chế..." value={q} onChange={(e) => setQ(e.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Bán kính: <span className="text-primary">{radius} km</span></label>
              <Slider value={[radius]} onValueChange={(v) => setRadius(v[0])} min={0.5} max={5} step={0.1} className="mt-4" />
            </div>
          </CardContent>
        </Card>

        {view === "map" && (
          <div className="mt-6">
            <JobMap jobs={filtered} radiusKm={radius} />
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="space-y-3 pt-6">
                <Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/3" />
              </CardContent></Card>
            ))
          ) : (
            <>
              {filtered.map((j) => (
                <Link key={j.id} to="/jobs/$jobId" params={{ jobId: j.id }}>
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{j.title}</CardTitle>
                        <Badge variant={j.type === "Freelance" ? "default" : "secondary"}>{j.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{j.company}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {j.location} · {j.distanceKm} km</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Banknote className="h-4 w-4" /> {j.salary}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {j.postedAt}</div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {j.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs text-muted-foreground">Bấm để xem chi tiết & ứng tuyển</span>
                        <span className="text-sm font-medium text-primary">Xem chi tiết →</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">Không có job nào trong bán kính này.</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
