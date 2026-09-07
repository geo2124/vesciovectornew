import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  Field,
  Input,
  Modal,
  Panel,
  Search,
  Stat,
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { Branch } from "@/lib/mock-data";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Branches — Vescio Vector" },
      {
        name: "description",
        content:
          "Academy branches with addresses, managers, courts and per-branch team and player counts.",
      },
      { property: "og:title", content: "Branches — Vescio Vector" },
      {
        property: "og:description",
        content: "Manage every branch, its courts and its local contacts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BranchesPage,
});

type FormState = Omit<Branch, "id">;

const blank: FormState = {
  name: "",
  city: "",
  address: "",
  manager: "",
  courts: [],
  teams: 0,
  players: 0,
};

function BranchesPage() {
  const { db, update } = useDB();
  const branches = db.branches;
  const managers = db.staff.map((s) => s.name);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<FormState>(blank);

  const filtered = branches.filter(
    (b) =>
      !q.trim() ||
      [b.name, b.city, b.address, b.manager].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const countPlayers = (name: string) => db.players.filter((p) => p.branch === name).length;
  const countTeams = (name: string) => db.teams.filter((t) => t.branch === name).length;
  const totalCourts = branches.reduce((a, b) => a + b.courts.length, 0);

  function openNew() {
    setEditing(null);
    setForm({ ...blank, courts: [{ name: "", contact: "", phone: "" }] });
    setOpen(true);
  }
  function openEdit(b: Branch) {
    setEditing(b);
    const { id: _id, ...rest } = b;
    setForm({ ...rest, courts: rest.courts.map((c) => ({ ...c })) });
    setOpen(true);
  }
  function submit() {
    if (!form.name.trim()) return;
    const clean = { ...form, courts: form.courts.filter((c) => c.name.trim()) };
    update((d) =>
      editing
        ? { ...d, branches: d.branches.map((b) => (b.id === editing.id ? { ...b, ...clean } : b)) }
        : { ...d, branches: [...d.branches, { ...clean, id: `b-${Date.now().toString(36)}` }] },
    );
    setOpen(false);
  }
  function remove(b: Branch) {
    if (!window.confirm(`Delete branch ${b.name}?`)) return;
    update((d) => ({ ...d, branches: d.branches.filter((x) => x.id !== b.id) }));
  }

  return (
    <AppShell crumb="ROSTER / BRANCHES" title="Branches">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Branches"
          value={String(branches.length)}
          note={`limit ${db.academy.branchesLimit}`}
          accent
        />
        <Stat label="Courts" value={String(totalCourts)} note="all locations" />
        <Stat label="Teams" value={String(db.teams.length)} />
        <Stat label="Players" value={String(db.players.length)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Search value={q} onChange={setQ} placeholder="Search branches or cities…" />
        <div className="ml-auto">
          <Button onClick={openNew}>+ New branch</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b) => (
          <Panel key={b.id} title={b.name} meta={`${b.city} · manager ${b.manager || "—"}`}>
            <div className="space-y-3 p-4">
              <div className="text-sm text-ink-200">{b.address || "No address yet"}</div>
              <div className="flex gap-2">
                <Chip tone="accent">{countTeams(b.name) || b.teams} TEAMS</Chip>
                <Chip>{countPlayers(b.name) || b.players} PLAYERS</Chip>
              </div>
              <div>
                <div className="label-mono mb-1.5">Courts</div>
                <div className="space-y-1.5">
                  {b.courts.length === 0 ? (
                    <div className="font-mono text-[10px] text-ink-400">No courts registered</div>
                  ) : (
                    b.courts.map((c) => (
                      <div
                        key={c.name}
                        className="rounded bg-ink-850 px-2.5 py-2 ring-1 ring-ink-700"
                      >
                        <div className="text-xs text-ink-100">{c.name}</div>
                        <div className="font-mono text-[10px] text-ink-400">
                          {c.contact} · {c.phone}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
              <Button variant="ghost" onClick={() => openEdit(b)}>
                Edit branch
              </Button>
              <Button variant="ghost" onClick={() => remove(b)}>
                Delete
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? `Edit ${editing.name}` : "New branch"}
        meta="Location, manager and courts"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create branch"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Branch name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          </Field>
          <Field label="Manager">
            <Input
              value={form.manager}
              onChange={(v) => setForm({ ...form, manager: v })}
              placeholder={managers[0] ?? "Manager name"}
            />
          </Field>
        </div>
        <div className="border-t border-ink-800 p-4">
          <div className="label-mono mb-2">Courts</div>
          <div className="space-y-2">
            {form.courts.map((c, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <Input
                  value={c.name}
                  placeholder="Court name"
                  onChange={(v) =>
                    setForm({
                      ...form,
                      courts: form.courts.map((x, xi) => (xi === i ? { ...x, name: v } : x)),
                    })
                  }
                />
                <Input
                  value={c.contact}
                  placeholder="Contact person"
                  onChange={(v) =>
                    setForm({
                      ...form,
                      courts: form.courts.map((x, xi) => (xi === i ? { ...x, contact: v } : x)),
                    })
                  }
                />
                <Input
                  value={c.phone}
                  placeholder="Phone"
                  onChange={(v) =>
                    setForm({
                      ...form,
                      courts: form.courts.map((x, xi) => (xi === i ? { ...x, phone: v } : x)),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, courts: form.courts.filter((_, xi) => xi !== i) })
                  }
                  className="mt-1.5 rounded-md px-3 font-mono text-[10px] text-bad ring-1 ring-ink-700"
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button
              variant="ghost"
              onClick={() =>
                setForm({ ...form, courts: [...form.courts, { name: "", contact: "", phone: "" }] })
              }
            >
              + Add court
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
