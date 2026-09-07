import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chip } from "@/components/kit";
import markAsset from "@/assets/vescio-vector-mark.png.asset.json";
import { players, sessions } from "@/lib/mock-data";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach Portal — Vescio Vector" },
      {
        name: "description",
        content:
          "Mobile coach portal: calendar, session check-in, attendance, games, documents, practice plans and payments.",
      },
      { property: "og:title", content: "Coach Portal — Vescio Vector" },
      { property: "og:description", content: "Everything a coach needs, on the phone." },
    ],
  }),
  component: CoachPortal,
});

const tabs = ["Home", "Calendar", "Games", "Docs", "Plans", "Profile"] as const;
const glyph: Record<string, string> = {
  Home: "▦",
  Calendar: "▤",
  Games: "◈",
  Docs: "▣",
  Plans: "✎",
  Profile: "●",
};

function CoachPortal() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="mx-auto min-h-screen max-w-md border-x border-ink-800 bg-ink-950 pb-24">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-800 bg-ink-950/95 px-4 py-3 backdrop-blur">
          <img src={markAsset.url} alt="Vescio Vector" className="h-8 w-8 object-contain" />
          <div className="leading-tight">
            <div className="font-display text-sm tracking-tight text-ink-100">Coach Portal</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-court-400">/COACH</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle compact />
            <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
              Exit
            </Link>
          </div>
        </header>

        <div className="bg-ink-900 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-court-500/15 font-mono text-sm text-court-400">
              KH
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-ink-100">Karim Haddad</div>
              <div className="font-mono text-[10px] text-ink-400">Head · U-16 North</div>
            </div>
            <span className="ml-auto">
              <Chip tone="good">CHECKED IN</Chip>
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat label="Sessions · May" value="26" />
            <MiniStat label="Total" value="142" />
            <MiniStat label="W–L" value="11–3" />
          </div>
        </div>

        <div className="px-4 py-4">
          {tab === "Home" ? <Home /> : null}
          {tab === "Calendar" ? <CalendarTab /> : null}
          {tab === "Games" ? <Games /> : null}
          {tab === "Docs" ? <Docs /> : null}
          {tab === "Plans" ? <Plans /> : null}
          {tab === "Profile" ? <Profile /> : null}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-ink-800 bg-ink-950/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-1 flex-col items-center gap-1 py-1.5 ${
              tab === t ? "text-court-400" : "text-ink-400"
            }`}
          >
            <span className="font-mono text-sm leading-none">{glyph[t]}</span>
            <span className="font-mono text-[9px] uppercase tracking-widest">{t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-ink-850 p-2.5 ring-1 ring-ink-700">
      <div className="label-mono">{label}</div>
      <div className="font-display mt-1 text-xl tracking-tight text-ink-100">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <div className="label-mono mb-2">{title}</div>
      <div className="panel p-3">{children}</div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Card title="Next session">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-court-500/15 font-mono text-xs text-court-400">
            U16
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-ink-100">U-16 North · Practice</div>
            <div className="font-mono text-[10px] text-ink-400">Court A · 14:00 · within 300 m</div>
          </div>
        </div>
        <button className="mt-3 w-full rounded-md bg-court-500 py-2.5 text-sm font-semibold text-ink-950">
          Check in & open attendance
        </button>
      </Card>

      <Card title="Attendance · U-16 North">
        <div className="divide-y divide-ink-800">
          {players.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-ink-100">{p.name}</div>
                {p.status !== "Active" ? (
                  <div className="font-mono text-[9px] text-warn">
                    {p.status === "Inactive" ? "BLOCKED · UNPAID" : "PAYMENT DUE"}
                  </div>
                ) : null}
              </div>
              <div className="flex gap-1">
                {["P", "A", "E"].map((m, i) => (
                  <span
                    key={m}
                    className={`grid h-7 w-7 place-items-center rounded font-mono text-[10px] ring-1 ${
                      i === 0 && p.status !== "Inactive"
                        ? "bg-court-500 text-ink-950 ring-court-500"
                        : "bg-ink-850 text-ink-300 ring-ink-700"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function CalendarTab() {
  return (
    <Card title="My week">
      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <span className="w-14 font-mono text-[10px] text-ink-400">
              {s.date.slice(8)}/{s.date.slice(5, 7)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-ink-100">{s.title}</div>
              <div className="font-mono text-[10px] text-ink-400">
                {s.time} · {s.branch}
              </div>
            </div>
            <Chip tone={s.kind === "Game" ? "accent" : "neutral"}>{s.kind.toUpperCase()}</Chip>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Games() {
  return (
    <>
      <Card title="Record">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Wins" value="11" />
          <MiniStat label="Losses" value="3" />
        </div>
      </Card>
      <Card title="Games">
        <div className="divide-y divide-ink-800">
          {[
            ["U-14 vs Cedar BC", "Today 17:30", "Upcoming"],
            ["U-16 vs Antonine", "10 May", "L 55–61"],
            ["U-16 vs Sagesse", "3 May", "W 71–58"],
          ].map(([g, d, r]) => (
            <div key={g} className="flex items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-ink-100">{g}</div>
                <div className="font-mono text-[10px] text-ink-400">{d}</div>
              </div>
              <Chip tone={String(r).startsWith("W") ? "good" : String(r).startsWith("L") ? "bad" : "accent"}>
                {String(r).toUpperCase()}
              </Chip>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Docs() {
  return (
    <Card title="Shared with me">
      <div className="grid grid-cols-2 gap-2">
        {["Offense concepts", "Defense concepts", "Level 1 quiz", "Rules exam 2026"].map((d) => (
          <div key={d} className="rounded bg-ink-850 p-3 ring-1 ring-ink-700">
            <div className="font-mono text-lg text-court-400">▤</div>
            <div className="mt-1.5 text-xs text-ink-100">{d}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Plans() {
  return (
    <>
      <Card title="Practice plan builder">
        <div className="text-sm text-ink-100">U-16 North · 22 May</div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-ink-850">
          <div className="w-[15%] bg-court-500" />
          <div className="w-[40%] bg-good" />
          <div className="w-[25%] bg-warn" />
          <div className="w-[20%] bg-ink-700" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Warm-up", "10 min"],
            ["Live 3v3", "25 min"],
            ["Shooting lines", "15 min"],
            ["Cool down", "10 min"],
          ].map(([s, t]) => (
            <div
              key={s}
              className="flex items-center justify-between rounded bg-ink-850 px-3 py-2 ring-1 ring-ink-700"
            >
              <span className="text-xs text-ink-100">{s}</span>
              <span className="font-mono text-[10px] text-ink-400">{t}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid h-32 place-items-center rounded bg-ink-850 ring-1 ring-ink-700">
          <span className="label-mono">Drill drawing board</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-md bg-ink-850 py-2 text-xs font-semibold text-ink-200 ring-1 ring-ink-700">
            Save draft
          </button>
          <button className="flex-1 rounded-md bg-court-500 py-2 text-xs font-semibold text-ink-950">
            Submit for approval
          </button>
        </div>
      </Card>
      <Card title="My plans">
        <div className="divide-y divide-ink-800">
          {[
            ["Transition week", "In review"],
            ["Pick & roll basics", "Approved"],
            ["Rebounding block", "Draft"],
          ].map(([p, s]) => (
            <div key={p} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-ink-100">{p}</span>
              <Chip tone={s === "Approved" ? "good" : s === "In review" ? "warn" : "neutral"}>
                {String(s).toUpperCase()}
              </Chip>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Profile() {
  return (
    <>
      <Card title="My details">
        <div className="space-y-2 text-sm">
          {[
            ["Name", "Karim Haddad"],
            ["Date of birth", "1988-03-14"],
            ["Phone", "+961 3 402 118"],
            ["Email", "karim@alba.io"],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-ink-400">{l}</span>
              <span className="text-ink-100">{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Payments">
        <div className="space-y-2 text-sm">
          {[
            ["Rate per session", "$45"],
            ["Sessions this month", "26"],
            ["Paid", "$1,020"],
            ["Outstanding", "$1,150"],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-ink-400">{l}</span>
              <span className="font-mono text-xs text-ink-100">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
