import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Chip, Panel, Row, Stat, Table, Td, Th } from "@/components/kit";
import { sessions } from "@/lib/mock-data";

export const Route = createFileRoute("/technical")({
  head: () => ({
    meta: [
      { title: "Technical Portal — Vescio Vector" },
      {
        name: "description",
        content:
          "Technical director workspace: shared files, quizzes, meetings, seminars, game approvals, reports and practice plans.",
      },
      { property: "og:title", content: "Technical Portal — Vescio Vector" },
      {
        property: "og:description",
        content: "Approvals, coaching resources and practice plan review.",
      },
    ],
  }),
  component: TechnicalPage,
});

const tabs = [
  "Game approval",
  "Practice plans",
  "Shared folder",
  "Practical folder",
  "Meetings",
  "Seminars",
  "Completed games",
] as const;

function TechnicalPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Game approval");

  return (
    <AppShell crumb="CONTROL / TECHNICAL PORTAL" title="Technical Portal">
      <div className="mb-4 flex items-center gap-2">
        <Chip tone="accent">/TECHNICAL</Chip>
        <span className="font-mono text-[10px] text-ink-400">
          VIEW-ONLY FOR SUPER ADMINS · EDITABLE BY TECHNICAL DIRECTOR
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pending games" value="2" note="awaiting approval" accent />
        <Stat label="Plans in review" value="5" note="from 4 coaches" />
        <Stat label="Shared files" value="87" note="12 folders" />
        <Stat label="Quiz completion" value="76%" note="18 of 22 coaches" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              tab === t
                ? "bg-court-500 text-ink-950"
                : "bg-ink-850 text-ink-300 ring-1 ring-ink-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Game approval" ? <GameApproval /> : null}
        {tab === "Practice plans" ? <PracticePlans /> : null}
        {tab === "Shared folder" ? (
          <Folders
            title="Shared folder"
            meta="Coaches and super admins can view or download"
            items={["Offense concepts", "Defense concepts", "Video links", "Season PDFs"]}
          />
        ) : null}
        {tab === "Practical folder" ? (
          <Folders
            title="Practical folder"
            meta="Quizzes, exams and practical forms"
            items={["Level 1 quiz", "Rules exam 2026", "Drill design form", "Video analysis task"]}
          />
        ) : null}
        {tab === "Meetings" ? <Meetings /> : null}
        {tab === "Seminars" ? <Seminars /> : null}
        {tab === "Completed games" ? <CompletedGames /> : null}
      </div>
    </AppShell>
  );
}

function GameApproval() {
  const pending = sessions.filter((s) => s.kind === "Game");
  return (
    <Panel title="Submitted games" meta="Approve, edit or void — approved games move to pre-approval">
      <Table
        head={
          <>
            <Th>GAME</Th>
            <Th>DATE</Th>
            <Th hide>SUBMITTED BY</Th>
            <Th>STATUS</Th>
            <Th>
              <span className="block text-right">ACTION</span>
            </Th>
          </>
        }
      >
        {pending.map((g) => (
          <Row key={g.id}>
            <Td strong>
              <div className="leading-tight">
                <div>{g.title}</div>
                <div className="font-mono text-[10px] text-ink-400">{g.detail}</div>
              </div>
            </Td>
            <Td>
              <span className="font-mono text-xs">
                {g.date.slice(5)} · {g.time}
              </span>
            </Td>
            <Td hide>{g.coach}</Td>
            <Td>
              <Chip tone={g.status === "Pending approval" ? "warn" : "good"}>
                {g.status.toUpperCase()}
              </Chip>
            </Td>
            <Td right>
              <div className="flex justify-end gap-2">
                <Chip tone="good">APPROVE</Chip>
                <Chip tone="bad">VOID</Chip>
              </div>
            </Td>
          </Row>
        ))}
      </Table>
    </Panel>
  );
}

function PracticePlans() {
  const plans = [
    ["U-14 North · Transition week", "Karim Haddad", "In review"],
    ["U-16 Girls · Pick & roll", "Nour Sfeir", "Approved"],
    ["U-12 Mixed · Fundamentals", "Elie Mansour", "Returned"],
    ["U-18 Elite · Zone offense", "Pauline Aoun", "In review"],
  ];
  return (
    <Panel title="Submitted practice plans" meta="Approve, reject or return with notes">
      <Table
        head={
          <>
            <Th>PLAN</Th>
            <Th hide>COACH</Th>
            <Th>STATUS</Th>
            <Th>
              <span className="block text-right">ACTION</span>
            </Th>
          </>
        }
      >
        {plans.map(([plan, coach, status]) => (
          <Row key={plan}>
            <Td strong>{plan}</Td>
            <Td hide>{coach}</Td>
            <Td>
              <Chip
                tone={status === "Approved" ? "good" : status === "Returned" ? "warn" : "neutral"}
              >
                {status.toUpperCase()}
              </Chip>
            </Td>
            <Td right>
              <span className="font-mono text-[10px] text-court-400">REVIEW ›</span>
            </Td>
          </Row>
        ))}
      </Table>
    </Panel>
  );
}

function Folders({ title, meta, items }: { title: string; meta: string; items: string[] }) {
  return (
    <Panel title={title} meta={meta} action={<Button>+ New folder</Button>}>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <div key={f} className="rounded-md bg-ink-850 p-4 ring-1 ring-ink-700">
            <div className="font-mono text-xl text-court-400">▤</div>
            <div className="mt-2 text-sm font-medium text-ink-100">{f}</div>
            <div className="font-mono text-[10px] text-ink-400">
              {Math.ceil(f.length / 3)} files
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Meetings() {
  return (
    <Panel title="Online meetings" action={<Button>+ Schedule meeting</Button>}>
      <div className="divide-y divide-ink-800">
        {[
          ["Weekly technical sync", "Google Meet", "Mon 20:00", "18 invited"],
          ["U-16 staff review", "Zoom", "Wed 21:00", "6 invited"],
          ["Season planning", "Microsoft Teams", "Fri 18:00", "9 invited"],
        ].map(([name, tool, when, who]) => (
          <div key={name} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-ink-100">{name}</div>
              <div className="font-mono text-[10px] text-ink-400">
                {tool} · {when} · {who}
              </div>
            </div>
            <span className="ml-auto flex gap-2">
              <Chip>ATTENDEES</Chip>
              <Chip tone="accent">JOIN LINK</Chip>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Seminars() {
  return (
    <Panel title="Seminars" action={<Button>+ New seminar</Button>}>
      <div className="divide-y divide-ink-800">
        {[
          ["Defensive principles", "HQ auditorium", "24 May · 18:00", "Present 14 · Absent 2"],
          ["Youth strength & conditioning", "Achrafieh Court A", "31 May · 17:00", "Not started"],
        ].map(([name, venue, when, att]) => (
          <div key={name} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-ink-100">{name}</div>
              <div className="font-mono text-[10px] text-ink-400">
                {venue} · {when}
              </div>
            </div>
            <span className="ml-auto">
              <Chip>{att.toUpperCase()}</Chip>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CompletedGames() {
  return (
    <Panel title="Completed games" meta="Reports submitted by coaches">
      <Table
        head={
          <>
            <Th>GAME</Th>
            <Th>RESULT</Th>
            <Th hide>COACH</Th>
            <Th hide>TYPE</Th>
            <Th>
              <span className="block text-right">REPORT</span>
            </Th>
          </>
        }
      >
        {[
          ["U-14 vs Cedar BC", "W 78–64", "Karim Haddad", "Official"],
          ["U-16 Girls vs Antonine", "L 55–61", "Nour Sfeir", "Official"],
          ["U-18 Elite vs Levant", "W 88–70", "Pauline Aoun", "Friendly"],
        ].map(([g, r, c, t]) => (
          <Row key={g}>
            <Td strong>{g}</Td>
            <Td>
              <span className={`font-mono text-xs ${r.startsWith("W") ? "text-good" : "text-bad"}`}>
                {r}
              </span>
            </Td>
            <Td hide>{c}</Td>
            <Td hide>{t}</Td>
            <Td right>
              <Chip tone="accent">VIEW</Chip>
            </Td>
          </Row>
        ))}
      </Table>
    </Panel>
  );
}
