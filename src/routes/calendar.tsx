import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Chip, Filters, Panel } from "@/components/kit";
import { sessions } from "@/lib/mock-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Vescio Vector" },
      {
        name: "description",
        content:
          "Month, week and day views of every practice, game, camp, seminar and academy event.",
      },
      { property: "og:title", content: "Calendar — Vescio Vector" },
      {
        property: "og:description",
        content: "All academy activity in month, week or day view.",
      },
    ],
  }),
  component: CalendarPage,
});

const views = ["Month", "Week", "Day"] as const;

const kindTone: Record<string, "accent" | "good" | "warn" | "neutral"> = {
  Practice: "good",
  Game: "accent",
  Seminar: "neutral",
  Camp: "warn",
};

function CalendarPage() {
  const [view, setView] = useState<(typeof views)[number]>("Month");

  return (
    <AppShell crumb="OPS / CALENDAR" title="Calendar">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md bg-ink-850 p-0.5 ring-1 ring-ink-700">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                view === v ? "bg-court-500 text-ink-950" : "text-ink-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="font-display text-sm tracking-tight text-ink-100">May 2026</span>
        <div className="ml-auto flex items-center gap-2">
          <Filters items={["Branch", "Type", "Team"]} />
          <Button>+ New activity</Button>
        </div>
      </div>

      {view === "Month" ? <MonthGrid /> : null}
      {view === "Week" ? <WeekGrid /> : null}
      {view === "Day" ? <DayList /> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.keys(kindTone).map((k) => (
          <Chip key={k} tone={kindTone[k] ?? "neutral"}>
            {k.toUpperCase()}
          </Chip>
        ))}
      </div>
    </AppShell>
  );
}

function MonthGrid() {
  const days = Array.from({ length: 35 }, (_, i) => i - 3);
  return (
    <Panel>
      <div className="grid grid-cols-7 border-b border-ink-800">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
          <div key={d} className="label-mono px-2 py-2 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const inMonth = d >= 1 && d <= 31;
          const dayEvents = inMonth ? sessions.filter((s) => Number(s.date.slice(-2)) === d) : [];
          return (
            <div
              key={i}
              className="min-h-[92px] border-b border-r border-ink-800 p-1.5 last:border-r-0"
            >
              <div
                className={`font-mono text-[10px] ${inMonth ? "text-ink-300" : "text-ink-700"}`}
              >
                {inMonth ? d : ""}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="truncate rounded bg-ink-850 px-1.5 py-1 text-[10px] text-ink-200 ring-1 ring-ink-800"
                  >
                    <span className="text-court-400">{e.time}</span> {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function WeekGrid() {
  const days = ["Mon 18", "Tue 19", "Wed 20", "Thu 21", "Fri 22", "Sat 23", "Sun 24"];
  return (
    <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
      {days.map((d, idx) => {
        const dayEvents = sessions.filter((s) => Number(s.date.slice(-2)) === 18 + idx);
        return (
          <div key={d} className="panel p-3">
            <div className="label-mono mb-2">{d}</div>
            <div className="space-y-2">
              {dayEvents.length === 0 ? (
                <div className="font-mono text-[10px] text-ink-700">No activity</div>
              ) : (
                dayEvents.map((e) => (
                  <div key={e.id} className="rounded bg-ink-850 p-2 ring-1 ring-ink-800">
                    <div className="font-mono text-[10px] text-court-400">{e.time}</div>
                    <div className="text-xs font-medium text-ink-100">{e.title}</div>
                    <div className="font-mono text-[10px] text-ink-400">{e.branch}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayList() {
  const hours = ["09:00", "10:00", "14:00", "16:00", "17:30", "19:00"];
  return (
    <Panel title="Monday 18 May" meta="3 activities · 2 branches">
      <div className="divide-y divide-ink-800">
        {hours.map((h) => {
          const ev = sessions.find((s) => s.time === h);
          return (
            <div key={h} className="flex items-start gap-4 px-4 py-3">
              <span className="w-12 font-mono text-[11px] text-ink-400">{h}</span>
              {ev ? (
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-100">{ev.title}</div>
                  <div className="font-mono text-[10px] text-ink-400">
                    {ev.detail} · {ev.coach}
                  </div>
                </div>
              ) : (
                <span className="flex-1 font-mono text-[10px] text-ink-700">—</span>
              )}
              {ev ? <Chip tone={kindTone[ev.kind] ?? "neutral"}>{ev.kind.toUpperCase()}</Chip> : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
