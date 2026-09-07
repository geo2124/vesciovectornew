import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button, Chip, FieldGrid, Panel, Row, Stat, Table, Td, Th } from "@/components/kit";
import { rolesMatrix } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Access — Vescio Vector" },
      {
        name: "description",
        content:
          "Create roles with read, add, edit and delete rights per module, and invite users by Gmail or fixed credentials.",
      },
      { property: "og:title", content: "Users & Access — Vescio Vector" },
      { property: "og:description", content: "Roles and permissions for every module." },
    ],
  }),
  component: UsersPage,
});

const modules = [
  "Dashboard",
  "Calendar",
  "Personnel",
  "Coaches",
  "Branches",
  "Teams",
  "Players",
  "Sessions",
  "Merchandise",
  "Accounting",
  "Settings",
  "Technical portal",
];

function UsersPage() {
  return (
    <AppShell crumb="CONTROL / USERS" title="Users & Access">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Users" value="29" note="27 active" />
        <Stat label="Roles" value={String(rolesMatrix.length)} note="2 custom" />
        <Stat label="Gmail sign-in" value="24" note="rest use credentials" accent />
        <Stat label="Pending invites" value="2" note="sent this week" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel title="Roles" action={<Button>+ New role</Button>}>
            <Table
              head={
                <>
                  <Th>ROLE</Th>
                  <Th>USERS</Th>
                  <Th hide>SCOPE</Th>
                  <Th>
                    <span className="block text-right">PERMISSIONS</span>
                  </Th>
                </>
              }
            >
              {rolesMatrix.map((r) => (
                <Row key={r.role}>
                  <Td strong>{r.role}</Td>
                  <Td>
                    <span className="font-mono text-xs">{r.users}</span>
                  </Td>
                  <Td hide>{r.scope}</Td>
                  <Td right>
                    <span className="font-mono text-[10px] text-ink-300">{r.perms}</span>
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>

          <Panel title="Permission matrix" meta="Branch Manager">
            <Table
              head={
                <>
                  <Th>MODULE</Th>
                  <Th>READ</Th>
                  <Th>ADD</Th>
                  <Th>EDIT</Th>
                  <Th>
                    <span className="block text-right">DELETE</span>
                  </Th>
                </>
              }
            >
              {modules.map((m, i) => (
                <Row key={m}>
                  <Td strong>{m}</Td>
                  {[0, 1, 2, 3].map((c) => {
                    const on = c === 0 || (i < 9 && c < 3);
                    return (
                      <Td key={c} right={c === 3}>
                        <span
                          className={`inline-grid h-5 w-5 place-items-center rounded font-mono text-[10px] ${
                            on ? "bg-court-500/20 text-court-400" : "bg-ink-850 text-ink-700"
                          }`}
                        >
                          {on ? "✓" : "—"}
                        </span>
                      </Td>
                    );
                  })}
                </Row>
              ))}
            </Table>
          </Panel>
        </div>

        <Panel title="New user">
          <FieldGrid
            fields={[
              { label: "Full name" },
              { label: "Role" },
              { label: "Sign-in method", hint: "Gmail or username & password" },
              { label: "Gmail address" },
              { label: "Username" },
              { label: "Password" },
              { label: "Branch scope", hint: "all or specific" },
            ]}
          />
          <div className="border-t border-ink-800 px-4 py-3">
            <Chip tone="accent">SUPER ADMIN · geogo3@gmail.com</Chip>
          </div>
          <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
            <Button>Invite user</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
