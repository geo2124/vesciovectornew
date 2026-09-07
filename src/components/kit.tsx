import type { ReactNode } from "react";

export function PageHeader({
  crumb,
  title,
  action,
  children,
}: {
  crumb: string;
  title: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3">
      <div>
        <div className="label-mono">{crumb}</div>
        <h1 className="font-display mt-1 text-2xl tracking-tight text-ink-100">{title}</h1>
        {children}
      </div>
      {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  meta,
  action,
  children,
  className = "",
}: {
  title?: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel overflow-hidden ${className}`}>
      {title ? (
        <header className="flex flex-wrap items-center gap-3 border-b border-ink-800 px-4 py-3">
          <div>
            <h2 className="font-display text-base tracking-tight text-ink-100">{title}</h2>
            {meta ? <div className="label-mono mt-0.5">{meta}</div> : null}
          </div>
          {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="panel tick-diag relative overflow-hidden p-4">
      <div className="label-mono">{label}</div>
      <div className="font-display mt-2 text-3xl leading-none tracking-tight text-ink-100 sm:text-4xl">
        {value}
      </div>
      {note ? (
        <div
          className={`mt-2 font-mono text-[11px] ${accent ? "text-court-400" : "text-ink-300"}`}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base = "rounded-md px-3.5 py-2 text-sm font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-court-500 text-ink-950 hover:bg-court-400"
      : "bg-ink-850 text-ink-200 ring-1 ring-ink-700 hover:bg-ink-800";
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "good" | "warn" | "bad";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-800 text-ink-200",
    accent: "bg-court-500/15 text-court-400",
    good: "bg-good/15 text-good",
    warn: "bg-warn/15 text-warn",
    bad: "bg-bad/20 text-bad",
  };
  return (
    <span className={`rounded px-2 py-0.5 font-mono text-[10px] tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Filters({ items }: { items: string[] }) {
  return (
    <>
      {items.map((f) => (
        <span
          key={f}
          className="label-mono hidden rounded bg-ink-850 px-2.5 py-1.5 ring-1 ring-ink-700 sm:inline-block"
        >
          {f} ▾
        </span>
      ))}
    </>
  );
}

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <input
        className="w-full rounded-md bg-ink-850 py-2 pl-9 pr-3 font-ui text-sm text-ink-100 ring-1 ring-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-court-500/60"
        placeholder={placeholder}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400">
        ⌕
      </span>
    </div>
  );
}

export function Table({
  head,
  children,
  footer,
}: {
  head: ReactNode;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-left font-mono text-[10px] tracking-[0.12em] text-ink-400">
              {head}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800/70">{children}</tbody>
        </table>
      </div>
      {footer ? (
        <div className="label-mono flex items-center justify-between border-t border-ink-800 px-4 py-2.5">
          <span>{footer}</span>
          <span className="flex items-center gap-3">
            <span>‹ PREV</span>
            <span>NEXT ›</span>
          </span>
        </div>
      ) : null}
    </>
  );
}

export function Th({ children, hide }: { children: ReactNode; hide?: boolean }) {
  return (
    <th className={`px-4 py-2.5 font-medium ${hide ? "hidden md:table-cell" : ""}`}>{children}</th>
  );
}

export function Td({
  children,
  hide,
  right,
  strong,
}: {
  children: ReactNode;
  hide?: boolean;
  right?: boolean;
  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${hide ? "hidden md:table-cell" : ""} ${right ? "text-right" : ""} ${
        strong ? "font-medium text-ink-100" : "text-ink-200"
      }`}
    >
      {children}
    </td>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <tr className="cursor-pointer transition-colors hover:bg-ink-850/60">{children}</tr>;
}

export function FieldGrid({ fields }: { fields: { label: string; hint?: string }[] }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.label} className="block">
          <span className="label-mono">{f.label}</span>
          <div className="mt-1.5 rounded-md bg-ink-850 px-3 py-2 text-sm text-ink-400 ring-1 ring-ink-700">
            {f.hint ?? "—"}
          </div>
        </label>
      ))}
    </div>
  );
}

export function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}
