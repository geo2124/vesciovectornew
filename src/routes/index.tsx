import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Chip, Panel, Row, Stat, Table, Td, Th, Button, Filters } from "@/components/kit";
import { academy, coaches, kpis, sessions } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Vescio Vector" },
      {
        name: "description",
        content:
          "Academy overview: players, active teams, weekly sessions, collections, package usage and inventory alerts.",
      },
      { property: "og:title", content: "Dashboard — Vescio Vector" },
      {
        property: "og:description",
        content: "Academy overview with players, teams, sessions and collections at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell crumb="OPS / DASHBOARD" title="Overview">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} note={k.note} accent={k.accent} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel
          title="Coaches"
          meta="22 active · 3 portal enabled"
          action={
            <>
              <Filters items={["Level", "Branch"]} />
              <Button>+ New coach</Button>
            </>
          }
        >
          <Table
            head={
              <>
                <Th>COACH</Th>
                <Th>LEVEL</Th>
                <Th hide>W–L</Th>
                <Th hide>SESSIONS</Th>
                <Th>
                  <span className="block text-right">OUTSTANDING</span>
                </Th>
              </>
            }
            footer="SHOWING 4 OF 22"
          >
            {coaches.slice(0, 4).map((c) => (
              <Row key={c.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div>{c.name}</div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {c.phone} · {c.years} yrs
                    </div>
                  </div>
                </Td>
                <Td>
                  <Chip>{c.level}</Chip>
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
                  <span
                    className={`font-mono text-xs ${
                      c.outstanding ? "text-court-400" : "text-ink-400"
                    }`}
                  >
                    ${c.outstanding.toLocaleString()}
                  </span>
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <div className="label-mono">Package usage</div>
              <Chip tone="accent">{academy.plan}</Chip>
            </div>
            <div className="mt-4 space-y-3.5">
              <Meter label="Players" used={academy.playersUsed} limit={academy.playersLimit} />
              <Meter label="Branches" used={academy.branchesUsed} limit={academy.branchesLimit} />
              <Meter label="Storage (GB)" used={academy.storageUsed} limit={academy.storageLimit} />
            </div>
          </div>

          <div className="panel p-4">
            <div className="label-mono mb-3">Inventory alerts</div>
            <div className="space-y-2 text-sm">
              <AlertRow item="Basketball · size 7" left="6 left" />
              <AlertRow item="Game jersey · away" left="18 left" />
              <AlertRow item="Training bibs" left="11 left" />
            </div>
          </div>

          <div className="panel flex-1 p-4">
            <div className="label-mono mb-3">Today</div>
            <div className="space-y-2">
              {sessions.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span
                    className={`w-10 font-mono text-[10px] ${
                      s.status === "Live" ? "text-court-400" : "text-ink-400"
                    }`}
                  >
                    {s.time}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink-100">{s.title}</div>
                    <div className="font-mono text-[10px] text-ink-400">{s.detail}</div>
                  </div>
                  <Chip tone={s.status === "Live" ? "accent" : "neutral"}>
                    {s.status.toUpperCase()}
                  </Chip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-ink-200">
        <span>{label}</span>
        <span>
          {used}/{limit}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
        <div className="h-full bg-court-500" style={{ width: `${(used / limit) * 100}%` }} />
      </div>
    </div>
  );
}

function AlertRow({ item, left }: { item: string; left: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-200">{item}</span>
      <span className="font-mono text-[11px] text-warn">{left}</span>
    </div>
  );
}
