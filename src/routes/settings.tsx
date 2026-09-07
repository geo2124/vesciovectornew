import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, Chip, FieldGrid, Panel } from "@/components/kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — Vescio Vector" },
      {
        name: "description",
        content:
          "Interface branding, package features, payment deadlines, dropdown administration and WhatsApp broadcast groups.",
      },
      { property: "og:title", content: "System Settings — Vescio Vector" },
      { property: "og:description", content: "Brand, configure and control the whole system." },
    ],
  }),
  component: SettingsPage,
});

const tabs = ["UI settings", "Data administration", "Communications"] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("UI settings");

  return (
    <AppShell crumb="CONTROL / SETTINGS" title="System Settings">
      <div className="mb-4 flex flex-wrap gap-2">
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
      </div>

      {tab === "UI settings" ? <UiSettings /> : null}
      {tab === "Data administration" ? <DataAdmin /> : null}
      {tab === "Communications" ? <Communications /> : null}
    </AppShell>
  );
}

function UiSettings() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Panel title="Identity">
          <FieldGrid
            fields={[
              { label: "Software name", hint: "Vescio Vector" },
              { label: "Academy name", hint: "Alba Academy" },
              { label: "Light mode logo", hint: "upload" },
              { label: "Dark mode logo", hint: "upload" },
              { label: "Favicon", hint: "upload or generate from logo" },
              { label: "Sport theme", hint: "Basketball / Football / Volleyball" },
            ]}
          />
        </Panel>

        <Panel title="Appearance" meta="Colours, navigation and buttons">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <div className="label-mono mb-2">Accent colour</div>
              <div className="flex gap-2">
                {["bg-court-500", "bg-good", "bg-warn", "bg-bad", "bg-ink-200"].map((c, i) => (
                  <span
                    key={c}
                    className={`h-8 w-8 rounded ${c} ${i === 0 ? "ring-2 ring-ink-100" : ""}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="label-mono mb-2">Surface</div>
              <div className="flex gap-2">
                <Chip tone="accent">INK DARK</Chip>
                <Chip>PAPER LIGHT</Chip>
              </div>
            </div>
            <div>
              <div className="label-mono mb-2">Corner radius</div>
              <div className="flex gap-2">
                <Chip>SHARP</Chip>
                <Chip tone="accent">SOFT</Chip>
                <Chip>ROUND</Chip>
              </div>
            </div>
            <div>
              <div className="label-mono mb-2">Density</div>
              <div className="flex gap-2">
                <Chip tone="accent">COMPACT</Chip>
                <Chip>COMFORTABLE</Chip>
              </div>
            </div>
            <div>
              <div className="label-mono mb-2">Navigation</div>
              <div className="flex gap-2">
                <Chip tone="accent">SIDEBAR</Chip>
                <Chip>TOP BAR</Chip>
              </div>
            </div>
            <div>
              <div className="label-mono mb-2">Dashboard tiles</div>
              <div className="flex gap-2">
                <Chip tone="accent">4 UP</Chip>
                <Chip>6 UP</Chip>
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
            <Button>Save appearance</Button>
            <Button variant="ghost">Reset to defaults</Button>
          </div>
        </Panel>
      </div>

      <Panel title="Support">
        <FieldGrid
          fields={[
            { label: "Support phone", hint: "+961 …" },
            { label: "Support email", hint: "help@…" },
          ]}
        />
        <div className="border-t border-ink-800 p-4">
          <div className="label-mono mb-2">Live preview</div>
          <div className="rounded-md bg-ink-850 p-3 ring-1 ring-ink-700">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 -rotate-6 place-items-center bg-court-500 font-display text-xs text-ink-950">
                V
              </span>
              <span className="font-display text-sm text-ink-100">Alba Academy</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button>Primary</Button>
              <Button variant="ghost">Secondary</Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function DataAdmin() {
  const dropdowns = [
    "Age categories",
    "Staff positions",
    "Coach levels",
    "Game types",
    "Session types",
    "Merch categories",
    "Sizes",
    "Expense accounts",
  ];
  const featuresOn = ["Multi-branch", "Merchandise", "Accounting", "Coach portal"];
  const featuresOff = ["Geo-fence check-in", "Technical portal quizzes", "WhatsApp broadcast"];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Panel title="Dropdown administration" meta="Add, edit or remove options">
          <div className="divide-y divide-ink-800">
            {dropdowns.map((d) => (
              <div key={d} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-ink-200">{d}</span>
                <div className="flex items-center gap-2">
                  <Chip>+ ADD</Chip>
                  <span className="font-mono text-[10px] text-court-400">MANAGE ›</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payment deadlines">
          <FieldGrid
            fields={[
              { label: "Soft deadline (days)", hint: "7 — shows payment warning" },
              { label: "Hard deadline (days)", hint: "30 — blocks attendance" },
            ]}
          />
          <div className="border-t border-ink-800 px-4 py-3 text-xs text-ink-400">
            Counted from one month after the player registration date.
          </div>
        </Panel>
      </div>

      <Panel title="Package features">
        <div className="space-y-2 p-4">
          {featuresOn.map((f) => (
            <div key={f} className="flex items-center justify-between">
              <span className="text-sm text-ink-200">{f}</span>
              <Chip tone="good">ACTIVE</Chip>
            </div>
          ))}
          {featuresOff.map((f) => (
            <div key={f} className="flex items-center justify-between">
              <span className="text-sm text-ink-400">{f}</span>
              <Chip tone="warn">UPGRADE</Chip>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Communications() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel title="WhatsApp groups" action={<Button>+ New group</Button>}>
        <div className="divide-y divide-ink-800">
          {[
            ["Game results · U-14", "U-14 North, U-14 South"],
            ["Achrafieh parents", "All Achrafieh teams"],
            ["Coaches announcements", "All coaches"],
          ].map(([name, scope]) => (
            <div key={name} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-ink-100">{name}</div>
                <div className="font-mono text-[10px] text-ink-400">{scope}</div>
              </div>
              <span className="ml-auto">
                <Chip tone="accent">BROADCAST</Chip>
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Broadcast a result">
        <FieldGrid
          fields={[
            { label: "Game", hint: "U-14 vs Cedar BC" },
            { label: "Target group", hint: "Game results · U-14" },
            { label: "Message", hint: "auto-generated from result" },
          ]}
        />
        <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
          <Button>Send to WhatsApp</Button>
        </div>
      </Panel>
    </div>
  );
}
