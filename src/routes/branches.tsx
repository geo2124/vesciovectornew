import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button, Chip, FieldGrid, Filters, Panel, SearchField, Stat } from "@/components/kit";
import { branches } from "@/lib/mock-data";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Branches — Vescio Vector" },
      {
        name: "description",
        content:
          "Branch and court management with managers, contacts, map locations and weekly court schedules.",
      },
      { property: "og:title", content: "Branches — Vescio Vector" },
      { property: "og:description", content: "Manage branches, courts and their schedules." },
    ],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  return (
    <AppShell crumb="ROSTER / BRANCHES" title="Branches">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Branches" value="3" note="of 5 allowed" />
        <Stat label="Courts" value="5" note="2 outdoor" />
        <Stat label="Weekly slots" value="62" note="scheduled" />
        <Stat label="Utilisation" value="78%" note="peak 17:00–20:00" accent />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchField placeholder="Search branch by name or area…" />
        <Filters items={["City", "Manager"]} />
        <div className="ml-auto">
          <Button>+ New branch</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {branches.map((b) => (
            <Panel key={b.id} title={b.name} meta={`${b.city} · manager ${b.manager}`}>
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_260px]">
                <div>
                  <div className="label-mono">Address</div>
                  <p className="mt-1 text-sm text-ink-200">{b.address}</p>
                  <div className="label-mono mt-4">Courts</div>
                  <div className="mt-2 space-y-2">
                    {b.courts.map((c) => (
                      <div
                        key={c.name}
                        className="flex flex-wrap items-center gap-2 rounded bg-ink-850 px-3 py-2 ring-1 ring-ink-700"
                      >
                        <span className="text-sm text-ink-100">{c.name}</span>
                        <span className="font-mono text-[10px] text-ink-400">
                          {c.contact} · {c.phone}
                        </span>
                        <span className="ml-auto">
                          <Chip tone="accent">MAP LINKED</Chip>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="label-mono mt-4">Weekly schedule</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Mon 16–21", "Tue 16–20", "Wed 16–21", "Fri 15–19", "Sat 09–14"].map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
                <div className="grid min-h-[180px] place-items-center rounded-md bg-ink-850 ring-1 ring-ink-700">
                  <div className="text-center">
                    <div className="font-mono text-2xl text-ink-700">⌖</div>
                    <div className="label-mono mt-2">Map preview</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 border-t border-ink-800 px-4 py-2.5">
                <span className="font-mono text-[10px] text-ink-400">{b.teams} TEAMS</span>
                <span className="font-mono text-[10px] text-ink-400">{b.players} PLAYERS</span>
                <span className="ml-auto font-mono text-[10px] text-court-400">EDIT ›</span>
              </div>
            </Panel>
          ))}
        </div>

        <Panel title="New branch">
          <FieldGrid
            fields={[
              { label: "Branch name" },
              { label: "City" },
              { label: "Full address" },
              { label: "Branch manager", hint: "search staff" },
              { label: "Court name" },
              { label: "Court contact person" },
              { label: "Contact phone" },
              { label: "Google Map link / ID" },
            ]}
          />
          <div className="px-4 pb-4">
            <div className="grid h-32 place-items-center rounded-md bg-ink-850 ring-1 ring-ink-700">
              <span className="label-mono">Map preview loads here</span>
            </div>
          </div>
          <div className="border-t border-ink-800 px-4 py-3">
            <div className="label-mono mb-2">Court schedule</div>
            <div className="flex flex-wrap gap-2">
              <Chip>+ ADD DAY</Chip>
              <Chip>START TIME</Chip>
              <Chip>END TIME</Chip>
            </div>
          </div>
          <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
            <Button>Save branch</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
