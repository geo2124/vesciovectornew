import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  EmptyState,
  Field,
  FilterSelect,
  Input,
  Modal,
  Panel,
  Row,
  RowActions,
  Search,
  Select,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { SessionItem } from "@/lib/mock-data";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions — Vescio Vector" },
      {
        name: "description",
        content:
          "Practices, games, camps and seminars with attendance tracking, approvals and coach assignment.",
      },
      { property: "og:title", content: "Sessions — Vescio Vector" },
      {
        property: "og:description",
        content: "Plan sessions, approve games and take attendance in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SessionsPage,
});

export const statuses: SessionItem["status"][] = [
  "Planned",
  "Pending approval",
  "Pre-approved",
  "Official",
  "Live",
  "Completed",
];

const statusTone: Record<SessionItem["status"], "accent" | "good" | "warn" | "neutral"> = {
  Live: "accent",
  Planned: "neutral",
  "Pending approval": "warn",
  "Pre-approved": "good",
  Official: "accent",
  Completed: "good",
};

const blank: Omit<SessionItem, "id"> = {
  kind: "Practice",
  title: "",
  detail: "",
  date: new Date().toISOString().slice(0, 10),
  time: "17:00",
  branch: "",
  coach: "",
  status: "Planned",
};

function SessionsPage() {
  const { db, update } = useDB();
  const sessions = db.sessions;
  const branches = db.branches.map((b) => b.name);
  const coachNames = db.coaches.map((c) => c.name);

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [branch, setBranch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SessionItem | null>(null);
  const [form, setForm] = useState<Omit<SessionItem, "id">>(blank);
  const [attendFor, setAttendFor] = useState<SessionItem | null>(null);

  const filtered = sessions.filter(
    (s) =>
      (!q.trim() ||
        [s.title, s.detail, s.coach].join(" ").toLowerCase().includes(q.toLowerCase())) &&
      (!kind || s.kind === kind) &&
      (!branch || s.branch === branch),
  );

  const pending = sessions.filter((s) => s.status === "Pending approval").length;
  const games = sessions.filter((s) => s.kind === "Game").length;

  function openNew() {
    setEditing(null);
    setForm({ ...blank, branch: branches[0] ?? "", coach: coachNames[0] ?? "" });
    setOpen(true);
  }
  function openEdit(s: SessionItem) {
    setEditing(s);
    const { id: _id, ...rest } = s;
    setForm(rest);
    setOpen(true);
  }
  function submit() {
    if (!form.title.trim()) return;
    update((d) =>
      editing
        ? { ...d, sessions: d.sessions.map((s) => (s.id === editing.id ? { ...s, ...form } : s)) }
        : { ...d, sessions: [{ ...form, id: `e-${Date.now().toString(36)}` }, ...d.sessions] },
    );
    setOpen(false);
  }
  function remove(s: SessionItem) {
    if (!window.confirm(`Delete "${s.title}"?`)) return;
    update((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== s.id) }));
  }
  function setStatus(s: SessionItem, status: SessionItem["status"]) {
    update((d) => ({
      ...d,
      sessions: d.sessions.map((x) => (x.id === s.id ? { ...x, status } : x)),
    }));
  }

  const present = attendFor ? (db.attendance[attendFor.id] ?? []) : [];
  const roster = attendFor
    ? db.players.filter((p) => !attendFor.branch || p.branch === attendFor.branch)
    : [];

  function togglePresent(playerId: string) {
    if (!attendFor) return;
    update((d) => {
      const cur = d.attendance[attendFor.id] ?? [];
      const next = cur.includes(playerId)
        ? cur.filter((x) => x !== playerId)
        : [...cur, playerId];
      return { ...d, attendance: { ...d.attendance, [attendFor.id]: next } };
    });
  }

  return (
    <AppShell crumb="OPS / SESSIONS" title="Sessions">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Scheduled" value={String(sessions.length)} note="all upcoming activity" accent />
        <Stat label="Games" value={String(games)} />
        <Stat label="Awaiting approval" value={String(pending)} note="technical direction" />
        <Stat
          label="Attendance marked"
          value={String(Object.values(db.attendance).reduce((a, v) => a + v.length, 0))}
          note="player check-ins"
          accent
        />
      </div>

      <Panel
        className="mt-4"
        title="Activity list"
        meta="Practices, games, camps and seminars"
        action={
          <>
            <FilterSelect
              label="Type"
              value={kind}
              onChange={setKind}
              options={["Practice", "Game", "Seminar", "Camp"]}
            />
            <FilterSelect label="Branch" value={branch} onChange={setBranch} options={branches} />
            <Button onClick={openNew}>+ New session</Button>
          </>
        }
      >
        <div className="border-b border-ink-800 px-4 py-3">
          <Search value={q} onChange={setQ} placeholder="Search sessions, coaches…" />
        </div>
        <Table
          head={
            <>
              <Th>ACTIVITY</Th>
              <Th>TYPE</Th>
              <Th hide>WHEN</Th>
              <Th hide>COACH</Th>
              <Th>
                <span className="block text-right">STATUS</span>
              </Th>
            </>
          }
          footer={`SHOWING ${filtered.length} OF ${sessions.length}`}
        >
          {filtered.length === 0 ? (
            <EmptyState>No sessions match these filters.</EmptyState>
          ) : (
            filtered.map((s) => (
              <Row key={s.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div>{s.title}</div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {s.detail || "—"} · {s.branch || "—"}
                    </div>
                  </div>
                </Td>
                <Td>
                  <Chip>{s.kind.toUpperCase()}</Chip>
                </Td>
                <Td hide>
                  <span className="font-mono text-xs">
                    {s.date} · {s.time}
                  </span>
                </Td>
                <Td hide>{s.coach || "—"}</Td>
                <Td right>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Chip tone={statusTone[s.status]}>{s.status.toUpperCase()}</Chip>
                    {s.status === "Pending approval" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(s, "Pre-approved")}
                        className="rounded px-2 py-1 font-mono text-[10px] text-good ring-1 ring-ink-700 hover:bg-good/10"
                      >
                        APPROVE
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setAttendFor(s)}
                      className="rounded px-2 py-1 font-mono text-[10px] text-court-400 ring-1 ring-ink-700 hover:bg-court-500/10"
                    >
                      ATTENDANCE
                    </button>
                    <RowActions onEdit={() => openEdit(s)} onDelete={() => remove(s)} />
                  </div>
                </Td>
              </Row>
            ))
          )}
        </Table>
      </Panel>

      <Modal
        open={open}
        title={editing ? "Edit session" : "New session"}
        meta="Type, schedule, branch and coach"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create session"}
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
              options={["", ...coachNames]}
            />
          </Field>
          <Field label="Detail" hint="court, opponent, notes">
            <Input value={form.detail} onChange={(v) => setForm({ ...form, detail: v })} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as SessionItem["status"] })}
              options={statuses}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={attendFor !== null}
        title={attendFor ? `Attendance · ${attendFor.title}` : ""}
        meta={attendFor ? `${present.length} present of ${roster.length}` : ""}
        onClose={() => setAttendFor(null)}
        wide
      >
        <div className="max-h-[60vh] space-y-1 overflow-y-auto p-4">
          {roster.length === 0 ? (
            <div className="py-8 text-center font-mono text-[11px] text-ink-400">
              No players registered for this branch yet.
            </div>
          ) : (
            roster.map((p) => {
              const on = present.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePresent(p.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ring-1 transition-colors ${
                    on ? "bg-good/10 ring-good/40" : "bg-ink-850 ring-ink-700"
                  }`}
                >
                  <span className="flex-1">
                    <span className="block text-sm text-ink-100">{p.name}</span>
                    <span className="block font-mono text-[10px] text-ink-400">
                      {p.category} · {p.team || "no team"}
                    </span>
                  </span>
                  <Chip tone={on ? "good" : "neutral"}>{on ? "PRESENT" : "ABSENT"}</Chip>
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
