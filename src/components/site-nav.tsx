import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Bot, Wallet, ShieldCheck, Sparkles, LogIn, LogOut, UserPlus, Crown, Plus } from "lucide-react";
import { useAuth, ROLE_LABEL, PLAN_LABEL, ROLE_LINKS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ICONS = { Briefcase, Bot, Wallet, ShieldCheck, Sparkles, Plus, Crown } as const;

const PUBLIC_LINKS = [
  { to: "/", label: "Trang chủ", icon: "Sparkles" },
  { to: "/jobs", label: "Việc làm 2km", icon: "Briefcase" },
  { to: "/chatbot", label: "AI Chatbot", icon: "Bot" },
  { to: "/pricing", label: "Gói Pro/Premium", icon: "Crown" },
] as const;

export function SiteNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user
    ? [{ to: "/" as const, label: "Trang chủ", icon: "Sparkles" }, ...ROLE_LINKS[user.role], { to: "/pricing", label: "Nâng cấp", icon: "Crown" }]
    : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">W</span>
          <span>WorkVerse<span className="text-muted-foreground">.vn</span></span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map(({ to, label, icon }) => {
            const Icon = (ICONS as Record<string, typeof Briefcase>)[icon] ?? Crown;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
                activeOptions={{ exact: to === "/" }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium leading-tight">{user.name}</div>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground leading-tight">
                  {ROLE_LABEL[user.role]}
                  <Badge variant={user.plan === "free" ? "outline" : "default"} className="h-4 px-1 text-[10px]">
                    {PLAN_LABEL[user.plan]}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => { logout(); navigate({ to: "/login" }); }}>
                <LogOut /> <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/login"><LogIn /> <span className="hidden sm:inline">Đăng nhập</span></Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register"><UserPlus /> <span className="hidden sm:inline">Đăng ký</span></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
