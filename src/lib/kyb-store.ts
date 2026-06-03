import { useEffect, useState } from "react";

export type KybStatus = "none" | "pending" | "verified" | "rejected";

export type KybApplication = {
  id: string;
  email: string;           // employer email
  companyName: string;
  taxCode: string;         // Mã số thuế
  address: string;
  contactPhone: string;
  businessType: string;    // Loại hình kinh doanh
  docUrl?: string;         // Link GPKD (demo: text URL)
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  status: KybStatus;
  rejectReason?: string;
};

const KEY = "workverse.kyb";
const EVT = "workverse:kyb";

function load(): KybApplication[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(list: KybApplication[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function getKybStatus(email: string): KybStatus {
  const app = load().find((a) => a.email.toLowerCase() === email.toLowerCase());
  return app?.status ?? "none";
}

export function submitKyb(data: Omit<KybApplication, "id" | "submittedAt" | "status">): KybApplication {
  const list = load();
  // Upsert: nếu đã có thì cập nhật lại
  const existing = list.findIndex((a) => a.email.toLowerCase() === data.email.toLowerCase());
  const app: KybApplication = {
    ...data,
    id: existing >= 0 ? list[existing].id : `kyb${Date.now()}`,
    submittedAt: Date.now(),
    status: "pending",
  };
  if (existing >= 0) list[existing] = app;
  else list.unshift(app);
  save(list);
  return app;
}

export function reviewKyb(id: string, decision: "verified" | "rejected", reviewer: string, rejectReason?: string) {
  const list = load();
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return;
  list[idx] = {
    ...list[idx],
    status: decision,
    reviewedAt: Date.now(),
    reviewedBy: reviewer,
    rejectReason: decision === "rejected" ? rejectReason : undefined,
  };
  save(list);
}

export function useKybList() {
  const [items, setItems] = useState<KybApplication[]>([]);
  useEffect(() => {
    const sync = () => setItems(load());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}

export function useMyKyb(email?: string) {
  const [app, setApp] = useState<KybApplication | null>(null);
  useEffect(() => {
    if (!email) return;
    const sync = () => {
      const found = load().find((a) => a.email.toLowerCase() === email.toLowerCase());
      setApp(found ?? null);
    };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [email]);
  return app;
}

export const KYB_STATUS_LABEL: Record<KybStatus, string> = {
  none: "Chưa xác thực",
  pending: "Đang xét duyệt",
  verified: "Đã xác thực ✓",
  rejected: "Bị từ chối",
};

export const BUSINESS_TYPES = [
  "Doanh nghiệp tư nhân",
  "Công ty TNHH",
  "Công ty Cổ phần",
  "Hộ kinh doanh cá thể",
  "Tổ chức / NGO",
];