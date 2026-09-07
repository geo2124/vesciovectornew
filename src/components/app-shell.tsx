import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { academy } from "@/lib/mock-data";
import markAsset from "@/assets/vescio-vector-mark.png.asset.json";
import { ThemeToggle } from "@/lib/theme";

type NavItem = { to: string; label: string; meta?: string };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Operate",
    items: [
      { to: "/", label: "Dashboard" },
      { to: "/calendar", label: "Calendar", meta: "14" },
      { to: "/sessions", label: "Sessions", meta: "3 live" },
      { to: "/merchandise", label: "Merchandise", meta: "2 low" },
    ],
  },
  {
    title: "Roster",
    items: [
      { to: "/players", label: "Players", meta: "248" },
      { to: "/coaches", label: "Coaches", meta: "22" },
      { to: "/teams", label: "Teams", meta: "18" },
      { to: "/personnel", label: "Personnel", meta: "9" },
      { to: "/branches", label: "Branches", meta: "3" },
    ],
  },
  {
    title: "Control",
    items: [
      { to: "/accounting", label: "Accounting", meta: "USD" },
      { to: "/users", label: "Users & Access" },
      { to: "/settings", label: "System Settings" },
      { to: "/technical", label: "Technical Portal", meta: "VIEW" },
      { to: "/coach", label: "Coach Portal", meta: "VIEW" },
    ],
  },
  {
    title: "Platform",
    items: [
      { to: "/admin", label: "Client Console", meta: "ADMIN" },
      { to: "/setup", label: "Setup Wizard", meta: "TENANT" },
    ],
  },
];

const mobileTabs: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/calendar", label: "Calendar" },
  { to: "/sessions", label: "Sessions" },
  { to: "/players", label: "Players" },
  { to: "/settings", label: "More" },
];

const glyphs: Record<string, string> = {
  "/": "▦",
  "/calendar": "▤",
  "/sessions": "◈",
  "/players": "●",
  "/settings": "⌗",
};

export function AppShell({
  crumb,
  title,
  children,
}: {
  crumb: string;
  title: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink-800 bg-ink-950 lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-ink-800 px-5">
          <img src={markAsset.url} alt="Vescio Vector" className="h-9 w-9 object-contain" />
          <div className="leading-none">
            <div className="font-display text-[15px] tracking-tight text-ink-100">VESCIO</div>
            <div className="mt-1 font-mono text-[9px] tracking-[0.3em] text-court-400">VECTOR</div>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="label-mono px-2 pb-2">Workspace</div>
          <div className="flex items-center gap-3 rounded-md bg-ink-850 px-2 py-2 ring-1 ring-ink-700">
            <div className="grid h-8 w-8 place-items-center bg-court-500/15">
              <span className="font-mono text-xs text-court-400">AL</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-ink-100">{academy.name}</div>
              <div className="font-mono text-[9px] text-ink-400">{academy.url}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 pt-5">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="label-mono px-2 pb-1.5">{g.title}</div>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const active =
                    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between rounded-md px-2 py-2 transition-colors ${
                        active
                          ? "bg-court-500/12 text-ink-100 ring-1 ring-court-500/30"
                          : "text-ink-200 hover:bg-ink-850"
                      }`}
                    >
                      <span className={`text-sm ${active ? "font-medium" : ""}`}>{item.label}</span>
                      {item.meta ? (
                        <span
                          className={`font-mono text-[10px] ${
                            active ? "text-court-400" : "text-ink-400"
                          }`}
                        >
                          {item.meta}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-800 p-4">
          <div className="label-mono mb-1.5">Package</div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs text-ink-200">Players used</span>
            <span className="font-mono text-xs text-ink-100">
              {academy.playersUsed}
              <span className="text-ink-400">/{academy.playersLimit}</span>
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-ink-800">
            <div
              className="h-full bg-court-500"
              style={{ width: `${(academy.playersUsed / academy.playersLimit) * 100}%` }}
            />
          </div>
          <div className="mt-3 text-[11px] text-ink-400">
            Plan · <span className="text-ink-200">{academy.plan}</span> · renews {academy.renews}
          </div>
        </div>
      </aside>

      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink-800 bg-ink-950/90 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="label-mono hidden sm:inline">{crumb}</span>
            <h1 className="font-display truncate text-lg tracking-tight text-ink-100">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                className="w-56 rounded-md bg-ink-850 py-2 pl-9 pr-3 font-ui text-sm text-ink-100 ring-1 ring-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-court-500/60"
                placeholder="Search players, coaches, teams…"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400">
                ⌕
              </span>
            </div>
            <div className="label-mono hidden items-center gap-2 rounded-md bg-ink-850 px-2.5 py-2 text-ink-300 ring-1 ring-ink-700 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse bg-court-500" />
              DEV VERSION
            </div>
            <ThemeToggle />
            <div className="grid h-9 w-9 place-items-center bg-ink-800 ring-1 ring-ink-700">
              <span className="font-mono text-xs text-ink-200">GM</span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-ink-800 bg-ink-950/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        {mobileTabs.map((tab) => {
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center gap-1 py-1.5 ${
                active ? "text-court-400" : "text-ink-400"
              }`}
            >
              <span className="font-mono text-sm leading-none">{glyphs[tab.to]}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
