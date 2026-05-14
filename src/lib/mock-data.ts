export type Job = {
  id: string;
  title: string;
  type: "Full-time" | "Part-time" | "Freelance";
  company: string;
  location: string;
  distanceKm: number;
  salary: string;
  skills: string[];
  postedAt: string;
};

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Lập trình viên Web Full-time",
    type: "Full-time",
    company: "FPT Software",
    location: "Q.7, TP.HCM",
    distanceKm: 0.8,
    salary: "12-18 triệu",
    skills: ["React", "Node.js", "PostgreSQL"],
    postedAt: "2 giờ trước",
  },
  {
    id: "j2",
    title: "Nhân viên Pha chế Part-time",
    type: "Part-time",
    company: "Highlands Coffee",
    location: "Q.1, TP.HCM",
    distanceKm: 1.2,
    salary: "28k/giờ",
    skills: ["F&B", "Giao tiếp"],
    postedAt: "5 giờ trước",
  },
  {
    id: "j3",
    title: "Thiết kế UI/UX Landing Page",
    type: "Freelance",
    company: "Startup ABC",
    location: "Remote",
    distanceKm: 1.6,
    salary: "5 triệu/dự án",
    skills: ["Figma", "UI/UX", "Webflow"],
    postedAt: "1 ngày trước",
  },
  {
    id: "j4",
    title: "Viết Content Marketing",
    type: "Freelance",
    company: "Agency XYZ",
    location: "Remote",
    distanceKm: 1.9,
    salary: "300k/bài",
    skills: ["Copywriting", "SEO"],
    postedAt: "3 giờ trước",
  },
];

export type Milestone = {
  id: string;
  title: string;
  amount: number;
  status: "funded" | "submitted" | "released" | "disputed";
};

export const MOCK_ESCROW = {
  contractId: "ESC-2026-0042",
  totalVnd: 5_000_000,
  feeVnd: 100_000,
  client: "Startup ABC",
  freelancer: "Nguyễn Văn A",
  milestones: [
    { id: "m1", title: "Wireframe + Moodboard", amount: 1_500_000, status: "released" },
    { id: "m2", title: "Hi-fi UI 5 màn hình", amount: 2_000_000, status: "submitted" },
    { id: "m3", title: "Bàn giao file Figma + Handoff", amount: 1_500_000, status: "funded" },
  ] as Milestone[],
};

export const MOCK_AUDIT = [
  { ts: "10:42:11", actor: "admin@workverse.vn", action: "USER_BAN", target: "user_8821", ip: "14.241.x.x" },
  { ts: "10:38:02", actor: "chatbot/admin", action: "TOOL_CALL admin_dashboard_24h", target: "-", ip: "internal" },
  { ts: "10:31:55", actor: "employer_44", action: "ESCROW_FUND", target: "ESC-2026-0042", ip: "171.244.x.x" },
  { ts: "10:12:30", actor: "ids", action: "ALERT impossible_travel", target: "user_3310", ip: "multi" },
];
