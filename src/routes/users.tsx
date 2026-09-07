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
} from "@/components/kit";
import { useDB } from "@/lib/data-store";
import type { UserAccount } from "@/lib/data-store";
import { rolesMatrix } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Access — Vescio Vector" },
      {
        name: "description",
        content:
          "User accounts, roles and permissions across the academy: super admins, directors, branch managers and coaches.",
      },
      { property: "og:title", content: "Users & Access — Vescio Vector" },
      {
        property: "og:description",
        content: "Invite users, assign roles and control what each person can reach.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

const roles = rolesMatrix.map((r) => r.role);

const blank: Omit<UserAccount, "id"> = {
  name: "",
  email: "",
  role: "Branch Manager",
  branch: "HQ",
  method: "Google",
  active: true,
};

function UsersPage() {
  const { db, update } = useDB();
  const users = db.users;
  const branches = ["HQ", ...db.branches.map((b) => b.name)];

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<Omit<UserAccount, "id">>(blank);

  const filtered = users.filter(
    (u) =>
      (!q.trim() || [u.name, u.email].join(" ").toLowerCase().includes(q.toLowerCase())) &&
      (!role || u.role === role),
  );

  function submit() {
    if (!form.name.trim() || !form.email.trim()) return;
    update((d) =>
      editing
        ? { ...d, users: d.users.map((u) => (u.id === editing.id ? { ...u, ...form } : u)) }
        : { ...d, users: [{ ...form, id: `u-${Date.now().toString(36)}` }, ...d.users] },
    );
    setOpen(false);
  }

  return (
    <AppShell crumb="CONTROL / USERS" title="Users & Access">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="User accounts" value={String(users.length)} accent />
        <Stat label="Active" value={String(users.filter((u) => u.active).length)} />
        <Stat
          label="Google sign-in"
          value={String(users.filter((u) => u.method === "Google").length)}
        />
        <Stat label="Roles" value={String(roles.length)} note="permission templates" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel
          title="Accounts"
          meta="Invite, disable or change a role"
          action={
            <>
              <FilterSelect label="Role" value={role} onChange={setRole} options={roles} />
              <Button
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                  setOpen(true);
                }}
              >
                + Invite user
              </Button>
            </>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <Search value={q} onChange={setQ} placeholder="Search users by name or email…" />
          </div>
          <Table
            head={
              <>
                <Th>USER</Th>
                <Th>ROLE</Th>
                <Th hide>BRANCH</Th>
                <Th hide>SIGN-IN</Th>
                <Th>
                  <span className="block text-right">STATUS</span>
                </Th>
              </>
            }
            footer={`SHOWING ${filtered.length} OF ${users.length}`}
          >
            {filtered.length === 0 ? (
              <EmptyState>No users match these filters.</EmptyState>
            ) : (
              filtered.map((u) => (
                <Row key={u.id}>
                  <Td strong>
                    <div className="leading-tight">
                      <div>{u.name}</div>
                      <div className="font-mono text-[10px] text-ink-400">{u.email}</div>
                    </div>
                  </Td>
                  <Td>
                    <Chip tone={u.role === "Super Admin" ? "accent" : "neutral"}>{u.role}</Chip>
                  </Td>
                  <Td hide>{u.branch}</Td>
                  <Td hide>
                    <span className="font-mono text-xs text-ink-300">{u.method}</span>
                  </Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            users: d.users.map((x) =>
                              x.id === u.id ? { ...x, active: !x.active } : x,
                            ),
                          }))
                        }
                      >
                        <Chip tone={u.active ? "good" : "bad"}>
                          {u.active ? "ACTIVE" : "DISABLED"}
                        </Chip>
                      </button>
                      <RowActions
                        onEdit={() => {
                          setEditing(u);
                          const { id: _id, ...rest } = u;
                          setForm(rest);
                          setOpen(true);
                        }}
                        onDelete={() => {
                          if (!window.confirm(`Remove access for ${u.name}?`)) return;
                          update((d) => ({ ...d, users: d.users.filter((x) => x.id !== u.id) }));
                        }}
                      />
                    </div>
                  </Td>
                </Row>
              ))
            )}
          </Table>
        </Panel>

        <Panel title="Roles & permissions" meta="What each role can reach">
          <div className="divide-y divide-ink-800">
            {rolesMatrix.map((r) => (
              <div key={r.role} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-100">{r.role}</span>
                  <Chip>{users.filter((u) => u.role === r.role).length} USERS</Chip>
                </div>
                <div className="mt-1 font-mono text-[10px] text-ink-400">{r.scope}</div>
                <div className="mt-1 font-mono text-[10px] text-court-400">{r.perms}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Modal
        open={open}
        title={editing ? `Edit ${editing.name}` : "Invite user"}
        meta="Role, branch and sign-in method"
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Send invite"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Role">
            <Select
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              options={roles}
            />
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              options={branches}
            />
          </Field>
          <Field label="Sign-in method">
            <Select
              value={form.method}
              onChange={(v) => setForm({ ...form, method: v as UserAccount["method"] })}
              options={["Google", "Password"]}
            />
          </Field>
          <div className="self-end">
            <Toggle
              on={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
              label="Account active"
            />
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
