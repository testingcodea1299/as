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
  lat?: number;
  lng?: number;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  workingHours?: string;
  deadline?: string;
  contactEmail?: string;
};

// Center: Hồ Gươm, Hoàn Kiếm, Hà Nội
export const CENTER: [number, number] = [21.0285, 105.8542];

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Lập trình viên Web Full-time (ReactJS)",
    type: "Full-time",
    company: "FPT Software Hà Nội",
    location: "Toà Keangnam, Q. Nam Từ Liêm, Hà Nội",
    distanceKm: 1.4,
    salary: "15 - 22 triệu/tháng",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    postedAt: "2 giờ trước",
    lat: 21.0175,
    lng: 105.7836,
    description:
      "FPT Software đang mở rộng đội ngũ Frontend tại Hà Nội cho dự án Banking SaaS phục vụ thị trường Nhật Bản. Bạn sẽ làm việc trong squad 6 người (3 FE, 2 BE, 1 QA) theo mô hình Scrum 2 tuần/sprint.",
    responsibilities: [
      "Phát triển giao diện ReactJS + TypeScript theo design system có sẵn (Figma)",
      "Tích hợp REST API và WebSocket realtime với backend Node.js",
      "Viết unit test (Jest, React Testing Library) đảm bảo coverage ≥ 70%",
      "Tham gia code review, daily standup, sprint planning",
    ],
    requirements: [
      "≥ 1 năm kinh nghiệm ReactJS hoặc đồ án/dự án thực tế tương đương",
      "Hiểu Hooks, Context, React Query, Redux Toolkit",
      "Biết Git flow, có kinh nghiệm làm việc remote/onsite",
      "Tiếng Anh đọc tài liệu kỹ thuật tốt; biết tiếng Nhật N4+ là lợi thế",
    ],
    benefits: [
      "Lương cứng 15-22tr + thưởng dự án 2-4 tháng/năm",
      "Bảo hiểm FPT Care, khám sức khoẻ định kỳ",
      "Laptop MacBook Pro, hỗ trợ học Udemy/Coursera",
      "Cơ hội onsite Nhật Bản 6-12 tháng",
    ],
    workingHours: "Thứ 2 - Thứ 6, 8:30 - 17:30 (linh hoạt 1h)",
    deadline: "30/06/2026",
    contactEmail: "tuyendung.hn@fpt-software.com",
  },
  {
    id: "j2",
    title: "Nhân viên Pha chế Part-time (Ca tối)",
    type: "Part-time",
    company: "Highlands Coffee - Tràng Tiền Plaza",
    location: "24 Hai Bà Trưng, Hoàn Kiếm, Hà Nội",
    distanceKm: 0.4,
    salary: "30.000đ/giờ + tip + thưởng doanh số",
    skills: ["F&B", "Giao tiếp", "Pha chế cơ bản"],
    postedAt: "5 giờ trước",
    lat: 21.0265,
    lng: 105.8552,
    description:
      "Highlands Coffee chi nhánh Tràng Tiền Plaza cần tuyển 4 bạn part-time ca tối phục vụ mùa cao điểm. Được đào tạo pha chế 3 ngày có lương trước khi vào ca chính thức.",
    responsibilities: [
      "Pha chế đồ uống theo công thức chuẩn Highlands (cafe, trà, đá xay)",
      "Vệ sinh quầy bar, dụng cụ, tuân thủ 5S",
      "Tư vấn menu, upsell combo cho khách",
      "Hỗ trợ thu ngân, kiểm kho cuối ca",
    ],
    requirements: [
      "Sinh viên năm 1-4, ưu tiên ĐH Kinh tế Quốc dân, Bách Khoa, Ngoại thương",
      "Cam kết tối thiểu 4 ca/tuần (mỗi ca 5h)",
      "Ngoại hình ưa nhìn, giao tiếp tốt, chịu được áp lực giờ cao điểm",
      "Không cần kinh nghiệm — được đào tạo miễn phí",
    ],
    benefits: [
      "Lương 30k/giờ, tăng 35k sau 3 tháng",
      "Thưởng doanh số ca + tip chia đều",
      "Giảm 50% đồ uống cho nhân viên",
      "Cấp đồng phục, hỗ trợ 1 bữa ăn/ca",
    ],
    workingHours: "Ca chiều 14:00-19:00 hoặc ca tối 18:00-23:00",
    deadline: "Tuyển đến khi đủ",
    contactEmail: "hr.trangtien@highlandscoffee.com.vn",
  },
  {
    id: "j3",
    title: "Thiết kế UI/UX Landing Page Edtech",
    type: "Freelance",
    company: "Edupia Startup",
    location: "Hoà Lạc Hi-Tech Park, Thạch Thất, Hà Nội",
    distanceKm: 1.8,
    salary: "6 - 8 triệu/dự án (2-3 tuần)",
    skills: ["Figma", "UI/UX", "Webflow", "Prototyping"],
    postedAt: "1 ngày trước",
    lat: 21.0145,
    lng: 105.8420,
    description:
      "Edupia cần 1 freelance designer thiết kế lại landing page chương trình tiếng Anh thiếu nhi, mục tiêu tăng conversion từ 2.1% lên 4%. Có sẵn brand guideline, user research, A/B test cũ.",
    responsibilities: [
      "Phân tích landing cũ + đề xuất 2 hướng moodboard",
      "Thiết kế hi-fi UI 6-8 section (Hero, Khoá học, Giáo viên, Học phí, Review, FAQ, CTA)",
      "Prototype tương tác trên Figma cho desktop + mobile",
      "Bàn giao asset, hỗ trợ dev 5 ngày sau handoff",
    ],
    requirements: [
      "Portfolio có ≥ 2 landing edtech/B2C đã release",
      "Thành thạo Figma Auto-layout, Variants, Variables",
      "Hiểu CRO, biết đọc Hotjar/GA4 là lợi thế",
    ],
    benefits: [
      "Thanh toán qua Escrow WorkVerse — chia 3 milestone",
      "Bonus 1.5tr nếu deliver sớm hơn 3 ngày",
      "Cơ hội ký hợp đồng dài hạn quý sau",
    ],
    workingHours: "Remote, sync 2 buổi/tuần qua Google Meet",
    deadline: "Chốt freelancer trước 25/05/2026",
    contactEmail: "design-hire@edupia.vn",
  },
  {
    id: "j4",
    title: "Viết Content Marketing mảng Tài chính",
    type: "Freelance",
    company: "Agency MOG Hà Nội",
    location: "Cầu Giấy, Hà Nội",
    distanceKm: 1.9,
    salary: "350.000đ/bài (800-1200 từ)",
    skills: ["Copywriting", "SEO", "Tài chính cá nhân"],
    postedAt: "3 giờ trước",
    lat: 21.0322,
    lng: 105.7960,
    description:
      "MOG đang xây cluster SEO 60 bài cho khách hàng là ngân hàng số. Cần 3 freelancer viết về tiết kiệm, đầu tư cơ bản, thẻ tín dụng cho độc giả 22-35 tuổi.",
    responsibilities: [
      "Nhận brief + bộ từ khoá, viết 4-6 bài/tuần",
      "Tuân thủ outline & brand voice (thân thiện, chính xác, không cường điệu)",
      "Tự kiểm tra đạo văn (Copyscape) và tối ưu Yoast SEO ≥ 80",
    ],
    requirements: [
      "Đã viết ≥ 20 bài SEO hoặc 1 năm kinh nghiệm content tài chính",
      "Hiểu cơ bản về lãi suất, tín dụng, chứng chỉ quỹ",
      "Có khả năng phỏng vấn expert qua điện thoại khi cần",
    ],
    benefits: [
      "Thanh toán 2 đợt/tháng, đúng hạn qua Escrow",
      "Bonus 50k/bài nếu lên top 10 Google trong 60 ngày",
      "Được mentor bởi Senior Content Lead 8 năm kinh nghiệm",
    ],
    workingHours: "Remote, deadline mỗi bài 48h từ lúc nhận brief",
    deadline: "Tuyển cuốn chiếu",
    contactEmail: "freelance@mogagency.vn",
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
  client: "Edupia Startup",
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
