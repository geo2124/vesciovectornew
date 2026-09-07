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
import type { Staff } from "@/lib/mock-data";

export const Route = createFileRoute("/personnel")({
  head: () => ({
    meta: [
      { title: "Personnel — Vescio Vector" },
      {
        name: "description",
        content:
          "Academy staff directory: managers, technical directors, accountants and branch personnel with documents.",
      },
      { property: "og:title", content: "Personnel — Vescio Vector" },
      {
        property: "og:description",
        content: "Manage academy staff, positions, contacts and documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PersonnelPage,
});

const positions = [
  "General Manager",
  "Technical Director",
  "Branch Manager",
  "Accountant",
  "Physiotherapist",
  "Administrator",
];

const blank: Omit<Staff, "id"> = {
  name: "",
  position: "Administrator",
  phone: "",
  email: "",
  branch: "HQ",
  dob: "",
  docs: 0,
};

function PersonnelPage() {
  const { db, update } = useDB();
  const staff = db.staff;
  const branches = ["HQ", ...db.branches.map((b) => b.name)];

  const [q, setQ] = useState("");
  const [pos, setPos] = useState("");
  const [branch, setBranch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState<Omit<Staff, "id">>(blank);

  const filtered = staff.filter(
    (s) =>
      (!q.trim() ||
        [s.name, s.email, s.phone, s.position].join(" ").toLowerCase().includes(q.toLowerCase())) &&
      (!pos || s.position === pos) &&
      (!branch || s.branch === branch),
  );

  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }
  function openEdit(s: Staff) {
    setEditing(s);
    const { id: _id, ...rest } = s;
    setForm(rest);
    setOpen(true);
  }
  function submit() {
    if (!form.name.trim()) return;
    update((d) =>
      editing
        ? { ...d, staff: d.staff.map((s) => (s.id === editing.id ? { ...s, ...form } : s)) }
        : { ...d, staff: [{ ...form, id: `s-${Date.now().toString(36)}` }, ...d.staff] },
    );
    setOpen(false);
  }
  function remove(s: Staff) {
    if (!window.confirm(`Remove ${s.name} from personnel?`)) return;
    update((d) => ({ ...d, staff: d.staff.filter((x) => x.id !== s.id) }));
  }

  return (
    <AppShell crumb="ROSTER / PERSONNEL" title="Personnel">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Staff members" value={String(staff.length)} accent />
        <Stat
          label="Branch managers"
          value={String(staff.filter((s) => s.position === "Branch Manager").length)}
        />
        <Stat label="At HQ" value={String(staff.filter((s) => s.branch === "HQ").length)} />
        <Stat
          label="Missing documents"
          value={String(staff.filter((s) => s.docs === 0).length)}
          note="upload ID & contract"
        />
      </div>

      <Panel
        className="mt-4"
        title="Staff directory"
        action={
          <>
            <FilterSelect label="Position" value={pos} onChange={setPos} options={positions} />
            <FilterSelect label="Branch" value={branch} onChange={setBranch} options={branches} />
            <Button onClick={openNew}>+ New staff</Button>
          </>
        }
      >
        <div className="border-b border-ink-800 px-4 py-3">
          <Search value={q} onChange={setQ} placeholder="Search staff by name, role or email…" />
        </div>
        <Table
          head={
            <>
              <Th>NAME</Th>
              <Th>POSITION</Th>
              <Th hide>CONTACT</Th>
              <Th hide>BRANCH</Th>
              <Th>
                <span className="block text-right">DOCUMENTS</span>
              </Th>
            </>
          }
          footer={`SHOWING ${filtered.length} OF ${staff.length}`}
        >
          {filtered.length === 0 ? (
            <EmptyState>No staff match these filters.</EmptyState>
          ) : (
            filtered.map((s) => (
              <Row key={s.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div>{s.name}</div>
                    <div className="font-mono text-[10px] text-ink-400">{s.dob || "—"}</div>
                  </div>
                </Td>
                <Td>
                  <Chip>{s.position}</Chip>
                </Td>
                <Td hide>
                  <div className="leading-tight">
                    <div className="text-xs">{s.email}</div>
                    <div className="font-mono text-[10px] text-ink-400">{s.phone}</div>
                  </div>
                </Td>
                <Td hide>{s.branch}</Td>
                <Td right>
                  <div className="flex items-center justify-end gap-2">
                    <Chip tone={s.docs ? "good" : "warn"}>{s.docs} FILES</Chip>
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
        title={editing ? `Edit ${editing.name}` : "New staff member"}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Add staff"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Position">
            <Select
              value={form.position}
              onChange={(v) => setForm({ ...form, position: v })}
              options={positions}
            />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={branches}
            />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
          </Field>
          <Field label="Documents on file" hint="ID, contract, certificates">
            <Input
              type="number"
              value={String(form.docs)}
              onChange={(v) => setForm({ ...form, docs: Number(v) || 0 })}
            />
          </Field>
        </div>
      </Modal>
    </AppShell>
  );
}
