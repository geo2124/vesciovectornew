import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { players, sessions } from "@/lib/mock-data";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions — Vescio Vector" },
      {
        name: "description",
        content:
          "Practices and games: scheduling, recurrence, coach assignment, approval workflow and attendance.",
      },
      { property: "og:title", content: "Sessions — Vescio Vector" },
      {
        property: "og:description",
        content: "Schedule practices and games and run attendance.",
      },
    ],
  }),
  component: SessionsPage,
});

const tabs = ["Practices", "Games", "Attendance"] as const;

function SessionsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Practices");

  return (
    <AppShell crumb="OPS / SESSIONS" title="Sessions">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="This week" value="42" note="practices" />
        <Stat label="Games" value="9" note="2 awaiting approval" accent />
        <Stat label="Live now" value="3" note="attendance open" accent />
        <Stat label="Cancelled" value="1" note="court unavailable" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md bg-ink-850 p-0.5 ring-1 ring-ink-700">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                tab === t ? "bg-court-500 text-ink-950" : "text-ink-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Filters items={["Branch", "Team", "Coach"]} />
        <div className="ml-auto">
          <Button>+ New {tab === "Games" ? "game" : "practice"}</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        {tab === "Attendance" ? <AttendanceBoard /> : <SessionList kind={tab} />}

        <div className="space-y-4">
          {tab === "Games" ? (
            <Panel title="Schedule a game" meta="Goes to technical director for approval">
              <FieldGrid
                fields={[
                  { label: "Academy team", hint: "autocomplete" },
                  { label: "Opponent", hint: "academy or external" },
                  { label: "Location" },
                  { label: "Date" },
                  { label: "Time" },
                  { label: "Game type", hint: "friendly / official" },
                  { label: "Referees", hint: "optional" },
                  { label: "Staff assigned", hint: "optional" },
                ]}
              />
              <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
                <Button>Submit for approval</Button>
              </div>
            </Panel>
          ) : (
            <Panel title="Create a practice">
              <FieldGrid
                fields={[
                  { label: "Primary branch" },
                  { label: "Additional branches", hint: "optional" },
                  { label: "Courts", hint: "one or more" },
                  { label: "Head coach" },
                  { label: "Assistant coach", hint: "optional" },
                  { label: "Date" },
                  { label: "Start time" },
                  { label: "End time" },
                ]}
              />
              <div className="border-t border-ink-800 px-4 py-3">
                <div className="label-mono mb-2">Recurrence</div>
                <div className="flex flex-wrap gap-2">
                  <Chip tone="accent">ONCE</Chip>
                  <Chip>WEEKLY</Chip>
                  <Chip>BI-WEEKLY</Chip>
                  <Chip>MONTHLY</Chip>
                </div>
              </div>
              <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
                <Button>Create session</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </Panel>
          )}

          <Panel title="Approval pipeline">
            <div className="space-y-2 p-4 text-sm">
              <PipeRow label="Submitted by coach" value="4" />
              <PipeRow label="Pending technical director" value="2" tone="warn" />
              <PipeRow label="Pre-approved" value="1" tone="accent" />
              <PipeRow label="Official" value="6" tone="good" />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function SessionList({ kind }: { kind: "Practices" | "Games" }) {
  const list = sessions.filter((s) => (kind === "Games" ? s.kind === "Game" : s.kind !== "Game"));
  return (
    <Panel title={kind} meta="Editable by branch managers at any time">
      <div className="border-b border-ink-800 px-4 py-3">
        <SearchField placeholder="Search sessions…" />
      </div>
      <Table
        head={
          <>
            <Th>ACTIVITY</Th>
            <Th>DATE</Th>
            <Th hide>BRANCH</Th>
            <Th hide>COACH</Th>
            <Th>
              <span className="block text-right">STATUS</span>
            </Th>
          </>
        }
        footer={`SHOWING ${list.length} OF ${kind === "Games" ? 9 : 42}`}
      >
        {list.map((s) => (
          <Row key={s.id}>
            <Td strong>
              <div className="leading-tight">
                <div>{s.title}</div>
                <div className="font-mono text-[10px] text-ink-400">{s.detail}</div>
              </div>
            </Td>
            <Td>
              <span className="font-mono text-xs">
                {s.date.slice(5)} · {s.time}
              </span>
            </Td>
            <Td hide>{s.branch}</Td>
            <Td hide>{s.coach}</Td>
            <Td right>
              <Chip
                tone={
                  s.status === "Live"
                    ? "accent"
                    : s.status === "Pending approval"
                      ? "warn"
                      : s.status === "Official"
                        ? "good"
                        : "neutral"
                }
              >
                {s.status.toUpperCase()}
              </Chip>
            </Td>
          </Row>
        ))}
      </Table>
    </Panel>
  );
}

function AttendanceBoard() {
  return (
    <Panel
      title="U-16 North · Practice"
      meta="Court A · 14:00 · attendance opened 1h before"
      action={<Button>Save attendance</Button>}
    >
      <div className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
        <div className="text-sm text-ink-200">Coach check-in</div>
        <Chip tone="good">KARIM HADDAD · CHECKED IN</Chip>
      </div>
      <div className="divide-y divide-ink-800">
        {players.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-ink-100">{p.name}</div>
              <div className="font-mono text-[10px] text-ink-400">
                {p.category} · {p.team}
              </div>
            </div>
            {p.status === "Soft flag" ? <Chip tone="warn">PAYMENT DUE</Chip> : null}
            {p.status === "Inactive" ? <Chip tone="bad">BLOCKED · OVERRIDE</Chip> : null}
            <div className="flex gap-1.5">
              {["P", "A", "E"].map((m, i) => (
                <span
                  key={m}
                  className={`grid h-8 w-8 place-items-center rounded font-mono text-xs ring-1 ${
                    i === 0 && p.status !== "Inactive"
                      ? "bg-court-500 text-ink-950 ring-court-500"
                      : "bg-ink-850 text-ink-300 ring-ink-700"
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PipeRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "good" | "warn";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-300">{label}</span>
      <Chip tone={tone}>{value}</Chip>
    </div>
  );
}
