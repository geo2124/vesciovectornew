import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  Field,
  FilterSelect,
  Input,
  Modal,
  Panel,
  Select,
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { SessionItem } from "@/lib/mock-data";

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
      { property: "og:description", content: "All academy activity in month, week or day view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function CalendarPage() {
  const { db, update } = useDB();
  const [view, setView] = useState<(typeof views)[number]>("Month");
  const first = db.sessions[0]?.date ?? new Date().toISOString().slice(0, 10);
  const [cursor, setCursor] = useState(() => new Date(`${first}T00:00:00`));
  const [kind, setKind] = useState("");
  const [branch, setBranch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<SessionItem, "id">>({
    kind: "Practice",
    title: "",
    detail: "",
    date: first,
    time: "17:00",
    branch: "",
    coach: "",
    status: "Planned",
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const branches = db.branches.map((b) => b.name);

  const visible = db.sessions.filter(
    (s) => (!kind || s.kind === kind) && (!branch || s.branch === branch),
  );
  const forDate = (d: string) => visible.filter((s) => s.date === d);

  function shift(n: number) {
    const next = new Date(cursor);
    if (view === "Month") next.setMonth(next.getMonth() + n);
    else if (view === "Week") next.setDate(next.getDate() + n * 7);
    else next.setDate(next.getDate() + n);
    setCursor(next);
  }

  function openNew(date?: string) {
    setForm({
      kind: "Practice",
      title: "",
      detail: "",
      date: date ?? cursor.toISOString().slice(0, 10),
      time: "17:00",
      branch: branches[0] ?? "",
      coach: db.coaches[0]?.name ?? "",
      status: "Planned",
    });
    setOpen(true);
  }

  function submit() {
    if (!form.title.trim()) return;
    update((d) => ({
      ...d,
      sessions: [{ ...form, id: `e-${Date.now().toString(36)}` }, ...d.sessions],
    }));
    setOpen(false);
  }

  const label =
    view === "Day"
      ? cursor.toDateString()
      : `${MONTHS[month]} ${year}`;

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
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous"
            className="rounded bg-ink-850 px-2 py-1.5 font-mono text-xs text-ink-200 ring-1 ring-ink-700"
          >
            ‹
          </button>
          <span className="font-display px-1 text-sm tracking-tight text-ink-100">{label}</span>
          <button
            onClick={() => shift(1)}
            aria-label="Next"
            className="rounded bg-ink-850 px-2 py-1.5 font-mono text-xs text-ink-200 ring-1 ring-ink-700"
          >
            ›
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <FilterSelect
            label="Type"
            value={kind}
            onChange={setKind}
            options={["Practice", "Game", "Seminar", "Camp"]}
          />
          <FilterSelect label="Branch" value={branch} onChange={setBranch} options={branches} />
          <Button onClick={() => openNew()}>+ New activity</Button>
        </div>
      </div>

      {view === "Month" ? (
        <MonthGrid year={year} month={month} forDate={forDate} onPick={openNew} />
      ) : null}
      {view === "Week" ? <WeekGrid cursor={cursor} forDate={forDate} onPick={openNew} /> : null}
      {view === "Day" ? <DayList cursor={cursor} forDate={forDate} /> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.keys(kindTone).map((k) => (
          <Chip key={k} tone={kindTone[k] ?? "neutral"}>
            {k.toUpperCase()}
          </Chip>
        ))}
      </div>

      <Modal
        open={open}
        title="New activity"
        meta="Adds to the calendar and the sessions list"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel="Create activity"
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Title">
            <Input value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          </Field>
          <Field label="Type">
            <Select
              value={form.kind}
              onChange={(v) => setForm({ ...form, kind: v as SessionItem["kind"] })}
              options={["Practice", "Game", "Seminar", "Camp"]}
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={["", ...branches, "HQ"]}
            />
          </Field>
          <Field label="Coach">
            <Select
              value={form.coach}
              onChange={(v) => setForm({ ...form, coach: v })}
              options={["", ...db.coaches.map((c) => c.name)]}
            />
          </Field>
          <Field label="Detail">
            <Input value={form.detail} onChange={(v) => setForm({ ...form, detail: v })} />
          </Field>
        </div>
      </Modal>
    </AppShell>
  );
}

function MonthGrid({
  year,
  month,
  forDate,
  onPick,
}: {
  year: number;
  month: number;
  forDate: (d: string) => SessionItem[];
  onPick: (d: string) => void;
}) {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // week starts Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i - offset + 1);

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
        {cells.map((d, i) => {
          const inMonth = d >= 1 && d <= daysInMonth;
          const date = inMonth ? iso(year, month, d) : "";
          const events = inMonth ? forDate(date) : [];
          return (
            <button
              key={i}
              type="button"
              onClick={() => inMonth && onPick(date)}
              className="min-h-[92px] border-b border-r border-ink-800 p-1.5 text-left last:border-r-0 hover:bg-ink-850/50"
            >
              <div className={`font-mono text-[10px] ${inMonth ? "text-ink-300" : "text-ink-700"}`}>
                {inMonth ? d : ""}
              </div>
              <div className="mt-1 space-y-1">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="truncate rounded bg-ink-850 px-1.5 py-1 text-[10px] text-ink-200 ring-1 ring-ink-800"
                  >
                    <span className="text-court-400">{e.time}</span> {e.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function WeekGrid({
  cursor,
  forDate,
  onPick,
}: {
  cursor: Date;
  forDate: (d: string) => SessionItem[];
  onPick: (d: string) => void;
}) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
      {days.map((d) => {
        const date = iso(d.getFullYear(), d.getMonth(), d.getDate());
        const events = forDate(date);
        return (
          <div key={date} className="panel p-3">
            <div className="label-mono mb-2 flex items-center justify-between">
              <span>{d.toDateString().slice(0, 10)}</span>
              <button
                type="button"
                onClick={() => onPick(date)}
                className="text-court-400"
                aria-label={`Add activity on ${date}`}
              >
                +
              </button>
            </div>
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className="font-mono text-[10px] text-ink-700">No activity</div>
              ) : (
                events.map((e) => (
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

function DayList({ cursor, forDate }: { cursor: Date; forDate: (d: string) => SessionItem[] }) {
  const date = iso(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  const events = [...forDate(date)].sort((a, b) => a.time.localeCompare(b.time));
  return (
    <Panel title={cursor.toDateString()} meta={`${events.length} activities`}>
      <div className="divide-y divide-ink-800">
        {events.length === 0 ? (
          <div className="px-4 py-10 text-center font-mono text-[11px] text-ink-400">
            Nothing scheduled on this day.
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="flex items-start gap-4 px-4 py-3">
              <span className="w-12 font-mono text-[11px] text-ink-400">{ev.time}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink-100">{ev.title}</div>
                <div className="font-mono text-[10px] text-ink-400">
                  {ev.detail} · {ev.coach}
                </div>
              </div>
              <Chip tone={kindTone[ev.kind] ?? "neutral"}>{ev.kind.toUpperCase()}</Chip>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
