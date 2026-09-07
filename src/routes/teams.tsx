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
import type { Team } from "@/lib/mock-data";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams — Vescio Vector" },
      {
        name: "description",
        content:
          "Team rosters by age category and gender, with head coaches, assistants, branches and win-loss records.",
      },
      { property: "og:title", content: "Teams — Vescio Vector" },
      {
        property: "og:description",
        content: "Build rosters, assign coaches and follow every team record.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamsPage,
});

const blank: Omit<Team, "id"> = {
  name: "",
  category: "U-14",
  gender: "Boys",
  headCoach: "",
  branch: "",
  players: 0,
  wins: 0,
  losses: 0,
};

function TeamsPage() {
  const { db, update } = useDB();
  const teams = db.teams;
  const coachNames = db.coaches.map((c) => c.name);
  const branches = db.branches.map((b) => b.name);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [branch, setBranch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState<Omit<Team, "id">>(blank);
  const [roster, setRoster] = useState<Team | null>(null);

  const filtered = teams.filter(
    (t) =>
      (!q.trim() ||
        [t.name, t.headCoach, t.assistant ?? ""].join(" ").toLowerCase().includes(q.toLowerCase())) &&
      (!cat || t.category === cat) &&
      (!branch || t.branch === branch),
  );

  const wins = teams.reduce((a, t) => a + t.wins, 0);
  const losses = teams.reduce((a, t) => a + t.losses, 0);

  function rosterOf(team: Team) {
    return db.players.filter((p) => p.team === team.name);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...blank, branch: branches[0] ?? "", headCoach: coachNames[0] ?? "" });
    setOpen(true);
  }
  function openEdit(t: Team) {
    setEditing(t);
    const { id: _id, ...rest } = t;
    setForm(rest);
    setOpen(true);
  }
  function submit() {
    if (!form.name.trim()) return;
    update((d) =>
      editing
        ? { ...d, teams: d.teams.map((t) => (t.id === editing.id ? { ...t, ...form } : t)) }
        : { ...d, teams: [{ ...form, id: `t-${Date.now().toString(36)}` }, ...d.teams] },
    );
    setOpen(false);
  }
  function remove(t: Team) {
    if (!window.confirm(`Delete team ${t.name}?`)) return;
    update((d) => ({ ...d, teams: d.teams.filter((x) => x.id !== t.id) }));
  }

  return (
    <AppShell crumb="ROSTER / TEAMS" title="Teams">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Teams" value={String(teams.length)} note="across all categories" accent />
        <Stat label="Rostered players" value={String(db.players.filter((p) => p.team).length)} />
        <Stat label="Season record" value={`${wins}–${losses}`} note="all teams combined" />
        <Stat
          label="Win rate"
          value={`${wins + losses ? Math.round((wins / (wins + losses)) * 100) : 0}%`}
          accent
        />
      </div>

      <Panel
        className="mt-4"
        title="Team list"
        meta="Categories are validated against player date of birth"
        action={
          <>
            <FilterSelect
              label="Category"
              value={cat}
              onChange={setCat}
              options={Array.from(new Set(teams.map((t) => t.category)))}
            />
            <FilterSelect label="Branch" value={branch} onChange={setBranch} options={branches} />
            <Button onClick={openNew}>+ New team</Button>
          </>
        }
      >
        <div className="border-b border-ink-800 px-4 py-3">
          <Search value={q} onChange={setQ} placeholder="Search teams or coaches…" />
        </div>
        <Table
          head={
            <>
              <Th>TEAM</Th>
              <Th>CATEGORY</Th>
              <Th hide>HEAD COACH</Th>
              <Th hide>BRANCH</Th>
              <Th>PLAYERS</Th>
              <Th>
                <span className="block text-right">RECORD</span>
              </Th>
            </>
          }
          footer={`SHOWING ${filtered.length} OF ${teams.length}`}
        >
          {filtered.length === 0 ? (
            <EmptyState>No teams match these filters.</EmptyState>
          ) : (
            filtered.map((t) => (
              <Row key={t.id}>
                <Td strong>
                  <button type="button" onClick={() => setRoster(t)} className="text-left">
                    <div>{t.name}</div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {t.gender} · {t.assistant ? `asst. ${t.assistant}` : "no assistant"}
                    </div>
                  </button>
                </Td>
                <Td>
                  <Chip>{t.category}</Chip>
                </Td>
                <Td hide>{t.headCoach || "—"}</Td>
                <Td hide>{t.branch || "—"}</Td>
                <Td>
                  <span className="font-mono text-xs">{rosterOf(t).length || t.players}</span>
                </Td>
                <Td right>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-xs text-ink-100">
                      {t.wins}–{t.losses}
                    </span>
                    <RowActions onEdit={() => openEdit(t)} onDelete={() => remove(t)} />
                  </div>
                </Td>
              </Row>
            ))
          )}
        </Table>
      </Panel>

      <Modal
        open={open}
        title={editing ? `Edit ${editing.name}` : "New team"}
        meta="Category, coaches and branch"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create team"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Team name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={["U-10", "U-12", "U-14", "U-16", "U-18", "Senior"]}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v as Team["gender"] })}
              options={["Boys", "Girls", "Mixed"]}
            />
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={["", ...branches]}
            />
          </Field>
          <Field label="Head coach">
            <Select
              value={form.headCoach}
              onChange={(v) => setForm({ ...form, headCoach: v })}
              options={["", ...coachNames]}
            />
          </Field>
          <Field label="Assistant coach">
            <Select
              value={form.assistant ?? ""}
              onChange={(v) => setForm({ ...form, assistant: v })}
              options={["", ...coachNames]}
            />
          </Field>
          <Field label="Wins">
            <Input
              type="number"
              value={String(form.wins)}
              onChange={(v) => setForm({ ...form, wins: Number(v) || 0 })}
            />
          </Field>
          <Field label="Losses">
            <Input
              type="number"
              value={String(form.losses)}
              onChange={(v) => setForm({ ...form, losses: Number(v) || 0 })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={roster !== null}
        title={roster ? `${roster.name} roster` : ""}
        meta="Assign or remove players"
        onClose={() => setRoster(null)}
        wide
      >
        <div className="max-h-[60vh] space-y-1 overflow-y-auto p-4">
          {db.players.map((p) => {
            const on = roster ? p.team === roster.name : false;
            const eligible = roster ? p.category === roster.category : true;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  roster &&
                  update((d) => ({
                    ...d,
                    players: d.players.map((x) =>
                      x.id === p.id ? { ...x, team: on ? "" : roster.name } : x,
                    ),
                  }))
                }
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ring-1 transition-colors ${
                  on ? "bg-court-500/10 ring-court-500/40" : "bg-ink-850 ring-ink-700"
                }`}
              >
                <span className="flex-1">
                  <span className="block text-sm text-ink-100">{p.name}</span>
                  <span className="block font-mono text-[10px] text-ink-400">
                    {p.category} · {p.branch || "—"}
                  </span>
                </span>
                {!eligible ? <Chip tone="warn">AGE MISMATCH</Chip> : null}
                <Chip tone={on ? "accent" : "neutral"}>{on ? "ON ROSTER" : "ADD"}</Chip>
              </button>
            );
          })}
        </div>
      </Modal>
    </AppShell>
  );
}
