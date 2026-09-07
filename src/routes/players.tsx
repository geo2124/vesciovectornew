import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  money,
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { Player } from "@/lib/mock-data";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Players — Vescio Vector" },
      {
        name: "description",
        content:
          "Player database with age categories, teams, guardians, monthly fees and payment status.",
      },
      { property: "og:title", content: "Players — Vescio Vector" },
      {
        property: "og:description",
        content: "Search, register and track players, teams and monthly fees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayersPage,
});

const statusTone = { Active: "good", "Soft flag": "warn", Inactive: "bad" } as const;

const blank: Omit<Player, "id"> = {
  name: "",
  gender: "Boy",
  dob: "",
  category: "U-14",
  team: "",
  branch: "",
  parent: "",
  parentPhone: "",
  school: "",
  fee: 85,
  balance: 0,
  status: "Active",
};

function PlayersPage() {
  const { db, update } = useDB();
  const players = db.players;

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Player | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Player, "id">>(blank);
  const [selected, setSelected] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(players.map((p) => p.category))).sort(),
    [players],
  );
  const branches = db.branches.map((b) => b.name);
  const teams = db.teams.map((t) => t.name);

  const filtered = players.filter((p) => {
    const needle = q.trim().toLowerCase();
    const match =
      !needle ||
      [p.name, p.parent, p.parentPhone, p.school, p.team].join(" ").toLowerCase().includes(needle);
    return (
      match &&
      (!cat || p.category === cat) &&
      (!branch || p.branch === branch) &&
      (!status || p.status === status)
    );
  });

  const due = players.reduce((a, p) => a + p.balance, 0);
  const active = players.filter((p) => p.status === "Active").length;
  const flagged = players.filter((p) => p.status === "Soft flag").length;
  const atLimit = players.length >= db.academy.playersLimit;
  const detail = players.find((p) => p.id === selected) ?? players[0];

  function openNew() {
    setEditing(null);
    setForm({ ...blank, branch: branches[0] ?? "", team: teams[0] ?? "" });
    setOpen(true);
  }

  function openEdit(p: Player) {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setOpen(true);
  }

  function submit() {
    if (!form.name.trim()) return;
    update((d) => {
      if (editing) {
        return {
          ...d,
          players: d.players.map((p) => (p.id === editing.id ? { ...p, ...form } : p)),
        };
      }
      return {
        ...d,
        players: [{ ...form, id: `p-${Date.now().toString(36)}` }, ...d.players],
      };
    });
    setOpen(false);
  }

  function remove(p: Player) {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    update((d) => ({ ...d, players: d.players.filter((x) => x.id !== p.id) }));
  }

  return (
    <AppShell crumb="ROSTER / PLAYERS" title="Players">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Total players"
          value={String(players.length)}
          note={`limit ${db.academy.playersLimit}`}
          accent
        />
        <Stat label="Active" value={String(active)} note="in good standing" />
        <Stat label="Flagged" value={String(flagged)} note="soft deadline passed" />
        <Stat label="Open balance" value={money(due)} note="across all players" accent />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Player database"
          meta="Search by player, guardian, school or phone"
          action={
            <>
              <FilterSelect label="Category" value={cat} onChange={setCat} options={categories} />
              <FilterSelect label="Branch" value={branch} onChange={setBranch} options={branches} />
              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={["Active", "Soft flag", "Inactive"]}
              />
              <Button onClick={openNew}>+ New player</Button>
            </>
          }
        >
          {atLimit ? (
            <div className="border-b border-ink-800 bg-warn/10 px-4 py-2 font-mono text-[11px] text-warn">
              Player limit reached for this package — upgrade to add more.
            </div>
          ) : null}
          <div className="border-b border-ink-800 px-4 py-3">
            <Search value={q} onChange={setQ} placeholder="Search name, parent name or phone…" />
          </div>
          <Table
            head={
              <>
                <Th>PLAYER</Th>
                <Th>CATEGORY</Th>
                <Th hide>TEAM</Th>
                <Th hide>GUARDIAN</Th>
                <Th>FEE</Th>
                <Th>
                  <span className="block text-right">STATUS</span>
                </Th>
              </>
            }
            footer={`SHOWING ${filtered.length} OF ${players.length}`}
          >
            {filtered.length === 0 ? (
              <EmptyState>No players match these filters.</EmptyState>
            ) : (
              filtered.map((p) => (
                <Row key={p.id}>
                  <Td strong>
                    <button
                      type="button"
                      onClick={() => setSelected(p.id)}
                      className="block text-left leading-tight"
                    >
                      <div>{p.name}</div>
                      <div className="font-mono text-[10px] text-ink-400">
                        {p.gender} · {p.dob || "—"} · {p.branch || "—"}
                      </div>
                    </button>
                  </Td>
                  <Td>
                    <Chip>{p.category}</Chip>
                  </Td>
                  <Td hide>{p.team || "—"}</Td>
                  <Td hide>
                    <div className="leading-tight">
                      <div className="text-xs">{p.parent || "—"}</div>
                      <div className="font-mono text-[10px] text-ink-400">{p.parentPhone}</div>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">${p.fee}/mo</span>
                  </Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-2">
                      {p.balance ? (
                        <span className="font-mono text-xs text-court-400">{money(p.balance)}</span>
                      ) : null}
                      <Chip tone={statusTone[p.status]}>{p.status.toUpperCase()}</Chip>
                      <RowActions onEdit={() => openEdit(p)} onDelete={() => remove(p)} />
                    </div>
                  </Td>
                </Row>
              ))
            )}
          </Table>
        </Panel>

        <div className="space-y-4">
          {detail ? (
            <Panel title={detail.name} meta="Profile & financials">
              <div className="space-y-2 p-4 text-sm">
                <LineRow label="Category" value={`${detail.category} · ${detail.team || "—"}`} />
                <LineRow label="Branch" value={detail.branch || "—"} />
                <LineRow label="Guardian" value={`${detail.parent} · ${detail.parentPhone}`} />
                <LineRow label="School" value={detail.school || "—"} />
                <LineRow label="Monthly fee" value={money(detail.fee)} />
                <LineRow label="Outstanding" value={money(detail.balance)} />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-ink-800 px-4 py-3">
                <Button
                  onClick={() => {
                    const amount = Number(
                      window.prompt("Payment amount", String(detail.balance || detail.fee)) ?? "",
                    );
                    if (!amount || Number.isNaN(amount)) return;
                    update((d) => ({
                      ...d,
                      players: d.players.map((p) =>
                        p.id === detail.id
                          ? {
                              ...p,
                              balance: Math.max(0, p.balance - amount),
                              status: p.balance - amount <= 0 ? "Active" : p.status,
                            }
                          : p,
                      ),
                      ledger: [
                        {
                          id: `l-${Date.now().toString(36)}`,
                          date: new Date().toISOString().slice(0, 10),
                          account: "Monthly fees",
                          entry: `${detail.name} · payment`,
                          type: "Revenue" as const,
                          amount,
                          status: "Collected" as const,
                        },
                        ...d.ledger,
                      ],
                    }));
                  }}
                >
                  Record payment
                </Button>
                <Button variant="ghost" onClick={() => openEdit(detail)}>
                  Edit profile
                </Button>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <Modal
        open={open}
        title={editing ? `Edit ${editing.name}` : "New player"}
        meta="Profile, guardian and monthly fee"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create player"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Gender">
            <Select
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v as Player["gender"] })}
              options={["Boy", "Girl"]}
            />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={["U-10", "U-12", "U-14", "U-16", "U-18", "Senior"]}
            />
          </Field>
          <Field label="Team">
            <Select
              value={form.team}
              onChange={(v) => setForm({ ...form, team: v })}
              options={["", ...teams]}
            />
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={["", ...branches]}
            />
          </Field>
          <Field label="Guardian name">
            <Input value={form.parent} onChange={(v) => setForm({ ...form, parent: v })} />
          </Field>
          <Field label="Guardian phone">
            <Input
              value={form.parentPhone}
              onChange={(v) => setForm({ ...form, parentPhone: v })}
            />
          </Field>
          <Field label="School">
            <Input value={form.school} onChange={(v) => setForm({ ...form, school: v })} />
          </Field>
          <Field label="Monthly fee" hint="USD, recurring until stopped">
            <Input
              type="number"
              value={String(form.fee)}
              onChange={(v) => setForm({ ...form, fee: Number(v) || 0 })}
            />
          </Field>
          <Field label="Outstanding balance">
            <Input
              type="number"
              value={String(form.balance)}
              onChange={(v) => setForm({ ...form, balance: Number(v) || 0 })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as Player["status"] })}
              options={["Active", "Soft flag", "Inactive"]}
            />
          </Field>
        </div>
      </Modal>
    </AppShell>
  );
}

function LineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-300">{label}</span>
      <span className="text-right font-mono text-xs text-ink-100">{value}</span>
    </div>
  );
}
