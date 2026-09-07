import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
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
import { ledger } from "@/lib/mock-data";

export const Route = createFileRoute("/accounting")({
  head: () => ({
    meta: [
      { title: "Accounting — Vescio Vector" },
      {
        name: "description",
        content:
          "Academy financials: collections, expenses, payroll, branch and team reports, and outstanding balances.",
      },
      { property: "og:title", content: "Accounting — Vescio Vector" },
      { property: "og:description", content: "Track revenue, expenses and reports per branch." },
    ],
  }),
  component: AccountingPage,
});

function AccountingPage() {
  return (
    <AppShell crumb="CONTROL / ACCOUNTING" title="Accounting">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Collected · May" value="$64.2k" note="91% of target" accent />
        <Stat label="Expenses · May" value="$31.4k" note="payroll 58%" />
        <Stat label="Net" value="$32.8k" note="▲ 8% vs April" accent />
        <Stat label="Outstanding" value="$6.4k" note="19 flagged players" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchField placeholder="Search entries, players or suppliers…" />
        <Filters items={["Branch", "Team", "Type", "Date range"]} />
        <div className="ml-auto flex gap-2">
          <Button variant="ghost">Export</Button>
          <Button>+ New entry</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel title="Ledger" meta="Revenue, expenses and validations">
          <Table
            head={
              <>
                <Th>DATE</Th>
                <Th>ENTRY</Th>
                <Th hide>ACCOUNT</Th>
                <Th>AMOUNT</Th>
                <Th>
                  <span className="block text-right">STATUS</span>
                </Th>
              </>
            }
            footer={`SHOWING ${ledger.length} OF 184`}
          >
            {ledger.map((l) => (
              <Row key={l.id}>
                <Td>
                  <span className="font-mono text-xs">{l.date.slice(5)}</span>
                </Td>
                <Td strong>{l.entry}</Td>
                <Td hide>{l.account}</Td>
                <Td>
                  <span
                    className={`font-mono text-xs ${
                      l.amount > 0 ? "text-good" : "text-court-400"
                    }`}
                  >
                    {money(l.amount)}
                  </span>
                </Td>
                <Td right>
                  <Chip tone={l.status === "Pending" ? "warn" : "good"}>
                    {l.status.toUpperCase()}
                  </Chip>
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Reports">
            <div className="divide-y divide-ink-800">
              {[
                "Academy P&L",
                "Branch by branch",
                "Team by team",
                "Coach payroll",
                "Player collections",
                "Merchandise margin",
                "Aged receivables",
              ].map((r) => (
                <div key={r} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-ink-200">{r}</span>
                  <span className="font-mono text-[10px] text-court-400">RUN ›</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Collections by branch">
            <div className="space-y-3 p-4">
              {[
                ["Achrafieh", 94],
                ["Jounieh", 88],
                ["Broumana", 79],
              ].map(([name, pct]) => (
                <div key={name as string}>
                  <div className="flex justify-between font-mono text-[11px] text-ink-200">
                    <span>{name}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div className="h-full bg-court-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
