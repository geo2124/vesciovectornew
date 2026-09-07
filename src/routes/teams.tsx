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
} from "@/components/kit";
import { teams } from "@/lib/mock-data";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams — Vescio Vector" },
      {
        name: "description",
        content:
          "Team roster management: age categories, head and assistant coaches, branches and season records.",
      },
      { property: "og:title", content: "Teams — Vescio Vector" },
      {
        property: "og:description",
        content: "Build teams, assign coaches and track season records.",
      },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  return (
    <AppShell crumb="ROSTER / TEAMS" title="Teams">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active teams" value="18" note="across 3 branches" />
        <Stat label="Categories" value="6" note="U-10 → Senior" />
        <Stat label="Season record" value="44–22" note="67% win rate" accent />
        <Stat label="Unassigned players" value="7" note="need a team" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel
          title="Team database"
          action={
            <>
              <Filters items={["Category", "Year", "Gender", "Branch"]} />
              <Button>+ New team</Button>
            </>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <SearchField placeholder="Search teams…" />
          </div>
          <Table
            head={
              <>
                <Th>TEAM</Th>
                <Th>CATEGORY</Th>
                <Th hide>HEAD COACH</Th>
                <Th hide>BRANCH</Th>
                <Th>PLAYERS</Th>
                <Th>
                  <span className="block text-right">W–L</span>
                </Th>
              </>
            }
            footer={`SHOWING ${teams.length} OF 18`}
          >
            {teams.map((t) => (
              <Row key={t.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div>{t.name}</div>
                    <div className="font-mono text-[10px] text-ink-400">{t.gender}</div>
                  </div>
                </Td>
                <Td>
                  <Chip>{t.category}</Chip>
                </Td>
                <Td hide>
                  <div className="leading-tight">
                    <div className="text-xs">{t.headCoach}</div>
                    {t.assistant ? (
                      <div className="font-mono text-[10px] text-ink-400">AC {t.assistant}</div>
                    ) : null}
                  </div>
                </Td>
                <Td hide>{t.branch}</Td>
                <Td>
                  <span className="font-mono text-xs">{t.players}</span>
                </Td>
                <Td right>
                  <span className="font-mono text-xs text-ink-100">
                    {t.wins}–{t.losses}
                  </span>
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="New team" meta="Coaches, branches, roster">
            <FieldGrid
              fields={[
                { label: "Team name" },
                { label: "Age category", hint: "from system settings" },
                { label: "Head coach *", hint: "autocomplete" },
                { label: "Assistant coach", hint: "autocomplete" },
                { label: "Team manager", hint: "staff or coach" },
                { label: "Branches", hint: "one or more" },
              ]}
            />
            <div className="border-t border-ink-800 px-4 py-3">
              <div className="label-mono mb-2">Add players</div>
              <SearchField placeholder="Search player name or phone…" />
              <div className="mt-3 space-y-1.5">
                {["Marc Gebara · 2011", "Jad Rizk · 2011", "Ziad Nassar · 2009"].map((p, i) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded bg-ink-850 px-2.5 py-2 text-xs text-ink-200 ring-1 ring-ink-700"
                  >
                    <span>{p}</span>
                    {i === 2 ? <Chip tone="warn">DOB OUT OF RANGE</Chip> : <Chip>✕</Chip>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
              <Button>Save team</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </Panel>

          <Panel title="U-14 North" meta="Season performance">
            <div className="grid grid-cols-2 gap-2 p-4">
              {[
                ["Games", "14"],
                ["Wins", "11"],
                ["Losses", "3"],
                ["Avg attendance", "92%"],
              ].map(([l, v]) => (
                <div key={l} className="rounded bg-ink-850 p-2.5 ring-1 ring-ink-700">
                  <div className="label-mono">{l}</div>
                  <div className="font-display mt-1 text-2xl tracking-tight text-ink-100">{v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
