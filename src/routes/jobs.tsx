import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useJobs } from "@/lib/jobs-store";
import { useAuth } from "@/lib/auth";
import { MapPin, Clock, Banknote, Plus } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
  head: () => ({ meta: [{ title: "Việc làm trong 2km · WorkVerse.vn" }] }),
});

function JobsPage() {
  const { all } = useJobs();
  const { user } = useAuth();
  const [radius, setRadius] = useState(2);
  const [q, setQ] = useState("");
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
          {user?.role === "employer" && (
            <Button asChild><Link to="/post-job"><Plus /> Đăng tin mới</Link></Button>
          )}
        </div>

        <Card className="mt-6">
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tìm theo kỹ năng / chức danh</label>
              <Input
                placeholder="React, UI/UX, Pha chế..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Bán kính: <span className="text-primary">{radius} km</span>
              </label>
              <Slider
                value={[radius]}
                onValueChange={(v) => setRadius(v[0])}
                min={0.5}
                max={5}
                step={0.1}
                className="mt-4"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((j) => (
            <Card key={j.id} className="transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{j.title}</CardTitle>
                  <Badge variant={j.type === "Freelance" ? "default" : "secondary"}>{j.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{j.company}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {j.location} · {j.distanceKm} km
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Banknote className="h-4 w-4" /> {j.salary}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {j.postedAt}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {j.skills.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">Không có job nào trong bán kính này.</p>
          )}
        </div>
      </main>
    </div>
  );
}
