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
  Toggle,
  money,
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { Coach } from "@/lib/mock-data";

export const Route = createFileRoute("/coaches")({
  head: () => ({
    meta: [
      { title: "Coaches — Vescio Vector" },
      {
        name: "description",
        content:
          "Coach database with levels, portal access, win-loss records, session counts and outstanding balances.",
      },
      { property: "og:title", content: "Coaches — Vescio Vector" },
      {
        property: "og:description",
        content: "Manage coaches, their records, payments and portal access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachesPage,
});

const blank: Omit<Coach, "id"> = {
  name: "",
  phone: "",
  years: 0,
  level: "ASSIST",
  gender: "M",
  wins: 0,
  losses: 0,
  sessions: 0,
  sessionTarget: 30,
  outstanding: 0,
  branch: "",
  portal: false,
  rate: 25,
  email: "",
};

function CoachesPage() {
  const { db, update } = useDB();
  const coaches = db.coaches;
  const branches = db.branches.map((b) => b.name);

  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [branch, setBranch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [form, setForm] = useState<Omit<Coach, "id">>(blank);
  const [selected, setSelected] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payMode, setPayMode] = useState("By rate");
  const [payAmount, setPayAmount] = useState("0");

  const filtered = coaches.filter((c) => {
    const needle = q.trim().toLowerCase();
    return (
      (!needle || [c.name, c.phone, c.email].join(" ").toLowerCase().includes(needle)) &&
      (!level || c.level === level) &&
      (!branch || c.branch === branch)
    );
  });

  const outstanding = coaches.reduce((a, c) => a + c.outstanding, 0);
  const portalCount = coaches.filter((c) => c.portal).length;
  const sessionsDone = coaches.reduce((a, c) => a + c.sessions, 0);
  const sessionsTarget = coaches.reduce((a, c) => a + c.sessionTarget, 0);
  const detail = coaches.find((c) => c.id === selected) ?? coaches[0];

  function openNew() {
    setEditing(null);
    setForm({ ...blank, branch: branches[0] ?? "" });
    setOpen(true);
  }
  function openEdit(c: Coach) {
    setEditing(c);
    const { id: _id, ...rest } = c;
    setForm(rest);
    setOpen(true);
  }
  function submit() {
    if (!form.name.trim()) return;
    update((d) =>
      editing
        ? { ...d, coaches: d.coaches.map((c) => (c.id === editing.id ? { ...c, ...form } : c)) }
        : { ...d, coaches: [{ ...form, id: `c-${Date.now().toString(36)}` }, ...d.coaches] },
    );
    setOpen(false);
  }
  function remove(c: Coach) {
    if (!window.confirm(`Remove coach ${c.name}?`)) return;
    update((d) => ({ ...d, coaches: d.coaches.filter((x) => x.id !== c.id) }));
  }

  function payCoach() {
    if (!detail) return;
    const amount =
      payMode === "By rate" ? detail.rate * detail.sessions : Math.abs(Number(payAmount) || 0);
    if (!amount) return;
    update((d) => ({
      ...d,
      coaches: d.coaches.map((c) =>
        c.id === detail.id ? { ...c, outstanding: Math.max(0, c.outstanding - amount) } : c,
      ),
      ledger: [
        {
          id: `l-${Date.now().toString(36)}`,
          date: new Date().toISOString().slice(0, 10),
          account: "Coach payroll",
          entry: `${detail.name} · ${payMode.toLowerCase()}`,
          type: "Expense" as const,
          amount: -amount,
          status: "Paid" as const,
        },
        ...d.ledger,
      ],
    }));
    setPayOpen(false);
  }

  return (
    <AppShell crumb="ROSTER / COACHES" title="Coaches">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Coaches" value={String(coaches.length)} note="on staff" />
        <Stat label="Portal enabled" value={String(portalCount)} note="Google or credentials" />
        <Stat
          label="Sessions delivered"
          value={String(sessionsDone)}
          note={`of ${sessionsTarget} planned`}
        />
        <Stat label="Outstanding" value={money(outstanding)} accent note="payable to coaches" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Coach database"
          meta="Search by name, phone or email"
          action={
            <>
              <FilterSelect
                label="Level"
                value={level}
                onChange={setLevel}
                options={["HEAD", "ASSIST", "SKILLS"]}
              />
              <FilterSelect label="Branch" value={branch} onChange={setBranch} options={branches} />
              <Button onClick={openNew}>+ New coach</Button>
            </>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <Search value={q} onChange={setQ} placeholder="Search coaches by name or phone…" />
          </div>
          <Table
            head={
              <>
                <Th>COACH</Th>
                <Th>LEVEL</Th>
                <Th hide>RATE</Th>
                <Th hide>W–L</Th>
                <Th hide>SESSIONS</Th>
                <Th>
                  <span className="block text-right">OUTSTANDING</span>
                </Th>
              </>
            }
            footer={`SHOWING ${filtered.length} OF ${coaches.length}`}
          >
            {filtered.length === 0 ? (
              <EmptyState>No coaches match these filters.</EmptyState>
            ) : (
              filtered.map((c) => (
                <Row key={c.id}>
                  <Td strong>
                    <button
                      type="button"
                      onClick={() => setSelected(c.id)}
                      className="block text-left leading-tight"
                    >
                      <div className="flex items-center gap-2">
                        {c.name}
                        {c.portal ? <Chip tone="accent">PORTAL</Chip> : null}
                      </div>
                      <div className="font-mono text-[10px] text-ink-400">
                        {c.phone} · {c.years} yrs · {c.branch || "—"}
                      </div>
                    </button>
                  </Td>
                  <Td>
                    <Chip>{c.level}</Chip>
                  </Td>
                  <Td hide>
                    <span className="font-mono text-xs">${c.rate}/session</span>
                  </Td>
                  <Td hide>
                    <span className="font-mono text-xs">
                      {c.wins}–{c.losses}
                    </span>
                  </Td>
                  <Td hide>
                    <span className="font-mono text-xs text-ink-300">
                      {c.sessions} / {c.sessionTarget}
                    </span>
                  </Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`font-mono text-xs ${
                          c.outstanding ? "text-court-400" : "text-ink-400"
                        }`}
                      >
                        {money(c.outstanding)}
                      </span>
                      <RowActions onEdit={() => openEdit(c)} onDelete={() => remove(c)} />
                    </div>
                  </Td>
                </Row>
              ))
            )}
          </Table>
        </Panel>

        {detail ? (
          <Panel title={detail.name} meta="Performance & financials">
            <div className="grid grid-cols-2 gap-2 p-4">
              <MiniStat label="Record" value={`${detail.wins}–${detail.losses}`} />
              <MiniStat label="Rate" value={`$${detail.rate}`} />
              <MiniStat label="Sessions" value={`${detail.sessions}`} />
              <MiniStat label="Outstanding" value={money(detail.outstanding)} accent />
            </div>
            <div className="space-y-2 border-t border-ink-800 px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-300">Email</span>
                <span className="font-mono text-xs text-ink-100">{detail.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-300">Branch</span>
                <span className="font-mono text-xs text-ink-100">{detail.branch || "—"}</span>
              </div>
            </div>
            <div className="border-t border-ink-800 px-4 py-3">
              <Toggle
                on={detail.portal}
                onChange={(v) =>
                  update((d) => ({
                    ...d,
                    coaches: d.coaches.map((c) => (c.id === detail.id ? { ...c, portal: v } : c)),
                  }))
                }
                label="Coach portal access"
                note="Google sign-in or fixed credentials"
              />
            </div>
            <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
              <Button
                onClick={() => {
                  setPayAmount(String(detail.outstanding || detail.rate));
                  setPayOpen(true);
                }}
              >
                Record payment
              </Button>
              <Button variant="ghost" onClick={() => openEdit(detail)}>
                Edit
              </Button>
            </div>
          </Panel>
        ) : null}
      </div>

      <Modal
        open={open}
        title={editing ? `Edit ${editing.name}` : "New coach"}
        meta="Profile, rate and portal access"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Create coach"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Level">
            <Select
              value={form.level}
              onChange={(v) => setForm({ ...form, level: v as Coach["level"] })}
              options={["HEAD", "ASSIST", "SKILLS"]}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v as Coach["gender"] })}
              options={["M", "F"]}
            />
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={["", ...branches]}
            />
          </Field>
          <Field label="Years of experience">
            <Input
              type="number"
              value={String(form.years)}
              onChange={(v) => setForm({ ...form, years: Number(v) || 0 })}
            />
          </Field>
          <Field label="Rate per session" hint="USD">
            <Input
              type="number"
              value={String(form.rate)}
              onChange={(v) => setForm({ ...form, rate: Number(v) || 0 })}
            />
          </Field>
          <Field label="Sessions delivered">
            <Input
              type="number"
              value={String(form.sessions)}
              onChange={(v) => setForm({ ...form, sessions: Number(v) || 0 })}
            />
          </Field>
          <Field label="Session target">
            <Input
              type="number"
              value={String(form.sessionTarget)}
              onChange={(v) => setForm({ ...form, sessionTarget: Number(v) || 0 })}
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
          <Field label="Outstanding">
            <Input
              type="number"
              value={String(form.outstanding)}
              onChange={(v) => setForm({ ...form, outstanding: Number(v) || 0 })}
            />
          </Field>
          <div className="self-end">
            <Toggle
              on={form.portal}
              onChange={(v) => setForm({ ...form, portal: v })}
              label="Coach portal access"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={payOpen}
        title="Record coach payment"
        meta={detail?.name}
        onClose={() => setPayOpen(false)}
        onSubmit={payCoach}
        submitLabel="Pay coach"
      >
        <div className="grid gap-3 p-4">
          <Field label="Method">
            <Select
              value={payMode}
              onChange={setPayMode}
              options={["By rate", "Fixed amount", "Custom salary"]}
            />
          </Field>
          {payMode === "By rate" ? (
            <div className="rounded-md bg-ink-850 px-3 py-2 font-mono text-xs text-ink-200 ring-1 ring-ink-700">
              {detail?.sessions} sessions × ${detail?.rate} ={" "}
              <span className="text-court-400">
                {money((detail?.sessions ?? 0) * (detail?.rate ?? 0))}
              </span>
            </div>
          ) : (
            <Field label="Amount" hint="USD">
              <Input type="number" value={payAmount} onChange={setPayAmount} />
            </Field>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded bg-ink-850 p-2.5 ring-1 ring-ink-700">
      <div className="label-mono">{label}</div>
      <div
        className={`font-display mt-1 text-2xl tracking-tight ${
          accent ? "text-court-400" : "text-ink-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
