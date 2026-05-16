import { createServerFn } from "@tanstack/react-start";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPTS: Record<string, string> = {
  career:
    "Bạn là trợ lý nghề nghiệp của WorkVerse.vn dành cho sinh viên Việt Nam. Trả lời bằng tiếng Việt, ngắn gọn, có cấu trúc, dùng markdown. Tư vấn về tìm việc part-time/full-time/freelance trong bán kính 2km, đánh giá CV, kỹ năng, mức lương SV tại VN, mẹo phỏng vấn. Nếu được hỏi mức lương hãy ước lượng theo thị trường VN 2026.",
  recruiter:
    "Bạn là trợ lý tuyển dụng của WorkVerse.vn cho doanh nghiệp Việt Nam. Trả lời tiếng Việt, markdown, gọn. Hỗ trợ viết JD, lọc ứng viên, theo dõi escrow (phí 2% / Pro 1.5% / Premium 1%), báo cáo, chi phí nền tảng, tip phỏng vấn sinh viên.",
  admin:
    "Bạn là trợ lý quản trị WorkVerse.vn. Trả lời tiếng Việt, markdown, gọn. Hỗ trợ báo cáo 24h, IDS alerts, escrow overview, dispute SLA 72h, audit logs giữ 7 năm, quản lý user. Khi không có dữ liệu thật, đưa ra số liệu mô phỏng hợp lý kèm chú thích (mock).",
};

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((d: { role: "career" | "recruiter" | "admin"; messages: ChatMessage[] }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { content: "⚠️ Chưa cấu hình LOVABLE_API_KEY. Vui lòng bật Lovable AI." };
    }
    const sys = SYSTEM_PROMPTS[data.role] ?? SYSTEM_PROMPTS.career;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, ...data.messages],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) return { content: "⏳ Đang quá tải, thử lại sau ít giây." };
      if (res.status === 402) return { content: "💳 Hết credit AI, vui lòng nạp thêm trong Workspace." };
      return { content: `Lỗi AI (${res.status}): ${txt.slice(0, 200)}` };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { content: json.choices?.[0]?.message?.content ?? "(không có phản hồi)" };
  });
