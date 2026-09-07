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
  money,
} from "@/components/kit";
import { orders, stock } from "@/lib/mock-data";

export const Route = createFileRoute("/merchandise")({
  head: () => ({
    meta: [
      { title: "Merchandise — Vescio Vector" },
      {
        name: "description",
        content:
          "Academy store and inventory: suppliers, stock levels, player orders, jersey numbering and payments.",
      },
      { property: "og:title", content: "Merchandise — Vescio Vector" },
      { property: "og:description", content: "Run the academy store, stock and player orders." },
    ],
  }),
  component: MerchPage,
});

const tabs = ["Inventory", "Orders"] as const;

function MerchPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Inventory");
  const value = stock.reduce((a, s) => a + s.stock * s.price, 0);
  const openBalance = orders.reduce((a, o) => a + (o.total - o.paid), 0);

  return (
    <AppShell crumb="OPS / MERCHANDISE" title="Merchandise">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Stock value" value={money(value)} note="6 SKUs · 3 suppliers" />
        <Stat label="Low stock" value="2" note="below reorder point" accent />
        <Stat label="Open orders" value="2" note="awaiting delivery" />
        <Stat label="Unpaid balance" value={money(openBalance)} note="partial payments" accent />
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
        <Filters items={["Supplier", "Category", "Size"]} />
        <div className="ml-auto">
          <Button>+ New purchase</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        {tab === "Inventory" ? (
          <Panel title="Inventory" meta="Purchases feed stock, orders draw it down">
            <div className="border-b border-ink-800 px-4 py-3">
              <SearchField placeholder="Search items or suppliers…" />
            </div>
            <Table
              head={
                <>
                  <Th>ITEM</Th>
                  <Th hide>SUPPLIER</Th>
                  <Th>VARIANT</Th>
                  <Th hide>UNIT</Th>
                  <Th>
                    <span className="block text-right">STOCK</span>
                  </Th>
                </>
              }
              footer={`SHOWING ${stock.length} SKUs`}
            >
              {stock.map((s) => (
                <Row key={s.id}>
                  <Td strong>{s.item}</Td>
                  <Td hide>{s.supplier}</Td>
                  <Td>
                    <span className="font-mono text-xs">{s.variant}</span>
                  </Td>
                  <Td hide>
                    <span className="font-mono text-xs">${s.price}</span>
                  </Td>
                  <Td right>
                    {s.stock <= s.reorder ? (
                      <Chip tone="warn">{s.stock} LOW</Chip>
                    ) : (
                      <span className="font-mono text-xs text-ink-200">{s.stock}</span>
                    )}
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>
        ) : (
          <Panel title="Player orders" meta="Print names & numbers, track payment and delivery">
            <div className="border-b border-ink-800 px-4 py-3">
              <SearchField placeholder="Search by player name or phone…" />
            </div>
            <Table
              head={
                <>
                  <Th>PLAYER</Th>
                  <Th hide>ITEMS</Th>
                  <Th>NUMBER</Th>
                  <Th>PAID</Th>
                  <Th>
                    <span className="block text-right">DELIVERY</span>
                  </Th>
                </>
              }
              footer={`SHOWING ${orders.length} ORDERS`}
            >
              {orders.map((o) => (
                <Row key={o.id}>
                  <Td strong>{o.player}</Td>
                  <Td hide>{o.items}</Td>
                  <Td>
                    {o.number ? <Chip tone="accent">#{o.number}</Chip> : <span>—</span>}
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">
                      {money(o.paid)} / {money(o.total)}
                    </span>
                  </Td>
                  <Td right>
                    <Chip tone={o.delivered ? "good" : "warn"}>
                      {o.delivered ? "DELIVERED" : "PENDING"}
                    </Chip>
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>
        )}

        <div className="space-y-4">
          <Panel title="New order">
            <FieldGrid
              fields={[
                { label: "Player", hint: "search name or phone" },
                { label: "Item" },
                { label: "Size / colour" },
                { label: "Quantity" },
                { label: "Print name" },
                { label: "Print number" },
                { label: "Discount / coupon" },
                { label: "Payment", hint: "full or partial" },
              ]}
            />
            <div className="border-t border-ink-800 px-4 py-3">
              <div className="flex items-center gap-2 rounded bg-warn/10 px-3 py-2 ring-1 ring-warn/30">
                <Chip tone="warn">CONFLICT</Chip>
                <span className="text-xs text-ink-200">
                  #7 already used by Marc Gebara — override allowed
                </span>
              </div>
            </div>
            <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
              <Button>Create order</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </Panel>

          <Panel title="Suppliers">
            <div className="space-y-2 p-4 text-sm">
              {["Spalding LB · 2 SKUs", "Molten Levant · 2 SKUs", "Pro Kit · 2 SKUs"].map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-ink-200">{s}</span>
                  <span className="font-mono text-[10px] text-court-400">VIEW ›</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
