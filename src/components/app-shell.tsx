import { Moon, Sun } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { useTheme } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/about": "About",
  "/email": "Smart Email Generator",
  "/planner": "AI Task Planner",
  "/assistant": "AI Workplace Assistant",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const title = TITLES[pathname] ?? "WorkFlow AI";
  const { theme, toggle } = useTheme();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <h1 className="min-w-0 truncate text-sm font-semibold sm:text-base">{title}</h1>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggle}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
