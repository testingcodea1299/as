import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
// Import từ chat.functions — cùng file với chatCompletion (đã hoạt động)
import { reviewCV, type CVReviewResult } from "@/lib/chat.functions";
import { toast } from "sonner";
import {
  Crown, Lock, Loader2, Bot, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, FileText, Lightbulb, Target, Sparkles,
  RefreshCw, Copy, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/cv-review")({
  component: CVReviewPage,
  head: () => ({ meta: [{ title: "AI Review CV · WorkVerse.vn" }] }),
});

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = ((score / 10) * 100 / 100) * circ;
  const color = score >= 8 ? "#639922" : score >= 6 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {score >= 8 ? "CV xuất sắc 🎉" : score >= 6 ? "CV khá tốt 👍" : score >= 4 ? "Cần cải thiện ⚠️" : "Cần viết lại ❌"}
      </p>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ s }: { s: CVReviewResult["sections"][0] }) {
  const [open, setOpen] = useState(s.rating !== "tốt");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!s.rewritten) return;
    navigator.clipboard.writeText(s.rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const badgeClass =
    s.rating === "tốt" ? "bg-green-100 text-green-700 border-green-200" :
    s.rating === "ổn"  ? "bg-amber-100 text-amber-700 border-amber-200" :
    "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
            {s.rating === "tốt" ? "✓ Tốt" : s.rating === "ổn" ? "~ Ổn" : "✗ Yếu"}
          </span>
          <span className="font-medium text-sm">{s.name}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          <p className="text-sm text-muted-foreground">{s.feedback}</p>
          {s.rewritten && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Gợi ý cải thiện
                </span>
                <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied
                    ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Đã sao chép</>
                    : <><Copy className="h-3.5 w-3.5" /> Sao chép</>}
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{s.rewritten}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Kết quả ───────────────────────────────────────────────────────────────────

function ReviewResult({ result, onReset }: { result: CVReviewResult; onReset: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start gap-8">
            <ScoreRing score={result.score} />
            <div className="flex-1 min-w-0 space-y-3">
              <p className="text-base font-medium">{result.summary}</p>
              {result.keywords.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">💡 Từ khoá ATS nên thêm vào CV:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.map((k) => (
                      <Badge key={k} variant="outline" className="text-xs border-primary/30 text-primary">+ {k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Điểm mạnh ({result.strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" /> Điểm yếu ({result.weaknesses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">✗</span> {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Phân tích từng mục
        </h2>
        <div className="space-y-2">
          {result.sections.map((s) => <SectionCard key={s.name} s={s} />)}
        </div>
      </div>

      {result.overallTips.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
              <Lightbulb className="h-4 w-4" /> Mẹo tổng thể
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.overallTips.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="flex-shrink-0 mt-0.5">💡</span> {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" className="w-full" onClick={onReset}>
        <RefreshCw className="h-4 w-4" /> Phân tích lại với CV khác
      </Button>
    </div>
  );
}

// ── Form nhập CV ──────────────────────────────────────────────────────────────

function CVForm({ onResult }: { onResult: (r: CVReviewResult) => void }) {
  const [cvText, setCvText] = useState("");
  const [jobTarget, setJobTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const callReview = useServerFn(reviewCV);

  const steps = ["Đang đọc CV...", "Phân tích từng mục...", "Đánh giá điểm mạnh & yếu...", "Viết gợi ý cải thiện...", "Hoàn thiện kết quả..."];

  const submit = async () => {
    if (cvText.trim().length < 50) { toast.error("CV quá ngắn — hãy dán đầy đủ nội dung CV"); return; }
    setLoading(true);
    let step = 0;
    setProgress(steps[0]);
    const interval = setInterval(() => { step = Math.min(step + 1, steps.length - 1); setProgress(steps[step]); }, 1800);
    try {
      const res = await callReview({ data: { cvText: cvText.trim(), jobTarget: jobTarget.trim() || undefined } });
      clearInterval(interval);
      if (!res.ok) { toast.error(res.error); return; }
      onResult(res.result);
    } catch { toast.error("Có lỗi xảy ra. Vui lòng thử lại."); }
    finally { clearInterval(interval); setLoading(false); setProgress(""); }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" /> Vị trí ứng tuyển mục tiêu
          <span className="text-xs text-muted-foreground font-normal">(tuỳ chọn)</span>
        </Label>
        <Input
          placeholder="Vd: Lập trình viên React, Marketing, Barista part-time..."
          value={jobTarget}
          onChange={(e) => setJobTarget(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Nội dung CV
          <span className="text-xs text-muted-foreground font-normal">(dán từ Word / Google Docs)</span>
        </Label>
        <Textarea
          rows={14}
          placeholder={`Dán toàn bộ nội dung CV vào đây. Ví dụ:\n\nNGUYỄN VĂN A\nnguyenvana@email.com | 0912345678\n\nMỤC TIÊU NGHỀ NGHIỆP\nSinh viên năm 4 CNTT tìm kiếm vị trí Frontend...\n\nHỌC VẤN\n2021-2025 | ĐH Bách Khoa | GPA 3.4\n\nKỸ NĂNG\nReact, TypeScript, Node.js...`}
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          className="font-mono text-xs resize-none"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{cvText.length} ký tự</span>
          <span className={cvText.length < 50 ? "text-red-400" : "text-green-600"}>
            {cvText.length < 50 ? `Cần thêm ${50 - cvText.length} ký tự` : "Đủ để phân tích ✓"}
          </span>
        </div>
      </div>

      <Button className="w-full h-11 text-base" onClick={submit} disabled={loading || cvText.trim().length < 50}>
        {loading
          ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">{progress}</span></div>
          : <><Sparkles className="h-5 w-5" /> Phân tích CV bằng Gemini AI</>}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Phân tích trong ~10-15 giây · Kết quả không lưu sau khi tải lại trang
      </p>
    </div>
  );
}

// ── Trang chính ───────────────────────────────────────────────────────────────

function CVReviewPage() {
  const { user } = useAuth();
  const isPro = !!user && user.plan !== "free";
  const [result, setResult] = useState<CVReviewResult | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại hồ sơ
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> AI Review CV
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gemini phân tích CV — chấm điểm, chỉ ra điểm yếu và viết lại từng mục
              </p>
            </div>
            <Badge variant={isPro ? "default" : "outline"} className="flex-shrink-0">
              {isPro ? <><Crown className="h-3 w-3 mr-1" />Pro</> : "Free"}
            </Badge>
          </div>
        </div>

        {!isPro ? (
          <Card className="border-dashed">
            <CardContent className="py-14 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tính năng dành cho gói Pro</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Nâng cấp Pro để AI phân tích CV chuyên sâu, chấm điểm từng mục và viết lại phần yếu cho bạn.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                {["Chấm điểm 0–10", "Phân tích từng mục", "Gợi ý cải thiện", "Từ khoá ATS"].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {f}
                  </span>
                ))}
              </div>
              <Button asChild size="lg" className="mt-2">
                <Link to="/pricing">
                  <Crown className="h-4 w-4" /> Nâng cấp Pro — chỉ 20.000₫/tháng
                </Link>
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link> hoặc{" "}
                  <Link to="/register" className="text-primary hover:underline">đăng ký</Link> trước
                </p>
              )}
            </CardContent>
          </Card>
        ) : result ? (
          <ReviewResult result={result} onReset={() => setResult(null)} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Nhập nội dung CV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CVForm onResult={setResult} />
            </CardContent>
          </Card>
        )}

        {isPro && !result && (
          <Card className="mt-4 border-dashed">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">💡 Mẹo để có kết quả tốt nhất</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Dán <strong>toàn bộ CV</strong> — càng đầy đủ AI phân tích càng chính xác</li>
                <li>• Nhập <strong>vị trí mục tiêu</strong> để AI tập trung vào kỹ năng phù hợp</li>
                <li>• Hỗ trợ CV tiếng Việt và tiếng Anh</li>
                <li>• Copy phần "Gợi ý cải thiện" trước khi thoát trang</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}