import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  Field,
  Input,
  Panel,
  PageHeader,
  Row,
  Select,
  Stat,
  Table,
  Td,
  Th,
  Toggle,
} from "@/components/kit";
import {
  DEV_VERSION,
  FEATURES,
  PACKAGES,
  slugify,
  useClients,
  type Client,
  type FeatureKey,
} from "@/lib/tenant-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Client Console · Vescio Vector" },
      {
        name: "description",
        content:
          "Super-admin console for Vescio Vector: provision academy clients, assign URLs, set player limits and switch features on or off.",
      },
      { property: "og:title", content: "Client Console · Vescio Vector" },
      {
        property: "og:description",
        content: "Provision academy workspaces, assign URLs and control feature packages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminConsole,
});

const statusTone: Record<Client["status"], "good" | "warn" | "accent"> = {
  Live: "good",
  "Setup pending": "warn",
  Provisioning: "accent",
};

function AdminConsole() {
  const { clients, persist } = useClients();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState("");
  const [pkg, setPkg] = useState("Pro");
  const [limit, setLimit] = useState("300");
  const [multiBranch, setMultiBranch] = useState(true);
  const [features, setFeatures] = useState<FeatureKey[]>(PACKAGES["Pro"]!.features);
  const [flash, setFlash] = useState<string | null>(null);

  const url = `${slug || slugify(name) || "client"}.vesciovector.app`;
  const live = useMemo(() => clients.filter((c) => c.status === "Live").length, [clients]);
  const seats = useMemo(() => clients.reduce((a, c) => a + c.playersLimit, 0), [clients]);

  function applyPackage(next: string) {
    setPkg(next);
    const preset = PACKAGES[next];
    if (!preset) return;
    setLimit(String(preset.players));
    setMultiBranch(preset.branches);
    setFeatures(preset.features);
  }

  function toggleFeature(key: FeatureKey, on: boolean) {
    setFeatures((f) => (on ? [...new Set([...f, key])] : f.filter((k) => k !== key)));
  }

  function createClient() {
    if (!name.trim() || !contact.trim() || !phone.trim()) {
      setFlash("Academy name, contact person and phone number are required.");
      return;
    }
    const client: Client = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      phone: phone.trim(),
      slug: slug || slugify(name),
      pkg,
      playersLimit: Number(limit) || 100,
      multiBranch,
      features,
      status: "Setup pending",
      createdAt: new Date().toISOString().slice(0, 10),
      sourceVersion: DEV_VERSION,
    };
    persist([client, ...clients]);
    setFlash(`${client.name} provisioned on ${client.slug}.vesciovector.app — empty database cloned from ${DEV_VERSION}.`);
    setName("");
    setContact("");
    setPhone("");
    setSlug("");
  }

  return (
    <AppShell crumb="PLATFORM / CLIENTS" title="Client Console">
      <PageHeader
        crumb="Super administrator"
        title="Academy clients"
        action={<Chip tone="accent">SOURCE {DEV_VERSION.toUpperCase()}</Chip>}
      >
        <p className="mt-2 max-w-2xl text-sm text-ink-300">
          Every new client is cloned from the current dev version with an empty database, then
          handed its own URL and setup wizard.
        </p>
      </PageHeader>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Clients" value={String(clients.length)} note="all workspaces" />
        <Stat label="Live" value={String(live)} note="setup completed" accent />
        <Stat label="Licensed seats" value={seats.toLocaleString()} note="player capacity" />
        <Stat label="Dev version" value="2026.09" note={DEV_VERSION} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Workspaces" meta={`${clients.length} provisioned`}>
          <Table
            head={
              <>
                <Th>CLIENT</Th>
                <Th hide>URL</Th>
                <Th hide>PACKAGE</Th>
                <Th>PLAYERS</Th>
                <Th>
                  <span className="block text-right">STATUS</span>
                </Th>
              </>
            }
            footer={`SHOWING ${clients.length} OF ${clients.length}`}
          >
            {clients.map((c) => (
              <Row key={c.id}>
                <Td strong>
                  {c.name}
                  <div className="font-mono text-[10px] text-ink-400">
                    {c.contact} · {c.phone}
                  </div>
                </Td>
                <Td hide>
                  <span className="font-mono text-xs text-court-400">
                    {c.slug}.vesciovector.app
                  </span>
                </Td>
                <Td hide>
                  {c.pkg}
                  <div className="font-mono text-[10px] text-ink-400">
                    {c.multiBranch ? "multi-branch" : "single branch"} · {c.features.length} features
                  </div>
                </Td>
                <Td>
                  <span className="font-mono text-xs">0/{c.playersLimit}</span>
                </Td>
                <Td right>
                  <Chip tone={statusTone[c.status]}>{c.status.toUpperCase()}</Chip>
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="New client"
            meta="Clones the current dev version"
            action={<Button onClick={createClient}>Provision</Button>}
          >
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <Field label="Academy name">
                <Input
                  value={name}
                  onChange={(v) => {
                    setName(v);
                    setSlug(slugify(v));
                  }}
                  placeholder="Cedar Basketball Club"
                />
              </Field>
              <Field label="Contact person">
                <Input value={contact} onChange={setContact} placeholder="Elie Nassar" />
              </Field>
              <Field label="Phone number">
                <Input value={phone} onChange={setPhone} placeholder="+961 70 221 905" />
              </Field>
              <Field label="Deployment URL" hint={url}>
                <Input value={slug} onChange={(v) => setSlug(slugify(v))} placeholder="cedar-bc" />
              </Field>
              <Field label="Package">
                <Select value={pkg} onChange={applyPackage} options={Object.keys(PACKAGES)} />
              </Field>
              <Field label="Player limit">
                <Input value={limit} onChange={setLimit} type="number" />
              </Field>
              <div className="sm:col-span-2">
                <Toggle
                  on={multiBranch}
                  onChange={setMultiBranch}
                  label="Allow multiple branches"
                  note="Unlocks branch management and per-branch reporting"
                />
              </div>
            </div>
            {flash ? (
              <div className="border-t border-ink-800 px-4 py-3 font-mono text-[11px] text-court-400">
                {flash}
              </div>
            ) : null}
          </Panel>

          <Panel title="Feature access" meta={`${features.length} of ${FEATURES.length} unlocked`}>
            <div className="grid gap-2 p-4">
              {FEATURES.map((f) => (
                <Toggle
                  key={f.key}
                  on={features.includes(f.key)}
                  onChange={(v) => toggleFeature(f.key, v)}
                  label={f.label}
                  note={f.note}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
