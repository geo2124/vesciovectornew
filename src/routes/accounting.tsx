import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  EmptyState,
  Field,
  FilterSelect,
  Input,
  Modal,
  Panel,
  Row,
  RowActions,
  Search,
  Select,
  Stat,
  Table,
  Td,
  Th,
  money,
} from "@/components/kit";
import { downloadCsv, exportPdf } from "@/lib/report";
import { useDB } from "@/lib/data-store";
import type { LedgerEntry } from "@/lib/data-store";

export const Route = createFileRoute("/accounting")({
  head: () => ({
    meta: [
      { title: "Accounting — Vescio Vector" },
      {
        name: "description",
        content:
          "Academy ledger: fee collections, coach payroll, court rental, merchandise costs and outstanding balances.",
      },
      { property: "og:title", content: "Accounting — Vescio Vector" },
      {
        property: "og:description",
        content: "Revenue, expenses and collections for the whole academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingPage,
});

const accounts = [
  "Monthly fees",
  "Coach payroll",
  "Merchandise",
  "Court rental",
  "Camp income",
  "Utilities",
  "Other",
];

const blank: Omit<LedgerEntry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  account: "Monthly fees",
  entry: "",
  type: "Revenue",
  amount: 0,
  status: "Collected",
};

function AccountingPage() {
  const { db, update } = useDB();
  const ledger = db.ledger;

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [account, setAccount] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [form, setForm] = useState<Omit<LedgerEntry, "id">>(blank);

  const filtered = ledger.filter(
    (l) =>
      (!q.trim() || [l.entry, l.account].join(" ").toLowerCase().includes(q.toLowerCase())) &&
      (!type || l.type === type) &&
      (!account || l.account === account),
  );

  const revenue = ledger.filter((l) => l.amount > 0).reduce((a, l) => a + l.amount, 0);
  const expense = ledger.filter((l) => l.amount < 0).reduce((a, l) => a + Math.abs(l.amount), 0);
  const outstandingPlayers = db.players.reduce((a, p) => a + p.balance, 0);
  const outstandingCoaches = db.coaches.reduce((a, c) => a + c.outstanding, 0);

  function submit() {
    if (!form.entry.trim()) return;
    const signed = form.type === "Expense" ? -Math.abs(form.amount) : Math.abs(form.amount);
    const payload = { ...form, amount: signed };
    update((d) =>
      editing
        ? { ...d, ledger: d.ledger.map((l) => (l.id === editing.id ? { ...l, ...payload } : l)) }
        : { ...d, ledger: [{ ...payload, id: `l-${Date.now().toString(36)}` }, ...d.ledger] },
    );
    setOpen(false);
  }

  const reportColumns = ["Date", "Account", "Entry", "Type", "Amount", "Status"];
  const reportRows = () =>
    filtered.map((l) => [l.date, l.account, l.entry, l.type, money(l.amount), l.status]);

  function exportCsv() {
    downloadCsv("vescio-vector-ledger", reportColumns, reportRows());
  }

  function exportPdfReport() {
    exportPdf({
      title: "Financial report",
      subtitle: `${type === "All" ? "All types" : type} · ${account === "All" ? "All accounts" : account}`,
      academy: db.academy.name,
      logo: db.academy.logo,
      columns: reportColumns,
      rows: reportRows(),
      summary: [
        { label: "Revenue", value: money(revenue) },
        { label: "Expenses", value: money(expense) },
        { label: "Net", value: money(revenue - expense) },
        { label: "Outstanding", value: money(outstandingPlayers + outstandingCoaches) },
      ],
    });
  }

  return (
    <AppShell crumb="CONTROL / ACCOUNTING" title="Accounting">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue" value={money(revenue)} note="all recorded income" accent />
        <Stat label="Expenses" value={money(expense)} note="payroll, stock, rental" />
        <Stat label="Net" value={money(revenue - expense)} accent />
        <Stat
          label="Outstanding"
          value={money(outstandingPlayers + outstandingCoaches)}
          note={`${money(outstandingPlayers)} in · ${money(outstandingCoaches)} out`}
        />
      </div>

      <Panel
        className="mt-4"
        title="Ledger"
        meta="Every revenue and expense line"
        action={
          <>
            <FilterSelect
              label="Type"
              value={type}
              onChange={setType}
              options={["Revenue", "Expense"]}
            />
            <FilterSelect
              label="Account"
              value={account}
              onChange={setAccount}
              options={accounts}
            />
            <Button variant="ghost" onClick={exportCsv}>
              Export CSV
            </Button>
            <Button variant="ghost" onClick={exportPdfReport}>
              Export PDF
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setForm(blank);
                setOpen(true);
              }}
            >
              + New entry
            </Button>
          </>
        }
      >
        <div className="border-b border-ink-800 px-4 py-3">
          <Search value={q} onChange={setQ} placeholder="Search ledger entries…" />
        </div>
        <Table
          head={
            <>
              <Th>DATE</Th>
              <Th>ENTRY</Th>
              <Th hide>ACCOUNT</Th>
              <Th hide>STATUS</Th>
              <Th>
                <span className="block text-right">AMOUNT</span>
              </Th>
            </>
          }
          footer={`SHOWING ${filtered.length} OF ${ledger.length}`}
        >
          {filtered.length === 0 ? (
            <EmptyState>No ledger entries match these filters.</EmptyState>
          ) : (
            filtered.map((l) => (
              <Row key={l.id}>
                <Td>
                  <span className="font-mono text-xs text-ink-300">{l.date}</span>
                </Td>
                <Td strong>{l.entry}</Td>
                <Td hide>
                  <Chip>{l.account}</Chip>
                </Td>
                <Td hide>
                  <Chip tone={l.status === "Pending" ? "warn" : "good"}>
                    {l.status.toUpperCase()}
                  </Chip>
                </Td>
                <Td right>
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`font-mono text-xs ${
                        l.amount < 0 ? "text-bad" : "text-court-400"
                      }`}
                    >
                      {money(l.amount)}
                    </span>
                    <RowActions
                      onEdit={() => {
                        setEditing(l);
                        const { id: _id, ...rest } = l;
                        setForm({ ...rest, amount: Math.abs(rest.amount) });
                        setOpen(true);
                      }}
                      onDelete={() => {
                        if (!window.confirm("Delete this ledger entry?")) return;
                        update((d) => ({ ...d, ledger: d.ledger.filter((x) => x.id !== l.id) }));
                      }}
                    />
                  </div>
                </Td>
              </Row>
            ))
          )}
        </Table>
      </Panel>

      <Modal
        open={open}
        title={editing ? "Edit ledger entry" : "New ledger entry"}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Add entry"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </Field>
          <Field label="Account">
            <Select
              value={form.account}
              onChange={(v) => setForm({ ...form, account: v })}
              options={accounts}
            />
          </Field>
          <Field label="Description">
            <Input value={form.entry} onChange={(v) => setForm({ ...form, entry: v })} />
          </Field>
          <Field label="Type">
            <Select
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v as LedgerEntry["type"] })}
              options={["Revenue", "Expense"]}
            />
          </Field>
          <Field label="Amount" hint="USD, positive number">
            <Input
              type="number"
              value={String(form.amount)}
              onChange={(v) => setForm({ ...form, amount: Number(v) || 0 })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as LedgerEntry["status"] })}
              options={["Collected", "Paid", "Pending"]}
            />
          </Field>
        </div>
      </Modal>
    </AppShell>
  );
}
