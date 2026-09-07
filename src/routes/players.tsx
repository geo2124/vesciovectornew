import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  FieldGrid,
  Filters,
  Panel,
  Row,
  SearchField,
  Stat,
  Table,
  Td,
  Th,
  money,
} from "@/components/kit";
import { players } from "@/lib/mock-data";

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
    ],
  }),
  component: PlayersPage,
});

const statusTone = { Active: "good", "Soft flag": "warn", Inactive: "bad" } as const;

function PlayersPage() {
  const due = players.reduce((a, p) => a + p.balance, 0);
  return (
    <AppShell crumb="ROSTER / PLAYERS" title="Players">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total players" value="248" note="▲ 12 this month" accent />
        <Stat label="Active" value="221" note="89% of roster" />
        <Stat label="Flagged" value="19" note="soft deadline passed" />
        <Stat label="Open balance" value={money(due)} note="across flagged players" accent />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel
          title="Player database"
          meta="Search by player, guardian or phone"
          action={
            <>
              <Filters items={["Category", "Year", "Branch", "Status"]} />
              <Button>+ New player</Button>
            </>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <SearchField placeholder="Search name, parent name or phone…" />
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
            footer={`SHOWING ${players.length} OF 248`}
          >
            {players.map((p) => (
              <Row key={p.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div>{p.name}</div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {p.gender} · {p.dob} · {p.branch}
                    </div>
                  </div>
                </Td>
                <Td>
                  <Chip>{p.category}</Chip>
                </Td>
                <Td hide>{p.team}</Td>
                <Td hide>
                  <div className="leading-tight">
                    <div className="text-xs">{p.parent}</div>
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
                  </div>
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="New player">
            <FieldGrid
              fields={[
                { label: "First name" },
                { label: "Last name" },
                { label: "Gender", hint: "Boy / Girl" },
                { label: "Date of birth" },
                { label: "Email" },
                { label: "School" },
                { label: "Primary contact" },
                { label: "Primary phone" },
                { label: "Secondary contact" },
                { label: "Secondary phone" },
                { label: "Address" },
                { label: "Assign teams", hint: "one or more" },
              ]}
            />
            <div className="flex items-center justify-between border-t border-ink-800 px-4 py-3">
              <div>
                <div className="text-sm text-ink-200">Monthly fee</div>
                <div className="font-mono text-[10px] text-ink-400">
                  Recurring until stopped · editable per month
                </div>
              </div>
              <Chip tone="accent">ON · $85</Chip>
            </div>
            <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
              <Button>Save player</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </Panel>

          <Panel title="Marc Gebara" meta="Financials & performance">
            <div className="space-y-2 p-4 text-sm">
              <LineRow label="Paid this season" value="$510" />
              <LineRow label="Outstanding" value="$0" />
              <LineRow label="Attendance rate" value="92%" />
              <LineRow label="Games played" value="14 · 11W 3L" />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function LineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-300">{label}</span>
      <span className="font-mono text-xs text-ink-100">{value}</span>
    </div>
  );
}
