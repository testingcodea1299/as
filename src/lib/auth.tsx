import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "employer" | "admin";
export type Plan = "free" | "pro" | "premium";

export type DemoUser = {
  email: string;
  passwordHash: string; // sha256(salt + password)
  name: string;
  role: Role;
  plan?: Plan;
};

const SALT = "workverse.v1::";

// Simple SHA-256 (Web Crypto). Sync fallback via subtle async — wrap behind helper.
async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function hashPassword(pw: string) {
  return sha256(SALT + pw);
}

// Pre-computed hashes for demo accounts (sha256("workverse.v1::" + password))
// student123, employer123, admin123
export const DEMO_ACCOUNTS: DemoUser[] = [
  { email: "student@workverse.vn", passwordHash: "__demo_student123", name: "Nguyễn Văn A", role: "student", plan: "free" },
  { email: "employer@workverse.vn", passwordHash: "__demo_employer123", name: "Startup ABC", role: "employer", plan: "pro" },
  { email: "admin@workverse.vn", passwordHash: "__demo_admin123", name: "Quản trị viên", role: "admin", plan: "premium" },
];

// Compatibility map for demo placeholders -> raw passwords (only checked if hash starts with __demo_)
const DEMO_PW: Record<string, string> = {
  __demo_student123: "student123",
  __demo_employer123: "employer123",
  __demo_admin123: "admin123",
};

export type SessionUser = Omit<DemoUser, "passwordHash"> & { plan: Plan };

type AuthCtx = {
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (data: { email: string; password: string; name: string; role: Role }) =>
    Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  upgrade: (plan: Plan) => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "workverse.session";
const USERS_KEY = "workverse.users";

function loadUsers(): DemoUser[] {
  if (typeof window === "undefined") return DEMO_ACCOUNTS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const extra: DemoUser[] = raw ? JSON.parse(raw) : [];
    return [...DEMO_ACCOUNTS, ...extra];
  } catch {
    return DEMO_ACCOUNTS;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // noop
    }
  }, []);

  const persist = (u: SessionUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthCtx["login"] = async (email, password) => {
    const found = loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: "Email hoặc mật khẩu không đúng" };
    let ok = false;
    if (found.passwordHash.startsWith("__demo_")) {
      ok = DEMO_PW[found.passwordHash] === password;
    } else {
      ok = (await hashPassword(password)) === found.passwordHash;
    }
    if (!ok) return { ok: false, error: "Email hoặc mật khẩu không đúng" };
    persist({ email: found.email, name: found.name, role: found.role, plan: found.plan ?? "free" });
    return { ok: true };
  };

  const register: AuthCtx["register"] = async ({ email, password, name, role }) => {
    if (!email || !password || !name) return { ok: false, error: "Vui lòng điền đủ thông tin" };
    if (password.length < 6) return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự" };
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: "Email đã được sử dụng" };
    const extraRaw = localStorage.getItem(USERS_KEY);
    const extra: DemoUser[] = extraRaw ? JSON.parse(extraRaw) : [];
    const passwordHash = await hashPassword(password);
    extra.push({ email, passwordHash, name, role, plan: "free" });
    localStorage.setItem(USERS_KEY, JSON.stringify(extra));
    persist({ email, name, role, plan: "free" });
    return { ok: true };
  };

  const logout = () => persist(null);

  const upgrade: AuthCtx["upgrade"] = (plan) => {
    if (!user) return;
    persist({ ...user, plan });
  };

  return <Ctx.Provider value={{ user, login, register, logout, upgrade }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = {
  student: "Sinh viên",
  employer: "Nhà tuyển dụng",
  admin: "Quản trị viên",
};

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
};

export const ROLE_LINKS: Record<Role, Array<{ to: string; label: string; icon: string }>> = {
  student: [
    { to: "/jobs", label: "Việc làm 2km", icon: "Briefcase" },
    { to: "/chatbot", label: "Trợ lý nghề nghiệp", icon: "Bot" },
    { to: "/escrow", label: "Hợp đồng của tôi", icon: "Wallet" },
  ],
  employer: [
    { to: "/jobs", label: "Tin tuyển dụng", icon: "Briefcase" },
    { to: "/post-job", label: "Đăng tin", icon: "Plus" },
    { to: "/chatbot", label: "Trợ lý tuyển dụng", icon: "Bot" },
    { to: "/escrow", label: "Ký quỹ dự án", icon: "Wallet" },
  ],
  admin: [
    { to: "/admin", label: "Bảng điều khiển", icon: "ShieldCheck" },
    { to: "/chatbot", label: "Trợ lý Admin", icon: "Bot" },
    { to: "/jobs", label: "Kiểm duyệt việc", icon: "Briefcase" },
    { to: "/escrow", label: "Giám sát Escrow", icon: "Wallet" },
  ],
};
