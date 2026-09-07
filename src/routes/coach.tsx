import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Chip, Field, Input, Select } from "@/components/kit";
import markAsset from "@/assets/vescio-vector-mark.png.asset.json";
import { ThemeToggle } from "@/lib/theme";
import { useDB } from "@/lib/data-store";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CoachPortal() {
  const { db, update } = useDB();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");
  const [coachId, setCoachId] = useState(db.coaches[0]?.id ?? "");
  const coach = db.coaches.find((c) => c.id === coachId) ?? db.coaches[0];

  const mySessions = useMemo(
    () => db.sessions.filter((s) => s.coach === coach?.name),
    [db.sessions, coach?.name],
  );

  if (!coach) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950 text-ink-300">
        No coaches yet.
      </div>
    );
  }

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
              {initials(coach.name)}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-medium text-ink-100">{coach.name}</div>
              <div className="font-mono text-[10px] text-ink-400">
                {coach.level} · {coach.branch}
              </div>
            </div>
            <span className="ml-auto">
              <Chip tone={coach.portal ? "good" : "warn"}>
                {coach.portal ? "PORTAL ON" : "PORTAL OFF"}
              </Chip>
            </span>
          </div>

          <div className="mt-3">
            <Select
              value={coachId}
              onChange={setCoachId}
              options={db.coaches.map((c) => c.id)}
              labels={Object.fromEntries(db.coaches.map((c) => [c.id, c.name]))}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat label="Sessions" value={String(coach.sessions)} />
            <MiniStat label="Target" value={String(coach.sessionTarget)} />
            <MiniStat label="W–L" value={`${coach.wins}–${coach.losses}`} />
          </div>
        </div>

        <div className="px-4 py-4">
          {tab === "Home" ? <Home coachName={coach.name} sessions={mySessions} /> : null}
          {tab === "Calendar" ? <CalendarTab sessions={mySessions} /> : null}
          {tab === "Games" ? <Games coachName={coach.name} /> : null}
          {tab === "Docs" ? <Docs /> : null}
          {tab === "Plans" ? <PlansTab coachName={coach.name} /> : null}
          {tab === "Profile" ? <Profile coachId={coach.id} /> : null}
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
      </nav>    </div>
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

type SessionLike = ReturnType<typeof useDB>["db"]["sessions"][number];

function Home({ coachName, sessions }: { coachName: string; sessions: SessionLike[] }) {
  const { db, update } = useDB();
  const next = sessions.find((s) => s.status === "Live") ?? sessions[0];
  const [openSession, setOpenSession] = useState<string | null>(null);

  const active = openSession ?? (next && next.status === "Live" ? next.id : null);
  const roster = db.players.filter((p) => p.branch === (next?.branch ?? ""));
  const present = active ? (db.attendance[active] ?? []) : [];

  function toggle(playerId: string) {
    if (!active) return;
    update((d) => {
      const list = d.attendance[active] ?? [];
      return {
        ...d,
        attendance: {
          ...d.attendance,
          [active]: list.includes(playerId)
            ? list.filter((x) => x !== playerId)
            : [...list, playerId],
        },
      };
    });
  }

  if (!next) return <Card title="Next session">No sessions assigned to {coachName}.</Card>;

  return (
    <>
      <Card title="Next session">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-court-500/15 font-mono text-[10px] text-court-400">
            {next.kind.slice(0, 4).toUpperCase()}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium text-ink-100">{next.title}</div>
            <div className="font-mono text-[10px] text-ink-400">
              {next.detail} · {next.date} {next.time}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setOpenSession(next.id);
            update((d) => ({
              ...d,
              sessions: d.sessions.map((s) => (s.id === next.id ? { ...s, status: "Live" } : s)),
            }));
          }}
          className="mt-3 w-full rounded-md bg-court-500 py-2.5 text-sm font-semibold text-ink-950"
        >
          Check in & open attendance
        </button>
      </Card>

      {active ? (
        <Card title={`Attendance · ${present.length}/${roster.length} present`}>
          <div className="divide-y divide-ink-800">
            {roster.map((p) => {
              const isPresent = present.includes(p.id);
              const blocked = p.status === "Inactive";
              return (
                <div key={p.id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-ink-100">{p.name}</div>
                    {p.status !== "Active" ? (
                      <div className="font-mono text-[9px] text-warn">
                        {blocked ? "BLOCKED · UNPAID" : "PAYMENT DUE"}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => toggle(p.id)}
                    className={`grid h-8 w-16 place-items-center rounded font-mono text-[10px] ring-1 ${
                      isPresent
                        ? "bg-court-500 text-ink-950 ring-court-500"
                        : "bg-ink-850 text-ink-300 ring-ink-700"
                    } ${blocked ? "opacity-40" : ""}`}
                  >
                    {isPresent ? "PRESENT" : "ABSENT"}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
    </>
  );
}

function CalendarTab({ sessions }: { sessions: SessionLike[] }) {
  return (
    <Card title="My schedule">
      {sessions.length === 0 ? (
        <div className="py-4 text-center font-mono text-[11px] text-ink-400">
          Nothing scheduled.
        </div>
      ) : (
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
      )}
    </Card>
  );
}

function Games({ coachName }: { coachName: string }) {
  const { db, update } = useDB();
  const coach = db.coaches.find((c) => c.name === coachName)!;
  const games = db.sessions.filter((s) => s.kind === "Game" && s.coach === coachName);

  function record(result: "win" | "loss") {
    update((d) => ({
      ...d,
      coaches: d.coaches.map((c) =>
        c.id === coach.id
          ? { ...c, wins: c.wins + (result === "win" ? 1 : 0), losses: c.losses + (result === "loss" ? 1 : 0) }
          : c,
      ),
    }));
  }

  return (
    <>
      <Card title="Record">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Wins" value={String(coach.wins)} />
          <MiniStat label="Losses" value={String(coach.losses)} />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => record("win")}
            className="flex-1 rounded-md bg-court-500 py-2 text-xs font-semibold text-ink-950"
          >
            Log a win
          </button>
          <button
            onClick={() => record("loss")}
            className="flex-1 rounded-md bg-ink-850 py-2 text-xs font-semibold text-ink-200 ring-1 ring-ink-700"
          >
            Log a loss
          </button>
        </div>
      </Card>
      <Card title="My games">
        {games.length === 0 ? (
          <div className="py-4 text-center font-mono text-[11px] text-ink-400">No games yet.</div>
        ) : (
          <div className="divide-y divide-ink-800">
            {games.map((g) => (
              <div key={g.id} className="flex items-center gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink-100">{g.title}</div>
                  <div className="font-mono text-[10px] text-ink-400">
                    {g.date} · {g.time}
                  </div>
                </div>
                <Chip tone={g.status === "Official" ? "good" : "accent"}>
                  {g.status.toUpperCase()}
                </Chip>
              </div>
            ))}
          </div>
        )}
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

function PlansTab({ coachName }: { coachName: string }) {
  const { db, update } = useDB();
  const mine = db.plans.filter((p) => p.coach === coachName);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(
    emptyPlan(coachName, db.lists["Age categories"]?.[0] ?? "U-14"),
  );
  const [viewing, setViewing] = useState<string | null>(null);

  function save(status: "Draft" | "Submitted") {
    if (!draft.title.trim()) return;
    const payload = { ...draft, coach: coachName, status };
    update((d) => ({
      ...d,
      plans: editingId
        ? d.plans.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
        : [{ ...payload, id: `pl-${Date.now().toString(36)}` }, ...d.plans],
    }));
    setEditingId(null);
    setDraft(emptyPlan(coachName, db.lists["Age categories"]?.[0] ?? "U-14"));
  }

  const shown = viewing ? db.plans.find((p) => p.id === viewing) : null;

  return (
    <>
      <Card title={editingId ? "Editing plan" : "Practice plan builder"}>
        <PlanEditor value={draft} onChange={setDraft} coachLocked />
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => save("Draft")}
            className="flex-1 rounded-md bg-ink-850 py-2 text-xs font-semibold text-ink-200 ring-1 ring-ink-700"
          >
            Save draft
          </button>
          <button
            onClick={() => save("Submitted")}
            className="flex-1 rounded-md bg-court-500 py-2 text-xs font-semibold text-ink-950"
          >
            Submit for approval
          </button>
        </div>
        {editingId ? (
          <button
            onClick={() => {
              setEditingId(null);
              setDraft(emptyPlan(coachName, db.lists["Age categories"]?.[0] ?? "U-14"));
            }}
            className="mt-2 w-full rounded-md py-2 font-mono text-[10px] uppercase tracking-widest text-ink-400 ring-1 ring-ink-700"
          >
            Cancel editing
          </button>
        ) : null}
      </Card>

      <Card title="My plans">
        {mine.length === 0 ? (
          <div className="py-4 text-center font-mono text-[11px] text-ink-400">No plans yet.</div>
        ) : (
          <div className="divide-y divide-ink-800">
            {mine.map((p) => (
              <div key={p.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink-100">{p.title}</div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {p.category} · {p.date} · {p.blocks.length} sections
                    </div>
                  </div>
                  <Chip
                    tone={
                      p.status === "Approved"
                        ? "good"
                        : p.status === "Rejected"
                          ? "bad"
                          : p.status === "Submitted"
                            ? "warn"
                            : "neutral"
                    }
                  >
                    {p.status.toUpperCase()}
                  </Chip>
                </div>
                {p.review ? (
                  <div className="mt-1 rounded bg-ink-850 px-2 py-1 font-mono text-[10px] text-ink-300">
                    Director: {p.review}
                  </div>
                ) : null}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setViewing(viewing === p.id ? null : p.id)}
                    className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-court-400 ring-1 ring-ink-700"
                  >
                    {viewing === p.id ? "Hide" : "View"}
                  </button>
                  <button
                    onClick={() => {
                      const { id: _id, ...rest } = p;
                      setDraft(rest);
                      setEditingId(p.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-300 ring-1 ring-ink-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (!window.confirm("Delete this plan?")) return;
                      update((d) => ({ ...d, plans: d.plans.filter((x) => x.id !== p.id) }));
                    }}
                    className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-bad ring-1 ring-ink-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {shown ? (
          <div className="mt-3 rounded-md bg-ink-900 ring-1 ring-ink-700">
            <PlanView plan={shown} />
          </div>
        ) : null}
      </Card>
    </>
  );
}


function Profile({ coachId }: { coachId: string }) {
  const { db, update } = useDB();
  const coach = db.coaches.find((c) => c.id === coachId)!;
  const [form, setForm] = useState({ phone: coach.phone, email: coach.email });
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Card title="My details">
        <div className="grid gap-3">
          <Field label="Name">
            <Input value={coach.name} onChange={() => {}} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
        </div>
        <button
          onClick={() => {
            update((d) => ({
              ...d,
              coaches: d.coaches.map((c) => (c.id === coachId ? { ...c, ...form } : c)),
            }));
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
          }}
          className="mt-3 w-full rounded-md bg-court-500 py-2 text-xs font-semibold text-ink-950"
        >
          {saved ? "Saved" : "Save my details"}
        </button>
      </Card>
      <Card title="Payments">
        <div className="space-y-2 text-sm">
          {[
            ["Rate per session", `$${coach.rate}`],
            ["Sessions this month", String(coach.sessions)],
            ["Earned", `$${coach.rate * coach.sessions}`],
            ["Outstanding", `$${coach.outstanding}`],
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
