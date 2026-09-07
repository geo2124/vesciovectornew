import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Chip, Field, Input, Select } from "@/components/kit";
import { ThemeToggle } from "@/lib/theme";
import { emptySetup, useSetup, type SetupState } from "@/lib/tenant-store";
import markAsset from "@/assets/vescio-vector-mark.png.asset.json";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Setup Wizard · Vescio Vector" },
      {
        name: "description",
        content:
          "First-run setup for a Vescio Vector academy workspace: name the academy, pick a sport theme, upload a logo and create administrator accounts.",
      },
      { property: "og:title", content: "Setup Wizard · Vescio Vector" },
      {
        property: "og:description",
        content: "Name your academy, choose a sport theme, upload your logo and add admins.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SetupWizard,
});

const steps = ["Academy", "Theme", "Logo", "Administrators"] as const;

function SetupWizard() {
  const { setup, ready, save } = useSetup();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<SetupState>(emptySetup);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const patch = (p: Partial<SetupState>) => setDraft({ ...draft, ...p });

  if (ready && setup.done) {
    return (
      <Shell>
        <div className="text-center">
          <h1 className="font-display text-2xl tracking-tight text-ink-100">Setup complete</h1>
          <p className="mt-2 text-sm text-ink-300">
            {setup.academyName} is configured. This wizard no longer appears — the URL now opens the
            workspace directly.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link to="/">
              <Button>Open workspace</Button>
            </Link>
            <Button variant="ghost" onClick={() => save({ ...setup, done: false })}>
              Run wizard again
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  function addAdmin() {
    if (!email.trim() && !username.trim()) return;
    patch({
      admins: [
        ...draft.admins,
        { email: email.trim(), username: username.trim(), password: password.trim() },
      ],
    });
    setEmail("");
    setUsername("");
    setPassword("");
  }

  const canAdvance =
    step === 0 ? draft.academyName.trim().length > 1 : step === 3 ? draft.admins.length > 0 : true;

  return (
    <Shell>
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] ${
                i <= step ? "bg-court-500 text-ink-950" : "bg-ink-850 text-ink-400"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-xs sm:inline ${i <= step ? "text-ink-100" : "text-ink-400"}`}
            >
              {s}
            </span>
            {i < steps.length - 1 ? (
              <span className={`h-px flex-1 ${i < step ? "bg-court-500" : "bg-ink-800"}`} />
            ) : null}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <section className="space-y-4">
          <Header title="Name your academy" note="This appears across the workspace and reports." />
          <Field label="Academy name">
            <Input
              value={draft.academyName}
              onChange={(v) => patch({ academyName: v })}
              placeholder="Alba Academy"
            />
          </Field>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <Header title="Choose a theme" note="Terminology, icons and default positions adapt." />
          <div className="grid gap-3 sm:grid-cols-3">
            {(["Basketball", "Football", "Volleyball"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => patch({ sport: s })}
                className={`rounded-lg p-4 text-left ring-1 transition-colors ${
                  draft.sport === s
                    ? "bg-court-500/10 ring-court-500/50"
                    : "bg-ink-850 ring-ink-700 hover:bg-ink-800"
                }`}
              >
                <div className="font-display text-base text-ink-100">{s}</div>
                <div className="mt-1 font-mono text-[10px] text-ink-400">
                  {s === "Basketball"
                    ? "Quarters · PG–C · fouls"
                    : s === "Football"
                      ? "Halves · GK–ST · cards"
                      : "Sets · S/OH/MB · rotations"}
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <Header title="Upload your logo" note="Used in the sidebar, reports and coach portal." />
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-lg bg-ink-850 ring-1 ring-ink-700">
              {draft.logo ? (
                <img src={draft.logo} alt="Academy logo" className="h-20 w-20 object-contain" />
              ) : (
                <span className="label-mono">EMPTY</span>
              )}
            </div>
            <label className="cursor-pointer rounded-md bg-ink-850 px-3.5 py-2 text-sm font-semibold text-ink-200 ring-1 ring-ink-700 hover:bg-ink-800">
              Choose file
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => patch({ logo: String(reader.result) });
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {draft.logo ? (
              <Button variant="ghost" onClick={() => patch({ logo: null })}>
                Remove
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <Header
            title="Super administrators"
            note="Add sign-in emails, or fixed username and password pairs."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Email">
              <Input value={email} onChange={setEmail} placeholder="admin@academy.com" />
            </Field>
            <Field label="Username">
              <Input value={username} onChange={setUsername} placeholder="superadmin" />
            </Field>
            <Field label="Password">
              <Input value={password} onChange={setPassword} type="password" placeholder="••••••" />
            </Field>
          </div>
          <Button variant="ghost" onClick={addAdmin}>
            + Add administrator
          </Button>
          <div className="divide-y divide-ink-800 rounded-lg bg-ink-850 ring-1 ring-ink-700">
            {draft.admins.length === 0 ? (
              <div className="px-4 py-3 font-mono text-[11px] text-ink-400">
                No administrators yet — at least one is required.
              </div>
            ) : (
              draft.admins.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-sm text-ink-100">{a.email || a.username}</span>
                  <Chip tone={a.email ? "accent" : "neutral"}>
                    {a.email ? "EMAIL SIGN-IN" : "USER + PASSWORD"}
                  </Chip>
                  <button
                    type="button"
                    onClick={() => patch({ admins: draft.admins.filter((_, j) => j !== i) })}
                    className="ml-auto font-mono text-[10px] uppercase tracking-widest text-ink-400 hover:text-bad"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}

      <div className="mt-7 flex items-center gap-2">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        <span className="ml-auto">
          {step < steps.length - 1 ? (
            <span className={canAdvance ? "" : "pointer-events-none opacity-40"}>
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            </span>
          ) : (
            <span className={canAdvance ? "" : "pointer-events-none opacity-40"}>
              <Button onClick={() => save({ ...draft, done: true })}>Finish setup</Button>
            </span>
          )}
        </span>
      </div>
    </Shell>
  );
}

function Header({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h2 className="font-display text-xl tracking-tight text-ink-100">{title}</h2>
      <p className="mt-1 text-sm text-ink-300">{note}</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-950 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <img src={markAsset.url} alt="Vescio Vector" className="h-9 w-9 object-contain" />
          <div className="leading-none">
            <div className="font-display text-[15px] tracking-tight text-ink-100">VESCIO</div>
            <div className="mt-1 font-mono text-[9px] tracking-[0.3em] text-court-400">VECTOR</div>
          </div>
          <span className="ml-auto">
            <ThemeToggle />
          </span>
        </div>
        <div className="panel p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
