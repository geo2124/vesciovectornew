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
import { coaches } from "@/lib/mock-data";

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
    ],
  }),
  component: CoachesPage,
});

function CoachesPage() {
  const outstanding = coaches.reduce((a, c) => a + c.outstanding, 0);
  return (
    <AppShell crumb="ROSTER / COACHES" title="Coaches">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Coaches" value={String(coaches.length)} note="4 head · 2 assistant" />
        <Stat label="Portal enabled" value="3" note="Gmail or credentials" />
        <Stat label="Sessions · May" value="130" note="of 170 planned" />
        <Stat label="Outstanding" value={money(outstanding)} accent note="payable to coaches" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel
          title="Coach database"
          meta="Search by name or phone"
          action={
            <>
              <Filters items={["Level", "Branch", "Portal"]} />
              <Button>+ New coach</Button>
            </>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <SearchField placeholder="Search coaches by name or phone…" />
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
            footer={`SHOWING ${coaches.length} OF 22`}
          >
            {coaches.map((c) => (
              <Row key={c.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div className="flex items-center gap-2">
                      {c.name}
                      {c.portal ? <Chip tone="accent">PORTAL</Chip> : null}
                    </div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {c.phone} · {c.years} yrs · {c.branch}
                    </div>
                  </div>
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

        <div className="space-y-4">
          <Panel title="New coach" meta="Profile, documents, portal access">
            <FieldGrid
              fields={[
                { label: "First name" },
                { label: "Last name" },
                { label: "Date of birth" },
                { label: "Gender" },
                { label: "Phone" },
                { label: "Email" },
                { label: "Level", hint: "Head / Assistant / Skills" },
                { label: "Years of experience" },
                { label: "Rate per session", hint: "$" },
                { label: "Previous academies", hint: "add multiple" },
                { label: "Upload CV", hint: "PDF" },
                { label: "Upload ID front / back", hint: "image or PDF" },
              ]}
            />
            <div className="flex items-center justify-between border-t border-ink-800 px-4 py-3">
              <div>
                <div className="text-sm text-ink-200">Coach portal account</div>
                <div className="font-mono text-[10px] text-ink-400">
                  Gmail sign-in or fixed username & password
                </div>
              </div>
              <Chip>OFF</Chip>
            </div>
            <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
              <Button>Save coach</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </Panel>

          <Panel title="Karim Haddad" meta="Performance & financials">
            <div className="grid grid-cols-2 gap-2 p-4">
              <MiniStat label="As head coach" value="11–3" />
              <MiniStat label="As assistant" value="2–1" />
              <MiniStat label="Sessions · May" value="26" />
              <MiniStat label="Outstanding" value="$1,150" accent />
            </div>
            <div className="border-t border-ink-800 px-4 py-3">
              <div className="label-mono mb-2">Record payment</div>
              <div className="flex flex-wrap gap-2">
                <Chip tone="accent">BY RATE</Chip>
                <Chip>FIXED AMOUNT</Chip>
                <Chip>CUSTOM SALARY</Chip>
              </div>
            </div>
            <div className="border-t border-ink-800 px-4 py-3">
              <div className="label-mono mb-2">Range</div>
              <div className="flex flex-wrap gap-2">
                <Chip>WEEKLY</Chip>
                <Chip tone="accent">MONTHLY</Chip>
                <Chip>YEARLY</Chip>
                <Chip>DATE → DATE</Chip>
              </div>
            </div>
          </Panel>
        </div>
      </div>
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
