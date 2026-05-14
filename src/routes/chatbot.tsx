import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Wrench, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/chatbot")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "AI Chatbot RAG · WorkVerse.vn" }] }),
});

type Role = "career" | "recruiter" | "admin";
type Msg = { from: "user" | "bot"; text: string; tool?: string };

type Rule = { keys: string[]; tool?: string; reply: string };

const RULES: Record<Role, Rule[]> = {
  career: [
    { keys: ["part-time", "part time", "parttime", "bán thời gian"], tool: "find_nearby_jobs(type='Part-time', radius=2km)",
      reply: "Tìm thấy 4 việc Part-time gần bạn:\n\n• **Highlands Coffee** — Pha chế · 1.2 km · 28k/giờ\n• **The Coffee House** — Phục vụ · 0.9 km · 25k/giờ\n• **Circle K** — Thu ngân ca tối · 1.5 km · 30k/giờ\n• **GS25** — Bán hàng · 1.8 km · 27k/giờ\n\nBạn muốn ứng tuyển việc nào?" },
    { keys: ["full-time", "fulltime", "toàn thời gian"], tool: "find_nearby_jobs(type='Full-time')",
      reply: "Việc Full-time đang tuyển:\n\n• **FPT Software** — Web Developer · 12-18tr · Q.7\n• **VNG** — Backend Java · 15-25tr · Q.10\n• **Tiki** — Data Analyst · 14-20tr · Q.4\n\nGợi ý: hồ sơ của bạn phù hợp 87% với FPT Software." },
    { keys: ["freelance", "tự do", "remote"], tool: "find_nearby_jobs(type='Freelance')",
      reply: "Dự án Freelance hot:\n\n• UI/UX Landing — Startup ABC · 5tr · 2 tuần\n• Content Marketing — Agency XYZ · 300k/bài\n• Dịch thuật EN→VI · 150k/1000 từ\n• Mobile App React Native · 25tr · 6 tuần\n\nMình có thể giúp bạn lọc theo kỹ năng — bạn giỏi gì nhất?" },
    { keys: ["cv", "hồ sơ", "resume"], tool: "analyze_cv()",
      reply: "**Phân tích CV của bạn:**\n\n✅ Điểm mạnh: React, TypeScript, có 2 dự án thực tế\n⚠️ Cần cải thiện:\n  • Thêm metric đo lường (tăng X%, giảm Y giờ...)\n  • Mô tả vai trò cụ thể trong team\n  • Bổ sung chứng chỉ (AWS Cloud Practitioner / Google UX)\n\nĐiểm CV: **7.4/10** — đã sẵn sàng nộp Pro." },
    { keys: ["lương", "salary", "mức lương", "thu nhập"],
      reply: "**Mức lương sinh viên năm cuối tại TP.HCM (2026):**\n\n• Intern Dev: 3-6 triệu\n• Junior Dev: 8-15 triệu\n• Junior Designer: 7-12 triệu\n• Junior Marketer: 7-10 triệu\n• Pha chế part-time: 25-35k/giờ\n\nMuốn so sánh theo vị trí cụ thể nào?" },
    { keys: ["phỏng vấn", "interview"],
      reply: "**Mẹo phỏng vấn cho sinh viên:**\n\n1. Nghiên cứu trước về công ty (sản phẩm, văn hoá)\n2. Chuẩn bị STAR cho 3 câu hỏi behavior\n3. Ôn data structure cơ bản (array, hash, tree)\n4. Hỏi ngược: lộ trình phát triển, mentor\n5. Gửi thank-you email trong 24h\n\nMuốn mock interview với mình không?" },
    { keys: ["kỹ năng", "skill", "học gì"],
      reply: "**Top kỹ năng tuyển dụng năm 2026:**\n\n🔥 Tech: React/Next.js, Python, SQL, AWS, Prompt Engineering\n🎨 Design: Figma, Motion, AI tools (Midjourney, Runway)\n📊 Business: Data analysis, SEO, Performance Marketing\n💬 Soft: English B2+, Communication, Time management\n\nBạn đang học ngành gì? Mình gợi ý lộ trình cụ thể." },
    { keys: ["nộp đơn", "ứng tuyển", "apply"], tool: "submit_application()",
      reply: "Để nộp đơn nhanh:\n1. Vào trang **Việc làm 2km**, chọn job\n2. Bấm 'Ứng tuyển' — CV tự gắn từ profile\n3. Theo dõi trạng thái tại **Hợp đồng của tôi**\n\nNTD thường phản hồi trong 3-5 ngày làm việc." },
  ],
  recruiter: [
    { keys: ["ứng viên", "candidate", "lọc"], tool: "filter_candidates(skill='React', score>=7)",
      reply: "**12 ứng viên phù hợp:**\n\n• Nguyễn V.A — 8.4đ — React/Node, 2 năm KN\n• Trần T.B — 7.9đ — Verified CV, BKHN\n• Lê V.C — 7.2đ — SV năm 4, có dự án thực tế\n• Phạm M.D — 7.0đ — Freelancer, 8 dự án\n\nGửi lời mời phỏng vấn hàng loạt? (Pro+)" },
    { keys: ["jd", "job description", "tin tuyển"],
      reply: "**Template JD chuẩn:**\n\n📌 Tiêu đề rõ ràng (vị trí + level)\n📋 3-5 trách nhiệm chính (action verb)\n✅ Yêu cầu must-have / nice-to-have tách riêng\n💰 Mức lương range cụ thể (tăng 40% click)\n🎁 Benefits: WFH, BHYT, learning budget\n\nMuốn mình viết JD cho vị trí cụ thể nào?" },
    { keys: ["escrow", "ký quỹ", "thanh toán"], tool: "escrow_status()",
      reply: "**Tình trạng escrow của bạn:**\n\n• 3 hợp đồng đang active — tổng 28.5tr VND\n• 1 milestone chờ approve (ESC-0042-M2: 2tr)\n• Phí nền tảng: 2% (Pro: 1.5%, Premium: 1%)\n\nVào /escrow để xem chi tiết." },
    { keys: ["báo cáo", "report", "thống kê"],
      reply: "**Báo cáo tuyển dụng tháng này:**\n\n• 3 tin đã đăng — 142 lượt xem\n• 28 ứng viên nộp — tỉ lệ qua sàng lọc 32%\n• 4 phỏng vấn — 1 offer chấp nhận\n• Time-to-hire trung bình: 18 ngày\n\nXem chi tiết tại Dashboard NTD." },
    { keys: ["chi phí", "phí", "cost"],
      reply: "**Chi phí dùng nền tảng:**\n\n• Đăng tin: Free 1 tin/tháng, Pro 20 tin, Premium ∞\n• Phí escrow: 2% / 1.5% (Pro) / 1% (Premium)\n• Lọc AI ứng viên: chỉ Pro+\n\nNâng cấp Pro chỉ 99k/tháng — vào /pricing." },
    { keys: ["phỏng vấn", "interview"],
      reply: "**Tip phỏng vấn sinh viên hiệu quả:**\n\n1. Hỏi project thực tế hơn là lý thuyết\n2. Live coding 30 phút (LeetCode Easy/Medium)\n3. Đánh giá learning ability > kinh nghiệm\n4. Hỏi mong muốn lộ trình 1-3 năm\n\nMuốn mình tạo bộ câu hỏi mẫu không?" },
  ],
  admin: [
    { keys: ["báo cáo", "24h", "dashboard", "kpi"], tool: "admin_dashboard_24h()",
      reply: "**Báo cáo 24h:**\n\n• 142 user mới (98 SV, 44 NTD)\n• 18 hợp đồng mới — escrow hold: **86.5tr VND**\n• 3 cảnh báo IDS (impossible travel)\n• 0 dispute mở\n• Doanh thu phí: 1.73tr VND\n\nXem chi tiết tại /admin." },
    { keys: ["ids", "cảnh báo", "alert", "bảo mật", "security"], tool: "ids_alerts()",
      reply: "**3 cảnh báo IDS đang mở:**\n\n⚠️ user_3310 — đăng nhập HCM → Hà Nội trong 5 phút\n⚠️ user_8821 — 47 lần thử login sai trong 1h\n⚠️ employer_44 — IP từ Tor exit node\n\nKhuyến nghị: tạm khoá user_8821, bắt 2FA cho 2 case còn lại." },
    { keys: ["escrow", "ký quỹ"], tool: "escrow_overview()",
      reply: "**Tổng quan Escrow:**\n\n• Tổng tiền đang giữ: **456.8tr VND** (78 hợp đồng)\n• Đã giải ngân tháng này: 312tr\n• Dispute mở: 2 (đang xử lý <72h)\n• Phí nền tảng tháng: 9.1tr (~2% volume)" },
    { keys: ["dispute", "khiếu nại", "tranh chấp"],
      reply: "**2 dispute đang xử lý:**\n\n• ESC-0038 — SV claim NTD không phản hồi 14 ngày\n• ESC-0041 — NTD reject deliverable, freelancer kháng nghị\n\nSLA xử lý: 72h. Cần admin review tại /admin/disputes." },
    { keys: ["audit", "lưu vết", "log"],
      reply: "**Audit logs (giữ 7 năm — Premium):**\n\n• 24h qua: 1,847 events (login, escrow, admin actions)\n• Top action: ESCROW_FUND (124), USER_LOGIN (892)\n• Tất cả tool-calls của Chatbot đều được log\n\nExport CSV/JSON tại /admin." },
    { keys: ["ban", "khoá", "cấm"],
      reply: "Để khoá tài khoản:\n1. Vào /admin → Users tab\n2. Search user_id hoặc email\n3. Click 'Suspend' — nhập lý do (bắt buộc)\n4. Hệ thống tự ghi audit log + email notify user\n\nLưu ý: cần soft-delete để giữ data 7 năm." },
  ],
};

const FALLBACK: Record<Role, string> = {
  career: "Mình có thể giúp về: tìm việc Part-time/Full-time/Freelance, đánh giá CV, mức lương, mẹo phỏng vấn, kỹ năng cần học. Bạn muốn hỏi gì?",
  recruiter: "Mình có thể giúp về: lọc ứng viên AI, viết JD, theo dõi escrow, báo cáo tuyển dụng, chi phí nền tảng. Bạn cần gì?",
  admin: "Mình có thể giúp về: báo cáo 24h, cảnh báo IDS, tổng quan escrow, dispute, audit logs, quản lý user. Bạn muốn xem gì?",
};

const SUGGESTIONS: Record<Role, string[]> = {
  career: ["Tìm part-time gần Q.1", "Đánh giá CV của tôi", "Mức lương Junior Dev", "Mẹo phỏng vấn", "Kỹ năng nào hot 2026?", "Job freelance UI/UX"],
  recruiter: ["Lọc ứng viên React", "Viết JD pha chế", "Báo cáo tuyển dụng", "Chi phí nền tảng", "Tip phỏng vấn SV"],
  admin: ["Báo cáo 24h", "Cảnh báo IDS", "Tổng tiền ký quỹ", "Dispute đang mở", "Audit logs", "Khoá user"],
};

function matchRule(role: Role, q: string): { reply: string; tool?: string } {
  const lower = q.toLowerCase();
  const hit = RULES[role].find((r) => r.keys.some((k) => lower.includes(k)));
  if (hit) return { reply: hit.reply, tool: hit.tool };
  return { reply: FALLBACK[role] };
}

function ChatPage() {
  const { user } = useAuth();
  const defaultRole: Role = user?.role === "employer" ? "recruiter" : user?.role === "admin" ? "admin" : "career";
  const [role, setRole] = useState<Role>(defaultRole);
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: `Xin chào${user ? ` ${user.name}` : ""}! Mình là **AI Chatbot WorkVerse** (Gemini + RAG). ${FALLBACK[defaultRole]}`,
    },
  ]);
  const [input, setInput] = useState("");

  const roleOptions = useMemo(() => {
    if (!user) return ["career", "recruiter", "admin"] as Role[];
    if (user.role === "admin") return ["career", "recruiter", "admin"] as Role[];
    return [defaultRole];
  }, [user, defaultRole]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      const { reply, tool } = matchRule(role, text);
      const out: Msg[] = [];
      if (tool) out.push({ from: "bot", tool, text: "Đang truy vấn dữ liệu..." });
      out.push({ from: "bot", text: reply });
      setMessages((m) => [...m, ...out]);
    }, 350);
  };

  const roleLabel: Record<Role, string> = {
    career: "Career (Sinh viên)",
    recruiter: "Recruiter (Doanh nghiệp)",
    admin: "Admin",
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">AI Chatbot · RAG đa vai trò</h1>
        <p className="text-sm text-muted-foreground">
          Gemini + pgvector + Tool Calling. {user?.plan === "free" && <span className="text-amber-600">Free: giới hạn 5 câu/ngày — </span>}
          {user?.plan !== "free" && user && <span className="text-primary">Gói {user.plan.toUpperCase()}: không giới hạn ✨</span>}
        </p>

        {roleOptions.length > 1 && (
          <div className="mt-4 flex gap-2">
            {roleOptions.map((r) => (
              <Button key={r} size="sm" variant={role === r ? "default" : "outline"} onClick={() => setRole(r)}>
                {roleLabel[r]}
              </Button>
            ))}
          </div>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> {roleLabel[role]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.from === "user" ? "justify-end" : ""}`}>
                  {m.from === "bot" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.tool && (
                      <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
                        <Wrench className="h-3 w-3" /> tool: {m.tool}
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                  </div>
                  {m.from === "user" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS[role].map((s) => (
                <Badge key={s} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => send(s)}>
                  {s}
                </Badge>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <Input placeholder="Nhập câu hỏi..." value={input} onChange={(e) => setInput(e.target.value)} />
              <Button type="submit">Gửi</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
