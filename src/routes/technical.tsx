import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  EmptyState,
  Field,
  Input,
  Modal,
  Panel,
  Row,
  RowActions,
  Select,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { Plan } from "@/lib/data-store";

export const Route = createFileRoute("/technical")({
  head: () => ({
    meta: [
      { title: "Technical Portal — Vescio Vector" },
      {
        name: "description",
        content:
          "Technical director workspace: game approvals, practice plan review, shared resources, meetings and seminars.",
      },
      { property: "og:title", content: "Technical Portal — Vescio Vector" },
      {
        property: "og:description",
        content: "Approvals, coaching resources and practice plan review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TechnicalPage,
});

const tabs = ["Game approval", "Practice plans", "Resources", "Completed games"] as const;

function TechnicalPage() {
  const { db } = useDB();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Game approval");

  const pendingGames = db.sessions.filter((s) => s.status === "Pending approval").length;
  const inReview = db.plans.filter((p) => p.status === "Submitted").length;

  return (
    <AppShell crumb="CONTROL / TECHNICAL PORTAL" title="Technical Portal">
      <div className="mb-4 flex items-center gap-2">
        <Chip tone="accent">/TECHNICAL</Chip>
        <span className="font-mono text-[10px] text-ink-400">
          APPROVALS AND COACHING RESOURCES
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pending games" value={String(pendingGames)} note="awaiting approval" accent />
        <Stat label="Plans in review" value={String(inReview)} note="submitted by coaches" />
        <Stat label="Approved plans" value={String(db.plans.filter((p) => p.status === "Approved").length)} />
        <Stat label="Coaches" value={String(db.coaches.length)} note="with portal resources" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              tab === t ? "bg-court-500 text-ink-950" : "bg-ink-850 text-ink-300 ring-1 ring-ink-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Game approval" ? <GameApproval /> : null}
        {tab === "Practice plans" ? <PracticePlans /> : null}
        {tab === "Resources" ? <Resources /> : null}
        {tab === "Completed games" ? <CompletedGames /> : null}
      </div>
    </AppShell>
  );
}

function GameApproval() {
  const { db, update } = useDB();
  const games = db.sessions.filter((s) => s.kind === "Game");

  function setStatus(id: string, status: "Pre-approved" | "Official" | "Planned") {
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === id ? { ...s, status } : s)),
    }));
  }

  return (
    <Panel title="Submitted games" meta="Approve, make official or send back to planning">
      <Table
        head={
          <>
            <Th>GAME</Th>
            <Th>DATE</Th>
            <Th hide>SUBMITTED BY</Th>
            <Th>STATUS</Th>
            <Th>
              <span className="block text-right">ACTION</span>
            </Th>
          </>
        }
      >
        {games.length === 0 ? (
          <EmptyState>No games submitted yet.</EmptyState>
        ) : (
          games.map((g) => (
            <Row key={g.id}>
              <Td strong>
                <div className="leading-tight">
                  <div>{g.title}</div>
                  <div className="font-mono text-[10px] text-ink-400">{g.detail}</div>
                </div>
              </Td>
              <Td>
                <span className="font-mono text-xs">
                  {g.date} · {g.time}
                </span>
              </Td>
              <Td hide>{g.coach}</Td>
              <Td>
                <Chip
                  tone={
                    g.status === "Pending approval"
                      ? "warn"
                      : g.status === "Planned"
                        ? "neutral"
                        : "good"
                  }
                >
                  {g.status.toUpperCase()}
                </Chip>
              </Td>
              <Td right>
                <div className="flex flex-wrap justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setStatus(g.id, "Pre-approved")}
                    className="rounded px-2 py-1 font-mono text-[10px] text-good ring-1 ring-ink-700 hover:bg-good/10"
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(g.id, "Official")}
                    className="rounded px-2 py-1 font-mono text-[10px] text-court-400 ring-1 ring-ink-700 hover:bg-court-500/10"
                  >
                    MAKE OFFICIAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(g.id, "Planned")}
                    className="rounded px-2 py-1 font-mono text-[10px] text-bad ring-1 ring-ink-700 hover:bg-bad/10"
                  >
                    VOID
                  </button>
                </div>
              </Td>
            </Row>
          ))
        )}
      </Table>
    </Panel>
  );
}

function PracticePlans() {
  const { db, update } = useDB();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Plan | null>(null);
  const [review, setReview] = useState("");
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanDraft>(
    emptyPlan(db.coaches[0]?.name ?? "", db.lists["Age categories"]?.[0] ?? "U-14"),
  );

  function submit() {
    if (!form.title.trim()) return;
    update((d) =>
      editing
        ? { ...d, plans: d.plans.map((p) => (p.id === editing.id ? { ...p, ...form } : p)) }
        : { ...d, plans: [{ ...form, id: `pl-${Date.now().toString(36)}` }, ...d.plans] },
    );
    setOpen(false);
  }

  function setStatus(id: string, status: Plan["status"], note?: string) {
    update((d) => ({
      ...d,
      plans: d.plans.map((p) =>
        p.id === id ? { ...p, status, review: note === undefined ? p.review : note } : p,
      ),
    }));
  }


  return (
    <Panel
      title="Practice plans"
      meta="Approve, reject or return plans submitted by coaches"
      action={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + New plan
        </Button>
      }
    >
      <Table
        head={
          <>
            <Th>PLAN</Th>
            <Th hide>COACH</Th>
            <Th hide>FOCUS</Th>
            <Th>STATUS</Th>
            <Th>
              <span className="block text-right">ACTION</span>
            </Th>
          </>
        }
      >
        {db.plans.length === 0 ? (
          <EmptyState>No practice plans yet.</EmptyState>
        ) : (
          db.plans.map((p) => (
            <Row key={p.id}>
              <Td strong>
                <div className="leading-tight">
                  <div>{p.title}</div>
                  <div className="font-mono text-[10px] text-ink-400">
                    {p.category} · {p.date}
                  </div>
                </div>
              </Td>
              <Td hide>{p.coach}</Td>
              <Td hide>{p.focus}</Td>
              <Td>
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
              </Td>
              <Td right>
                <div className="flex flex-wrap justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setStatus(p.id, "Approved")}
                    className="rounded px-2 py-1 font-mono text-[10px] text-good ring-1 ring-ink-700 hover:bg-good/10"
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(p.id, "Rejected")}
                    className="rounded px-2 py-1 font-mono text-[10px] text-bad ring-1 ring-ink-700 hover:bg-bad/10"
                  >
                    REJECT
                  </button>
                  <RowActions
                    onEdit={() => {
                      setEditing(p);
                      const { id: _id, ...rest } = p;
                      setForm(rest);
                      setOpen(true);
                    }}
                    onDelete={() => {
                      if (!window.confirm("Delete this plan?")) return;
                      update((d) => ({ ...d, plans: d.plans.filter((x) => x.id !== p.id) }));
                    }}
                  />
                </div>
              </Td>
            </Row>
          ))
        )}
      </Table>

      <Modal
        open={open}
        title={editing ? "Edit plan" : "New practice plan"}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create plan"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Title">
            <Input value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={db.lists["Age categories"] ?? ["U-14"]}
            />
          </Field>
          <Field label="Coach">
            <Select
              value={form.coach}
              onChange={(v) => setForm({ ...form, coach: v })}
              options={db.coaches.map((c) => c.name)}
            />
          </Field>
          <Field label="Focus">
            <Input value={form.focus} onChange={(v) => setForm({ ...form, focus: v })} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as Plan["status"] })}
              options={["Draft", "Submitted", "Approved", "Rejected"]}
            />
          </Field>
        </div>
      </Modal>
    </Panel>
  );
}

function Resources() {
  const folders = [
    { name: "Offense concepts", files: 14 },
    { name: "Defense concepts", files: 11 },
    { name: "Video links", files: 22 },
    { name: "Season PDFs", files: 8 },
    { name: "Level 1 quiz", files: 3 },
    { name: "Rules exam 2026", files: 2 },
  ];
  return (
    <Panel title="Shared resources" meta="Available to every coach in the portal">
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((f) => (
          <div key={f.name} className="rounded-md bg-ink-850 p-4 ring-1 ring-ink-700">
            <div className="font-mono text-xl text-court-400">▤</div>
            <div className="mt-2 text-sm font-medium text-ink-100">{f.name}</div>
            <div className="font-mono text-[10px] text-ink-400">{f.files} files</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CompletedGames() {
  const { db } = useDB();
  const done = db.sessions.filter(
    (s) => s.kind === "Game" && (s.status === "Completed" || s.status === "Official"),
  );
  return (
    <Panel title="Completed & official games" meta="Reports submitted by coaches">
      <Table
        head={
          <>
            <Th>GAME</Th>
            <Th>DATE</Th>
            <Th hide>COACH</Th>
            <Th>
              <span className="block text-right">STATUS</span>
            </Th>
          </>
        }
      >
        {done.length === 0 ? (
          <EmptyState>No completed games yet.</EmptyState>
        ) : (
          done.map((g) => (
            <Row key={g.id}>
              <Td strong>{g.title}</Td>
              <Td>
                <span className="font-mono text-xs">{g.date}</span>
              </Td>
              <Td hide>{g.coach}</Td>
              <Td right>
                <Chip tone="good">{g.status.toUpperCase()}</Chip>
              </Td>
            </Row>
          ))
        )}
      </Table>
    </Panel>
  );
}
