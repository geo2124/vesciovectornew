import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  Field,
  Input,
  Modal,
  Panel,
  Select,
} from "@/components/kit";
import markAsset from "@/assets/vescio-vector-mark.png.asset.json";
import { useDB } from "@/lib/data-store";
import { defaultAppearance, skinVars } from "@/lib/appearance";
import type { Appearance as AppearanceConfig, Skin } from "@/lib/appearance";
import { useTheme } from "@/lib/theme";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const tabs = ["Identity", "Appearance", "Data administration", "Communications"] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Identity");

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

      {tab === "Identity" ? <Identity /> : null}
      {tab === "Appearance" ? <Appearance /> : null}
      {tab === "Data administration" ? <DataAdmin /> : null}
      {tab === "Communications" ? <Communications /> : null}
    </AppShell>
  );
}

function Identity() {
  const { db, update, resetDemo } = useDB();
  const [form, setForm] = useState(db.academy);
  const [saved, setSaved] = useState(false);

  function save() {
    update((d) => ({ ...d, academy: form }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function uploadLogo(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, logo: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Panel title="Academy identity" meta="Used across the workspace and the coach portal">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Field label="Academy name">
              <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            </Field>
            <Field label="Workspace URL">
              <Input value={form.url} onChange={(v) => setForm({ ...form, url: v })} />
            </Field>
            <Field label="Sport theme">
              <Select
                value={form.sport}
                onChange={(v) => setForm({ ...form, sport: v as typeof form.sport })}
                options={["Basketball", "Football", "Volleyball"]}
              />
            </Field>
            <Field label="Currency">
              <Select
                value={form.currency}
                onChange={(v) => setForm({ ...form, currency: v })}
                options={["USD", "EUR", "LBP", "AED", "SAR"]}
              />
            </Field>
            <Field label="Package">
              <Select
                value={form.plan}
                onChange={(v) => setForm({ ...form, plan: v })}
                options={["Starter", "Pro", "Elite"]}
              />
            </Field>
            <Field label="Renewal">
              <Input value={form.renews} onChange={(v) => setForm({ ...form, renews: v })} />
            </Field>
            <Field label="Player limit">
              <Input
                type="number"
                value={String(form.playersLimit)}
                onChange={(v) => setForm({ ...form, playersLimit: Number(v) || 0 })}
              />
            </Field>
            <Field label="Branch limit">
              <Input
                type="number"
                value={String(form.branchesLimit)}
                onChange={(v) => setForm({ ...form, branchesLimit: Number(v) || 0 })}
              />
            </Field>
            <Field label="Academy logo" hint="PNG or SVG, shown in the sidebar">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadLogo(e.target.files?.[0])}
                className="mt-1.5 w-full rounded-md bg-ink-850 px-3 py-2 font-ui text-sm text-ink-200 ring-1 ring-ink-700 file:mr-3 file:rounded file:border-0 file:bg-court-500 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-ink-950"
              />
            </Field>
          </div>
          <div className="flex items-center gap-2 border-t border-ink-800 px-4 py-3">
            <Button onClick={save}>Save settings</Button>
            <Button variant="ghost" onClick={() => setForm(db.academy)}>
              Revert
            </Button>
            {saved ? <Chip tone="good">SAVED</Chip> : null}
          </div>
        </Panel>

        <Panel title="Payment deadlines" meta="Counted from one month after registration">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Field label="Soft deadline (days)" hint="shows a payment warning">
              <Input
                type="number"
                value={String(form.softDeadline)}
                onChange={(v) => setForm({ ...form, softDeadline: Number(v) || 0 })}
              />
            </Field>
            <Field label="Hard deadline (days)" hint="blocks attendance">
              <Input
                type="number"
                value={String(form.hardDeadline)}
                onChange={(v) => setForm({ ...form, hardDeadline: Number(v) || 0 })}
              />
            </Field>
          </div>
          <div className="border-t border-ink-800 px-4 py-3">
            <Button onClick={save}>Save deadlines</Button>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Support & preview">
          <div className="grid gap-3 p-4">
            <Field label="Support phone">
              <Input
                value={form.supportPhone}
                onChange={(v) => setForm({ ...form, supportPhone: v })}
              />
            </Field>
            <Field label="Support email">
              <Input
                value={form.supportEmail}
                onChange={(v) => setForm({ ...form, supportEmail: v })}
              />
            </Field>
          </div>
          <div className="border-t border-ink-800 p-4">
            <div className="label-mono mb-2">Live preview</div>
            <div className="rounded-md bg-ink-850 p-3 ring-1 ring-ink-700">
              <div className="flex items-center gap-2">
                <img
                  src={form.logo ?? markAsset.url}
                  alt={form.name}
                  className="h-7 w-7 object-contain"
                />
                <span className="font-display text-sm text-ink-100">{form.name}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button>Primary</Button>
                <Button variant="ghost">Secondary</Button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Danger zone" meta="Development data">
          <div className="space-y-3 p-4">
            <p className="text-sm text-ink-300">
              Reset this workspace back to the demo records that ship with the dev version.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm("Reset all workspace data to the demo set?")) resetDemo();
              }}
            >
              Reset workspace data
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}


const swatches: { key: keyof Skin; label: string; hint: string }[] = [
  { key: "accent", label: "Accent", hint: "buttons, highlights, active items" },
  { key: "background", label: "Page background", hint: "the deepest surface" },
  { key: "surface", label: "Panels & cards", hint: "boxes sitting on the page" },
  { key: "text", label: "Text", hint: "main reading colour" },
];

function ColorRow({
  skin,
  onChange,
}: {
  skin: Skin;
  onChange: (s: Skin) => void;
}) {
  return (
    <div className="space-y-2">
      {swatches.map((sw) => (
        <div key={sw.key} className="flex items-center gap-3 rounded-md bg-ink-850 p-2 ring-1 ring-ink-700">
          <input
            type="color"
            aria-label={sw.label}
            value={skin[sw.key]}
            onChange={(e) => onChange({ ...skin, [sw.key]: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-ink-100">{sw.label}</div>
            <div className="font-mono text-[10px] text-ink-400">{sw.hint}</div>
          </div>
          <input
            value={skin[sw.key]}
            onChange={(e) => onChange({ ...skin, [sw.key]: e.target.value })}
            className="w-24 rounded bg-ink-900 px-2 py-1 text-right font-mono text-[11px] text-ink-200 ring-1 ring-ink-700 focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}

function SkinPreview({ skin, label }: { skin: Skin; label: string }) {
  const v = skinVars(skin);
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: v["--ink-950"], color: v["--ink-100"] }}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: v["--ink-400"] }}>
        {label}
      </div>
      <div className="mt-2 rounded-md p-3" style={{ background: v["--ink-900"], boxShadow: `inset 0 0 0 1px ${v["--ink-800"]}` }}>
        <div className="text-sm font-semibold">Team roster</div>
        <div className="mt-1 font-mono text-[10px]" style={{ color: v["--ink-400"] }}>
          14 players · 3 coaches
        </div>
        <div className="mt-3 flex gap-2">
          <span
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: v["--court-500"], color: v["--primary-foreground"] }}
          >
            Primary
          </span>
          <span
            className="rounded px-3 py-1.5 text-xs"
            style={{ background: v["--ink-850"], color: v["--ink-200"], boxShadow: `inset 0 0 0 1px ${v["--ink-700"]}` }}
          >
            Secondary
          </span>
        </div>
      </div>
    </div>
  );
}

const presets: { name: string; value: Pick<AppearanceConfig, "dark" | "light"> }[] = [
  { name: "Vector teal", value: { dark: defaultAppearance.dark, light: defaultAppearance.light } },
  {
    name: "Court orange",
    value: {
      dark: { accent: "#f97316", background: "#141313", surface: "#1f1d1c", text: "#f2ece8" },
      light: { accent: "#c2410c", background: "#faf6f3", surface: "#ffffff", text: "#26201c" },
    },
  },
  {
    name: "Midnight blue",
    value: {
      dark: { accent: "#4f8ef7", background: "#0c1220", surface: "#151d31", text: "#e8eefb" },
      light: { accent: "#2354c7", background: "#f4f6fb", surface: "#ffffff", text: "#161d2e" },
    },
  },
  {
    name: "Royal purple",
    value: {
      dark: { accent: "#a855f7", background: "#140f1c", surface: "#1e1729", text: "#eee7f7" },
      light: { accent: "#7127c4", background: "#f7f4fb", surface: "#ffffff", text: "#1e1729" },
    },
  },
];

function Appearance() {
  const { db, update } = useDB();
  const { theme, toggle } = useTheme();
  const current: AppearanceConfig = { ...defaultAppearance, ...(db.appearance ?? {}) };
  const [form, setForm] = useState<AppearanceConfig>(current);
  const [saved, setSaved] = useState(false);

  function apply(next: AppearanceConfig) {
    setForm(next);
    update((d) => ({ ...d, appearance: next }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Panel
          title="Colour themes"
          meta="Dark and light are styled separately — changes apply live"
          action={
            <>
              <Chip tone={saved ? "good" : "neutral"}>{saved ? "SAVED" : `VIEWING ${theme.toUpperCase()}`}</Chip>
              <Button variant="ghost" onClick={toggle}>
                Preview {theme === "dark" ? "light" : "dark"}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="label-mono">Dark theme</div>
              <ColorRow skin={form.dark} onChange={(dark) => apply({ ...form, dark })} />
              <SkinPreview skin={form.dark} label="Dark preview" />
            </div>
            <div className="space-y-3">
              <div className="label-mono">Light theme</div>
              <ColorRow skin={form.light} onChange={(light) => apply({ ...form, light })} />
              <SkinPreview skin={form.light} label="Light preview" />
            </div>
          </div>
        </Panel>

        <Panel title="Interface" meta="Shape and density of the whole system">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label={`Corner radius · ${form.radius}px`}>
              <input
                type="range"
                min={0}
                max={20}
                value={form.radius}
                onChange={(e) => apply({ ...form, radius: Number(e.target.value) })}
                className="mt-3 w-full accent-court-500"
              />
            </Field>
            <Field label={`Text size · ${form.fontSize}px`}>
              <input
                type="range"
                min={13}
                max={19}
                value={form.fontSize}
                onChange={(e) => apply({ ...form, fontSize: Number(e.target.value) })}
                className="mt-3 w-full accent-court-500"
              />
            </Field>
            <label className="flex items-center gap-3 rounded-md bg-ink-850 p-3 ring-1 ring-ink-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.texture}
                onChange={(e) => apply({ ...form, texture: e.target.checked })}
                className="h-4 w-4 accent-court-500"
              />
              <span className="text-sm text-ink-100">Court texture behind headers</span>
            </label>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Presets" meta="One click, then fine-tune">
          <div className="grid gap-2 p-4">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => apply({ ...form, dark: p.value.dark, light: p.value.light })}
                className="flex items-center gap-3 rounded-md bg-ink-850 p-3 text-left ring-1 ring-ink-700 hover:ring-court-500"
              >
                <span className="flex gap-1">
                  {[p.value.dark.accent, p.value.dark.background, p.value.light.accent, p.value.light.background].map(
                    (c) => (
                      <span key={c} className="h-5 w-5 rounded" style={{ background: c }} />
                    ),
                  )}
                </span>
                <span className="text-sm text-ink-100">{p.name}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Restore" meta="Back to the Vescio Vector look">
          <div className="p-4">
            <Button variant="ghost" onClick={() => apply(defaultAppearance)}>
              Reset appearance
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DataAdmin() {
  const { db, update, clearData, loadDemo } = useDB();
  const [openList, setOpenList] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const lists = db.lists;
  const options = openList ? (lists[openList] ?? []) : [];

  function addOption() {
    if (!openList || !draft.trim()) return;
    update((d) => ({
      ...d,
      lists: { ...d.lists, [openList]: [...(d.lists[openList] ?? []), draft.trim()] },
    }));
    setDraft("");
  }

  function removeOption(value: string) {
    if (!openList) return;
    update((d) => ({
      ...d,
      lists: { ...d.lists, [openList]: (d.lists[openList] ?? []).filter((o) => o !== value) },
    }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel title="Dropdown administration" meta="Add or remove the options used in every form">
        <div className="divide-y divide-ink-800">
          {Object.entries(lists).map(([name, values]) => (
            <div key={name} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <span className="text-sm text-ink-200">{name}</span>
                <div className="font-mono text-[10px] text-ink-400">{values.length} options</div>
              </div>
              <button
                type="button"
                onClick={() => setOpenList(name)}
                className="font-mono text-[10px] text-court-400"
              >
                MANAGE ›
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Demo records" meta="Dev version only">
        <div className="space-y-3 p-4">
          <p className="text-sm text-ink-300">
            Empty the workspace to start a clean academy, or bring the sample records back at any
            time. Your academy details, dropdown options and colours are always kept.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm("Delete every record in this workspace? Settings are kept."))
                  clearData();
              }}
            >
              Delete all data
            </Button>
            <Button
              onClick={() => {
                if (window.confirm("Load the sample records back into this workspace?")) loadDemo();
              }}
            >
              Load demo data
            </Button>
          </div>
          <div className="font-mono text-[10px] text-ink-400">
            {db.players.length} players · {db.coaches.length} coaches · {db.sessions.length}{" "}
            activities · {db.ledger.length} ledger rows
          </div>
        </div>
      </Panel>

      <Panel title="Package features" meta="What this academy can reach">
        <div className="space-y-2 p-4">
          {[
            ["Multi-branch", db.branches.length > 1],
            ["Merchandise", true],
            ["Accounting", true],
            ["Coach portal", db.coaches.some((c) => c.portal)],
            ["Technical portal", true],
          ].map(([label, on]) => (
            <div key={String(label)} className="flex items-center justify-between">
              <span className="text-sm text-ink-200">{String(label)}</span>
              <Chip tone={on ? "good" : "warn"}>{on ? "ACTIVE" : "UPGRADE"}</Chip>
            </div>
          ))}
        </div>
      </Panel>

      <Modal
        open={openList !== null}
        title={openList ?? ""}
        meta="These options appear in the matching dropdowns"
        onClose={() => setOpenList(null)}
      >
        <div className="space-y-2 p-4">
          {options.map((o) => (
            <div
              key={o}
              className="flex items-center justify-between rounded bg-ink-850 px-3 py-2 ring-1 ring-ink-700"
            >
              <span className="text-sm text-ink-100">{o}</span>
              <button
                type="button"
                onClick={() => removeOption(o)}
                className="font-mono text-[10px] text-bad"
              >
                REMOVE
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <div className="flex-1">
              <Input value={draft} onChange={setDraft} placeholder="New option" />
            </div>
            <div className="pt-1.5">
              <Button onClick={addOption}>Add</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Communications() {
  const { db, update } = useDB();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", scope: "" });
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState(db.groups[0]?.name ?? "");
  const [sent, setSent] = useState<string | null>(null);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel
        title="WhatsApp groups"
        action={
          <Button
            onClick={() => {
              setForm({ name: "", scope: "" });
              setOpen(true);
            }}
          >
            + New group
          </Button>
        }
      >
        <div className="divide-y divide-ink-800">
          {db.groups.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-ink-100">{g.name}</div>
                <div className="font-mono text-[10px] text-ink-400">{g.scope}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Chip tone="accent">BROADCAST</Chip>
                <button
                  type="button"
                  onClick={() =>
                    update((d) => ({ ...d, groups: d.groups.filter((x) => x.id !== g.id) }))
                  }
                  className="font-mono text-[10px] text-bad"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Broadcast a message">
        <div className="grid gap-3 p-4">
          <Field label="Target group">
            <Select
              value={target}
              onChange={setTarget}
              options={db.groups.map((g) => g.name)}
            />
          </Field>
          <Field label="Message">
            <Input
              value={message}
              onChange={setMessage}
              placeholder="U-14 won 78–64 against Cedar BC"
            />
          </Field>
        </div>
        <div className="flex items-center gap-2 border-t border-ink-800 px-4 py-3">
          <Button
            onClick={() => {
              if (!message.trim()) return;
              setSent(`${message} → ${target}`);
              setMessage("");
            }}
          >
            Send to WhatsApp
          </Button>
          {sent ? <Chip tone="good">QUEUED</Chip> : null}
        </div>
        {sent ? (
          <div className="border-t border-ink-800 px-4 py-3 font-mono text-[10px] text-ink-400">
            Last queued: {sent}
          </div>
        ) : null}
      </Panel>

      <Modal
        open={open}
        title="New WhatsApp group"
        onClose={() => setOpen(false)}
        onSubmit={() => {
          if (!form.name.trim()) return;
          update((d) => ({
            ...d,
            groups: [...d.groups, { ...form, id: `g-${Date.now().toString(36)}` }],
          }));
          setOpen(false);
        }}
        submitLabel="Create group"
      >
        <div className="grid gap-3 p-4">
          <Field label="Group name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Scope" hint="which teams or people it reaches">
            <Input value={form.scope} onChange={(v) => setForm({ ...form, scope: v })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
