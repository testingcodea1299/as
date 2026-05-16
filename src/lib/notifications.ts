import { useEffect, useState } from "react";

export type Notification = {
  id: string;
  title: string;
  description?: string;
  type: "info" | "success" | "warning";
  createdAt: number;
  read: boolean;
  link?: string;
};

const KEY = "workverse.notifications";
const EVT = "workverse:notifications";

function load(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(list: Notification[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function pushNotification(n: Omit<Notification, "id" | "createdAt" | "read">) {
  const list = load();
  list.unshift({ ...n, id: `n${Date.now()}`, createdAt: Date.now(), read: false });
  save(list.slice(0, 50));
}

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
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

  const unread = items.filter((n) => !n.read).length;
  const markAllRead = () => save(load().map((n) => ({ ...n, read: true })));
  const clear = () => save([]);

  return { items, unread, markAllRead, clear };
}
