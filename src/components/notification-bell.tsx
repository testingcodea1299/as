import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/lib/notifications";
import { formatDistanceToNow } from "@/lib/utils-time";

export function NotificationBell() {
  const { items, unread, markAllRead, clear } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="relative" aria-label="Thông báo">
          <Bell />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <div className="text-sm font-semibold">Thông báo</div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={markAllRead}><Check /></Button>
            <Button size="sm" variant="ghost" onClick={clear}><Trash2 /></Button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>}
          {items.map((n) => (
            <div key={n.id} className={`border-b border-border p-3 text-sm last:border-0 ${!n.read ? "bg-accent/40" : ""}`}>
              <div className="font-medium">{n.title}</div>
              {n.description && <div className="text-xs text-muted-foreground">{n.description}</div>}
              <div className="mt-1 text-[10px] text-muted-foreground">{formatDistanceToNow(n.createdAt)}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
