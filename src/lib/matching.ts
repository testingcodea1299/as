import type { Job } from "./mock-data";

// ─── Cấu trúc lịch rảnh ────────────────────────────────────────────────────

export const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"] as const;
export type Day = (typeof DAYS)[number];

export const SLOTS = [
  "7:00-9:00",
  "9:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
  "19:00-21:00",
] as const;
export type Slot = (typeof SLOTS)[number];

// Slot bắt đầu (giờ) → tên slot
const SLOT_START: Record<number, Slot> = {
  7: "7:00-9:00",
  9: "9:00-11:00",
  11: "11:00-13:00",
  13: "13:00-15:00",
  15: "15:00-17:00",
  17: "17:00-19:00",
  19: "19:00-21:00",
};

// ─── Load lịch rảnh từ localStorage ──────────────────────────────────────────

const FREE_KEY = "workverse.freeTime";

export function loadFreeTime(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(FREE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getFreeSlots(freeTime: Record<string, boolean>): Set<string> {
  return new Set(Object.entries(freeTime).filter(([, v]) => v).map(([k]) => k));
}

// ─── Parse workingHours → danh sách (day, slot) cần thiết ──────────────────

// Map từ khóa → danh sách ngày
const DAY_KEYWORDS: { keys: string[]; days: Day[] }[] = [
  { keys: ["thứ 2", "thu 2", "monday", "t2"], days: ["Thứ 2"] },
  { keys: ["thứ 3", "thu 3", "tuesday", "t3"], days: ["Thứ 3"] },
  { keys: ["thứ 4", "thu 4", "wednesday", "t4"], days: ["Thứ 4"] },
  { keys: ["thứ 5", "thu 5", "thursday", "t5"], days: ["Thứ 5"] },
  { keys: ["thứ 6", "thu 6", "friday", "t6"], days: ["Thứ 6"] },
  { keys: ["thứ 7", "thu 7", "saturday", "t7", "cuối tuần"], days: ["Thứ 7"] },
  { keys: ["chủ nhật", "cn", "sunday"], days: ["CN"] },
  {
    keys: ["thứ 2 - thứ 6", "t2-t6", "các ngày trong tuần", "weekday"],
    days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
  },
  {
    keys: ["thứ 2 - thứ 7", "t2-t7"],
    days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
  },
  {
    keys: ["hàng ngày", "tất cả các ngày", "7 ngày"],
    days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
  },
];

// Tìm giờ bắt đầu và kết thúc từ chuỗi
function extractTimeRange(text: string): { start: number; end: number } | null {
  // Regex khớp dạng: 8:30, 14:00, 9h, 21h...
  const m = text.match(/(\d{1,2})(?:[:h]\d{0,2})?\s*[-–]\s*(\d{1,2})(?:[:h]\d{0,2})?/);
  if (!m) return null;
  return { start: parseInt(m[1]), end: parseInt(m[2]) };
}

// Từ khoảng giờ → các slot giao thoa
function hoursToSlots(start: number, end: number): Slot[] {
  const result: Slot[] = [];
  for (const [h, slot] of Object.entries(SLOT_START)) {
    const slotStart = Number(h);
    const slotEnd = slotStart + 2;
    // Giao thoa nếu slot bắt đầu trước khi ca kết thúc và kết thúc sau khi ca bắt đầu
    if (slotStart < end && slotEnd > start) {
      result.push(slot as Slot);
    }
  }
  return result;
}

// Nhận diện "ca sáng", "ca chiều", "ca tối"
function shiftKeywordToSlots(text: string): Slot[] {
  const t = text.toLowerCase();
  const slots: Slot[] = [];
  if (t.includes("ca sáng") || t.includes("buổi sáng")) {
    slots.push("7:00-9:00", "9:00-11:00", "11:00-13:00");
  }
  if (t.includes("ca chiều") || t.includes("buổi chiều")) {
    slots.push("13:00-15:00", "15:00-17:00");
  }
  if (t.includes("ca tối") || t.includes("buổi tối") || t.includes("ca đêm")) {
    slots.push("17:00-19:00", "19:00-21:00");
  }
  return slots;
}

export type ParsedSchedule = {
  days: Day[];
  slots: Slot[];
  isRemote: boolean;
  isFlexible: boolean;
};

export function parseWorkingHours(wh: string | undefined): ParsedSchedule {
  if (!wh) return { days: [], slots: [], isRemote: false, isFlexible: true };

  const lower = wh.toLowerCase();

  // Remote / linh hoạt hoàn toàn
  const isRemote =
    lower.includes("remote") || lower.includes("từ xa") || lower.includes("online only");
  const isFlexible =
    isRemote ||
    lower.includes("linh hoạt") ||
    lower.includes("thoả thuận") ||
    lower.includes("thỏa thuận") ||
    lower.includes("tự sắp xếp");

  if (isFlexible) {
    return { days: [...DAYS], slots: [...SLOTS], isRemote, isFlexible };
  }

  // Parse ngày
  let days: Day[] = [];
  for (const { keys, days: mapped } of DAY_KEYWORDS) {
    if (keys.some((k) => lower.includes(k))) {
      days = [...new Set([...days, ...mapped])];
    }
  }
  // Nếu không tìm được ngày → mặc định T2-T6
  if (days.length === 0) {
    days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
  }

  // Parse giờ theo từng đoạn "HH:MM - HH:MM"
  const timeRegex = /(\d{1,2})(?:[:h]\d{0,2})?\s*[-–]\s*(\d{1,2})(?:[:h]\d{0,2})?/g;
  const slots = new Set<Slot>();
  let match;
  while ((match = timeRegex.exec(lower)) !== null) {
    const s = parseInt(match[1]);
    const e = parseInt(match[2]);
    if (s < 24 && e <= 24 && s < e) {
      hoursToSlots(s, e).forEach((sl) => slots.add(sl));
    }
  }

  // Nếu không tìm được giờ → thử ca từ khoá
  if (slots.size === 0) {
    shiftKeywordToSlots(lower).forEach((sl) => slots.add(sl));
  }

  // Vẫn trống → giờ hành chính mặc định
  if (slots.size === 0) {
    ["9:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00"].forEach((sl) =>
      slots.add(sl as Slot)
    );
  }

  return { days, slots: [...slots], isRemote, isFlexible: false };
}

// ─── Tính điểm khớp lịch ─────────────────────────────────────────────────────

export type MatchResult = {
  score: number;         // 0–100
  label: string;        // "Rất phù hợp" | "Phù hợp" | "Ít phù hợp" | "Không phù hợp"
  matchedSlots: number; // số khung giờ khớp
  totalRequired: number; // tổng khung cần thiết
  isRemote: boolean;
  isFlexible: boolean;
};

export function matchJobToFreeTime(job: Job, freeTime: Record<string, boolean>): MatchResult {
  const parsed = parseWorkingHours(job.workingHours);
  const free = getFreeSlots(freeTime);

  // Remote / linh hoạt → điểm cao nhất (giả sử SV có thể sắp xếp)
  if (parsed.isFlexible) {
    return {
      score: 90,
      label: "Rất phù hợp",
      matchedSlots: parsed.slots.length,
      totalRequired: parsed.slots.length,
      isRemote: parsed.isRemote,
      isFlexible: true,
    };
  }

  // Tạo tập các cặp (day, slot) mà job yêu cầu
  const required: string[] = [];
  for (const day of parsed.days) {
    for (const slot of parsed.slots) {
      required.push(`${day}::${slot}`);
    }
  }

  if (required.length === 0) {
    return { score: 50, label: "Phù hợp", matchedSlots: 0, totalRequired: 0, isRemote: false, isFlexible: false };
  }

  const matched = required.filter((k) => free.has(k)).length;
  const raw = matched / required.length;

  // Nếu SV chưa điền lịch rảnh → không tính
  if (free.size === 0) {
    return { score: 0, label: "Chưa cập nhật lịch", matchedSlots: 0, totalRequired: required.length, isRemote: false, isFlexible: false };
  }

  const score = Math.round(raw * 100);
  const label =
    score >= 70 ? "Rất phù hợp" :
    score >= 40 ? "Phù hợp" :
    score >= 15 ? "Ít phù hợp" :
    "Không phù hợp";

  return { score, label, matchedSlots: matched, totalRequired: required.length, isRemote: false, isFlexible: false };
}

export function rankJobsByMatch(jobs: Job[], freeTime: Record<string, boolean>): (Job & { match: MatchResult })[] {
  return jobs
    .map((j) => ({ ...j, match: matchJobToFreeTime(j, freeTime) }))
    .sort((a, b) => b.match.score - a.match.score);
}