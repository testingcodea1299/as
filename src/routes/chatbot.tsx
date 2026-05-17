import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { chatCompletion, type ChatMessage } from "@/lib/chat.functions";

export const Route = createFileRoute("/chatbot")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "AI Chatbot · WorkVerse.vn" }] }),
});

type Role = "career" | "recruiter" | "admin";

const ROLE_LABEL: Record<Role, string> = {
  career: "Trợ lý Sinh viên",
  recruiter: "Trợ lý Tuyển dụng",
  admin: "Trợ lý Quản trị",
};

const SUGGESTIONS: Record<Role, string[]> = {
  career: ["Mức lương Junior Dev tại TP.HCM 2026?", "Tìm part-time gần Q.1", "Đánh giá CV cho SV năm 4 ngành CNTT", "Lộ trình học Front-end 6 tháng", "5 câu hỏi behavior thường gặp"],
  recruiter: ["Viết JD cho vị trí Frontend Intern", "Cách lọc CV nhanh bằng AI", "Phí escrow nền tảng", "Mẫu email mời phỏng vấn", "KPI tuyển dụng tháng"],
  admin: ["Báo cáo escrow 24h", "Cảnh báo IDS hôm nay", "Quy trình xử lý dispute", "Audit log cần lưu bao lâu?", "Cách khoá user vi phạm"],
};

function ChatPage() {
  const { user } = useAuth();
  const defaultRole: Role = user?.role === "employer" ? "recruiter" : user?.role === "admin" ? "admin" : "career";
  const [role, setRole] = useState<Role>(defaultRole);
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: "assistant", content: `Xin chào${user ? ` **${user.name}**` : ""}! Mình là AI Chatbot WorkVerse (Gemini). Hỏi mình bất cứ điều gì về việc làm, tuyển dụng hay quản trị.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const callChat = useServerFn(chatCompletion);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading]);

  const roleOptions = useMemo<Role[]>(() => {
    if (!user || user.role === "admin") return ["career", "recruiter", "admin"];
    return [defaultRole];
  }, [user, defaultRole]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    const userMsg: ChatMessage = { role: "user", content: t };
    const next = [...history, userMsg];
    setHistory(next);
    setInput("");
    setLoading(true);
    try {
      const res = await callChat({ data: { role, messages: next.filter((m) => m.role !== "system") } });
      setHistory((h) => [...h, { role: "assistant", content: res.content }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "assistant", content: `Lỗi: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">AI Chatbot · Gemini Live</h1>
        <p className="text-sm text-muted-foreground">
          Gemini 2.5 Flash{" "}
          {user?.plan === "free" && <span className="text-amber-600">(Free: giới hạn cơ bản)</span>}
          {user && user.plan !== "free" && <span className="text-primary">· Gói {user.plan.toUpperCase()} ✨</span>}
        </p>

        {roleOptions.length > 1 && (
          <div className="mt-4 flex gap-2">
            {roleOptions.map((r) => (
              <Button key={r} size="sm" variant={role === r ? "default" : "outline"} onClick={() => setRole(r)}>
                {ROLE_LABEL[r]}
              </Button>
            ))}
          </div>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> {ROLE_LABEL[role]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div ref={scrollRef} className="flex h-[480px] flex-col gap-3 overflow-y-auto pr-2">
              {history.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-headings:my-2">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                  {m.role === "user" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                    <Loader2 className="inline h-4 w-4 animate-spin" /> đang soạn...
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS[role].map((s) => (
                <Badge key={s} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => send(s)}>
                  {s}
                </Badge>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <Input placeholder="Nhập câu hỏi..." value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
              <Button type="submit" disabled={loading || !input.trim()}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi"}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
