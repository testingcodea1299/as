import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button size="sm" variant="ghost" onClick={toggle} aria-label="Đổi giao diện sáng/tối">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
