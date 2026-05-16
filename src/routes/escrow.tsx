import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_ESCROW, type Milestone } from "@/lib/mock-data";
import { pushNotification } from "@/lib/notifications";
import { CheckCircle2, Clock, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/escrow")({
  component: EscrowPage,
  head: () => ({ meta: [{ title: "Ký quỹ Escrow · WorkVerse.vn" }] }),
});

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const STATUS_META: Record<Milestone["status"], { label: string; icon: typeof Lock; cls: string }> = {
  funded: { label: "Đã ký quỹ", icon: Lock, cls: "bg-blue-500/10 text-blue-600" },
  submitted: { label: "Đã nộp bài", icon: Clock, cls: "bg-amber-500/10 text-amber-600" },
  released: { label: "Đã giải ngân", icon: CheckCircle2, cls: "bg-green-500/10 text-green-600" },
  disputed: { label: "Tranh chấp", icon: AlertCircle, cls: "bg-red-500/10 text-red-600" },
};

const STORAGE_KEY = "workverse.escrow.milestones";

function loadMs(): Milestone[] {
  if (typeof window === "undefined") return MOCK_ESCROW.milestones;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : MOCK_ESCROW.milestones;
  } catch { return MOCK_ESCROW.milestones; }
}

function EscrowPage() {
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_ESCROW.milestones);
  useEffect(() => { setMilestones(loadMs()); }, []);

  const persist = (ms: Milestone[]) => {
    setMilestones(ms);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ms));
  };

  const releasedSum = milestones.filter((m) => m.status === "released").reduce((s, m) => s + m.amount, 0);
  const progress = (releasedSum / MOCK_ESCROW.totalVnd) * 100;

  const advance = (id: string) => {
    const m = milestones.find((x) => x.id === id);
    if (!m) return;
    const next: Milestone["status"] = m.status === "funded" ? "submitted" : m.status === "submitted" ? "released" : m.status;
    persist(milestones.map((x) => (x.id === id ? { ...x, status: next } : x)));
    if (next === "submitted") {
      toast.success(`Đã nộp bài "${m.title}"`);
      pushNotification({ type: "info", title: "Đã nộp milestone", description: m.title });
    } else if (next === "released") {
      toast.success(`Giải ngân ${fmt(m.amount)} cho "${m.title}"`);
      pushNotification({ type: "success", title: "Giải ngân thành công", description: `${m.title} · ${fmt(m.amount)}` });
    }
  };

  const dispute = (id: string) => {
    const m = milestones.find((x) => x.id === id);
    persist(milestones.map((x) => (x.id === id ? { ...x, status: "disputed" } : x)));
    if (m) pushNotification({ type: "warning", title: "Mở tranh chấp", description: m.title });
    toast.error("Đã mở tranh chấp · Admin sẽ xử lý trong 24h");
  };

  const reset = () => {
    persist(MOCK_ESCROW.milestones);
    toast("Đã reset milestone");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Hợp đồng ký quỹ</h1>
            <p className="text-sm text-muted-foreground">
              State machine: <code className="rounded bg-muted px-1">funded → submitted → released</code> · phí 2%.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={reset}>Reset demo</Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>{MOCK_ESCROW.contractId}</CardTitle>
                <CardDescription>{MOCK_ESCROW.client} → {MOCK_ESCROW.freelancer}</CardDescription>
              </div>
              <Badge variant="outline">2% phí: {fmt(MOCK_ESCROW.feeVnd)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Tiến độ giải ngân</span>
                <span className="font-medium">{fmt(releasedSum)} / {fmt(MOCK_ESCROW.totalVnd)}</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-3">
          {milestones.map((m, i) => {
            const meta = STATUS_META[m.status];
            const Icon = meta.icon;
            const canAdvance = m.status === "funded" || m.status === "submitted";
            return (
              <Card key={m.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${meta.cls}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Milestone {i + 1}: {m.title}</div>
                      <div className="text-sm text-muted-foreground">{fmt(m.amount)} · {meta.label}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canAdvance && (
                      <Button size="sm" onClick={() => advance(m.id)}>
                        {m.status === "funded" ? "Nộp bài" : "Duyệt giải ngân"}
                      </Button>
                    )}
                    {m.status !== "released" && m.status !== "disputed" && (
                      <Button size="sm" variant="outline" onClick={() => dispute(m.id)}>Tranh chấp</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
