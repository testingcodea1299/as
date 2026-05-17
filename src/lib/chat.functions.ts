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

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((d: { role: "career" | "recruiter" | "admin"; messages: ChatMessage[] }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { content: "⚠️ Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm biến môi trường trong Cloudflare." };
    }

    const sys = SYSTEM_PROMPTS[data.role] ?? SYSTEM_PROMPTS.career;

    // Gemini dùng role "user" / "model" thay vì "user" / "assistant"
    // và không nhận role "system" trong messages — system đưa vào systemInstruction
    const contents: GeminiContent[] = data.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) return { content: "⏳ Đang quá tải, thử lại sau ít giây." };
      if (res.status === 403) return { content: "🔑 API key không hợp lệ hoặc chưa bật Gemini API." };
      return { content: `Lỗi AI (${res.status}): ${txt.slice(0, 200)}` };
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? "(không có phản hồi)";

    return { content: text };
  });