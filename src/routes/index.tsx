import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Chip, Panel, Row, Stat, Table, Td, Th, money } from "@/components/kit";
import { useDB } from "@/lib/data-store";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { db } = useDB();
  const { players, teams, sessions, coaches, stock, ledger, academy, branches } = db;

  const collected = ledger.filter((l) => l.amount > 0).reduce((a, l) => a + l.amount, 0);
  const open = players.reduce((a, p) => a + p.balance, 0);
  const games = sessions.filter((s) => s.kind === "Game").length;
  const low = stock.filter((s) => s.stock <= s.reorder);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...sessions].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const todays = upcoming.filter((s) => s.date >= today).slice(0, 4);

  return (
    <AppShell crumb="OPS / DASHBOARD" title="Overview">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Total players"
          value={String(players.length)}
          note={`of ${academy.playersLimit} allowed`}
          accent
        />
        <Stat
          label="Active teams"
          value={String(teams.length)}
          note={`${branches.length} branches`}
        />
        <Stat
          label="Scheduled activity"
          value={String(sessions.length)}
          note={`${games} games`}
        />
        <Stat label="Collected" value={money(collected)} note={`${money(open)} open`} accent />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel
          title="Coaches"
          meta={`${coaches.length} on staff · ${coaches.filter((c) => c.portal).length} portal enabled`}
          action={
            <Link
              to="/coaches"
              className="rounded-md bg-court-500 px-3.5 py-2 text-sm font-semibold text-ink-950 hover:bg-court-400"
            >
              Manage coaches
            </Link>
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
            footer={`SHOWING ${Math.min(5, coaches.length)} OF ${coaches.length}`}
          >
            {coaches.slice(0, 5).map((c) => (
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
                    {money(c.outstanding)}
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
              <Meter label="Players" used={players.length} limit={academy.playersLimit} />
              <Meter label="Branches" used={branches.length} limit={academy.branchesLimit} />
              <Meter label="Storage (GB)" used={academy.storageUsed} limit={academy.storageLimit} />
            </div>
          </div>

          <div className="panel p-4">
            <div className="label-mono mb-3">Inventory alerts</div>
            <div className="space-y-2 text-sm">
              {low.length === 0 ? (
                <div className="font-mono text-[11px] text-ink-400">Everything above reorder.</div>
              ) : (
                low.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink-200">
                      {s.item} · {s.variant}
                    </span>
                    <span className="font-mono text-[11px] text-warn">{s.stock} left</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel flex-1 p-4">
            <div className="label-mono mb-3">Next up</div>
            <div className="space-y-2">
              {todays.length === 0 ? (
                <div className="font-mono text-[11px] text-ink-400">Nothing scheduled.</div>
              ) : (
                todays.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span
                      className={`w-10 font-mono text-[10px] ${
                        s.status === "Live" ? "text-court-400" : "text-ink-400"
                      }`}
                    >
                      {s.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-100">{s.title}</div>
                      <div className="truncate font-mono text-[10px] text-ink-400">
                        {s.date} · {s.branch}
                      </div>
                    </div>
                    <Chip tone={s.status === "Live" ? "accent" : "neutral"}>
                      {s.status.toUpperCase()}
                    </Chip>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-ink-200">
        <span>{label}</span>
        <span>
          {used}/{limit}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
        <div className="h-full bg-court-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
