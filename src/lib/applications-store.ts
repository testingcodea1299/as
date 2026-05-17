import { useEffect, useState } from "react";

export type AppStatus = "submitted" | "viewing" | "processing" | "accepted" | "rejected";

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  userEmail: string;
  fullName: string;
  phone: string;
  email: string;
  coverLetter: string;
  cvName?: string;
  cvDataUrl?: string;
  status: AppStatus;
  createdAt: number;
  updatedAt: number;
};

const KEY = "workverse.applications";

function load(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

function save(list: Application[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("workverse:applications"));
}

export const APP_STATUS_LABEL: Record<AppStatus, string> = {
  submitted: "Đã gửi",
  viewing: "NTD đang xem",
  processing: "Đang xử lý",
  accepted: "Được chấp nhận",
  rejected: "Từ chối",
};

export const APP_STATUS_VARIANT: Record<AppStatus, "default" | "secondary" | "outline" | "destructive"> = {
  submitted: "secondary",
  viewing: "default",
  processing: "default",
  accepted: "default",
  rejected: "destructive",
};

export function useApplications(userEmail?: string) {
  const [items, setItems] = useState<Application[]>([]);

  useEffect(() => {
    const sync = () => setItems(load());
    sync();
    window.addEventListener("workverse:applications", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("workverse:applications", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const mine = userEmail ? items.filter((a) => a.userEmail === userEmail) : items;

  const addApplication = (a: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">): Application => {
    const app: Application = {
      ...a,
      id: `app${Date.now()}`,
      status: "submitted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    save([app, ...load()]);
    // Simulate NTD progress
    setTimeout(() => updateStatus(app.id, "viewing"), 8000);
    setTimeout(() => updateStatus(app.id, "processing"), 20000);
    return app;
  };

  const updateStatus = (id: string, status: AppStatus) => {
    const next = load().map((a) => (a.id === id ? { ...a, status, updatedAt: Date.now() } : a));
    save(next);
  };

  const hasApplied = (jobId: string) => mine.some((a) => a.jobId === jobId);

  return { items: mine, all: items, addApplication, updateStatus, hasApplied };
}
