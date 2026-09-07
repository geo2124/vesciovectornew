import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  EmptyState,
  Field,
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
import { useDB } from "@/lib/data-store";
import type { Order, StockItem } from "@/lib/mock-data";

export const Route = createFileRoute("/merchandise")({
  head: () => ({
    meta: [
      { title: "Merchandise — Vescio Vector" },
      {
        name: "description",
        content:
          "Inventory, suppliers, reorder alerts and player merchandise orders with payment and delivery status.",
      },
      { property: "og:title", content: "Merchandise — Vescio Vector" },
      {
        property: "og:description",
        content: "Track stock, suppliers and player orders end to end.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MerchandisePage,
});

const blankItem: Omit<StockItem, "id"> = {
  item: "",
  supplier: "",
  variant: "",
  stock: 0,
  reorder: 10,
  price: 0,
};

const blankOrder: Omit<Order, "id"> = {
  player: "",
  items: "",
  number: "",
  total: 0,
  paid: 0,
  delivered: false,
};

function MerchandisePage() {
  const { db, update } = useDB();
  const { stock, orders } = db;

  const [q, setQ] = useState("");
  const [itemOpen, setItemOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [itemForm, setItemForm] = useState<Omit<StockItem, "id">>(blankItem);
  const [orderForm, setOrderForm] = useState<Omit<Order, "id">>(blankOrder);

  const filtered = stock.filter(
    (s) =>
      !q.trim() ||
      [s.item, s.supplier, s.variant].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const lowStock = stock.filter((s) => s.stock <= s.reorder);
  const stockValue = stock.reduce((a, s) => a + s.stock * s.price, 0);
  const owed = orders.reduce((a, o) => a + (o.total - o.paid), 0);

  function submitItem() {
    if (!itemForm.item.trim()) return;
    update((d) =>
      editItem
        ? { ...d, stock: d.stock.map((s) => (s.id === editItem.id ? { ...s, ...itemForm } : s)) }
        : { ...d, stock: [{ ...itemForm, id: `m-${Date.now().toString(36)}` }, ...d.stock] },
    );
    setItemOpen(false);
  }

  function submitOrder() {
    if (!orderForm.player.trim()) return;
    update((d) =>
      editOrder
        ? { ...d, orders: d.orders.map((o) => (o.id === editOrder.id ? { ...o, ...orderForm } : o)) }
        : { ...d, orders: [{ ...orderForm, id: `o-${Date.now().toString(36)}` }, ...d.orders] },
    );
    setOrderOpen(false);
  }

  return (
    <AppShell crumb="OPS / MERCHANDISE" title="Merchandise">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Items tracked" value={String(stock.length)} accent />
        <Stat label="Low stock" value={String(lowStock.length)} note="at or below reorder point" />
        <Stat label="Stock value" value={money(stockValue)} />
        <Stat label="Unpaid orders" value={money(owed)} accent note="due from players" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_420px]">
        <Panel
          title="Inventory"
          meta="Suppliers, variants and reorder points"
          action={
            <Button
              onClick={() => {
                setEditItem(null);
                setItemForm(blankItem);
                setItemOpen(true);
              }}
            >
              + New item
            </Button>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <Search value={q} onChange={setQ} placeholder="Search items or suppliers…" />
          </div>
          <Table
            head={
              <>
                <Th>ITEM</Th>
                <Th hide>SUPPLIER</Th>
                <Th>STOCK</Th>
                <Th hide>PRICE</Th>
                <Th>
                  <span className="block text-right">ACTIONS</span>
                </Th>
              </>
            }
            footer={`SHOWING ${filtered.length} OF ${stock.length}`}
          >
            {filtered.length === 0 ? (
              <EmptyState>No inventory matches this search.</EmptyState>
            ) : (
              filtered.map((s) => (
                <Row key={s.id}>
                  <Td strong>
                    <div className="leading-tight">
                      <div>{s.item}</div>
                      <div className="font-mono text-[10px] text-ink-400">{s.variant}</div>
                    </div>
                  </Td>
                  <Td hide>{s.supplier}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{s.stock}</span>
                      {s.stock <= s.reorder ? <Chip tone="warn">REORDER</Chip> : null}
                    </div>
                  </Td>
                  <Td hide>
                    <span className="font-mono text-xs">{money(s.price)}</span>
                  </Td>
                  <Td right>
                    <RowActions
                      extra={
                        <button
                          type="button"
                          onClick={() => {
                            const qty = Number(window.prompt("Add stock quantity", "10") ?? "");
                            if (!qty || Number.isNaN(qty)) return;
                            update((d) => ({
                              ...d,
                              stock: d.stock.map((x) =>
                                x.id === s.id ? { ...x, stock: x.stock + qty } : x,
                              ),
                              ledger: [
                                {
                                  id: `l-${Date.now().toString(36)}`,
                                  date: new Date().toISOString().slice(0, 10),
                                  account: "Merchandise",
                                  entry: `${s.item} restock · ${qty} pcs`,
                                  type: "Expense" as const,
                                  amount: -qty * s.price,
                                  status: "Pending" as const,
                                },
                                ...d.ledger,
                              ],
                            }));
                          }}
                          className="rounded px-2 py-1 font-mono text-[10px] text-court-400 ring-1 ring-ink-700 hover:bg-court-500/10"
                        >
                          RESTOCK
                        </button>
                      }
                      onEdit={() => {
                        setEditItem(s);
                        const { id: _id, ...rest } = s;
                        setItemForm(rest);
                        setItemOpen(true);
                      }}
                      onDelete={() => {
                        if (!window.confirm(`Delete ${s.item}?`)) return;
                        update((d) => ({ ...d, stock: d.stock.filter((x) => x.id !== s.id) }));
                      }}
                    />
                  </Td>
                </Row>
              ))
            )}
          </Table>
        </Panel>

        <Panel
          title="Player orders"
          meta="Payment and delivery"
          action={
            <Button
              onClick={() => {
                setEditOrder(null);
                setOrderForm({ ...blankOrder, player: db.players[0]?.name ?? "" });
                setOrderOpen(true);
              }}
            >
              + New order
            </Button>
          }
        >
          <div className="divide-y divide-ink-800">
            {orders.length === 0 ? (
              <div className="px-4 py-10 text-center font-mono text-[11px] text-ink-400">
                No orders yet.
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink-100">{o.player}</div>
                      <div className="font-mono text-[10px] text-ink-400">
                        {o.items}
                        {o.number ? ` · #${o.number}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-ink-100">{money(o.total)}</div>
                      <div
                        className={`font-mono text-[10px] ${
                          o.paid >= o.total ? "text-good" : "text-warn"
                        }`}
                      >
                        paid {money(o.paid)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip tone={o.delivered ? "good" : "neutral"}>
                      {o.delivered ? "DELIVERED" : "PENDING DELIVERY"}
                    </Chip>
                    {o.paid < o.total ? (
                      <button
                        type="button"
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            orders: d.orders.map((x) =>
                              x.id === o.id ? { ...x, paid: x.total } : x,
                            ),
                            ledger: [
                              {
                                id: `l-${Date.now().toString(36)}`,
                                date: new Date().toISOString().slice(0, 10),
                                account: "Merchandise",
                                entry: `${o.player} · order settled`,
                                type: "Revenue" as const,
                                amount: o.total - o.paid,
                                status: "Collected" as const,
                              },
                              ...d.ledger,
                            ],
                          }))
                        }
                        className="rounded px-2 py-1 font-mono text-[10px] text-court-400 ring-1 ring-ink-700 hover:bg-court-500/10"
                      >
                        MARK PAID
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        update((d) => ({
                          ...d,
                          orders: d.orders.map((x) =>
                            x.id === o.id ? { ...x, delivered: !x.delivered } : x,
                          ),
                        }))
                      }
                      className="rounded px-2 py-1 font-mono text-[10px] text-ink-300 ring-1 ring-ink-700 hover:bg-ink-850"
                    >
                      {o.delivered ? "UNDO DELIVERY" : "MARK DELIVERED"}
                    </button>
                    <RowActions
                      onEdit={() => {
                        setEditOrder(o);
                        const { id: _id, ...rest } = o;
                        setOrderForm({ ...rest, number: rest.number ?? "" });
                        setOrderOpen(true);
                      }}
                      onDelete={() => {
                        if (!window.confirm(`Delete order for ${o.player}?`)) return;
                        update((d) => ({ ...d, orders: d.orders.filter((x) => x.id !== o.id) }));
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Modal
        open={itemOpen}
        title={editItem ? `Edit ${editItem.item}` : "New inventory item"}
        onClose={() => setItemOpen(false)}
        onSubmit={submitItem}
        submitLabel={editItem ? "Save changes" : "Add item"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Item">
            <Input value={itemForm.item} onChange={(v) => setItemForm({ ...itemForm, item: v })} />
          </Field>
          <Field label="Supplier">
            <Input
              value={itemForm.supplier}
              onChange={(v) => setItemForm({ ...itemForm, supplier: v })}
            />
          </Field>
          <Field label="Variant" hint="colour, size range">
            <Input
              value={itemForm.variant}
              onChange={(v) => setItemForm({ ...itemForm, variant: v })}
            />
          </Field>
          <Field label="Unit price" hint="USD">
            <Input
              type="number"
              value={String(itemForm.price)}
              onChange={(v) => setItemForm({ ...itemForm, price: Number(v) || 0 })}
            />
          </Field>
          <Field label="In stock">
            <Input
              type="number"
              value={String(itemForm.stock)}
              onChange={(v) => setItemForm({ ...itemForm, stock: Number(v) || 0 })}
            />
          </Field>
          <Field label="Reorder point">
            <Input
              type="number"
              value={String(itemForm.reorder)}
              onChange={(v) => setItemForm({ ...itemForm, reorder: Number(v) || 0 })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={orderOpen}
        title={editOrder ? `Edit order · ${editOrder.player}` : "New order"}
        onClose={() => setOrderOpen(false)}
        onSubmit={submitOrder}
        submitLabel={editOrder ? "Save changes" : "Create order"}
        wide
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Player">
            <Select
              value={orderForm.player}
              onChange={(v) => setOrderForm({ ...orderForm, player: v })}
              options={db.players.map((p) => p.name)}
            />
          </Field>
          <Field label="Items">
            <Input
              value={orderForm.items}
              onChange={(v) => setOrderForm({ ...orderForm, items: v })}
              placeholder="Jersey home + shorts"
            />
          </Field>
          <Field label="Shirt number">
            <Input
              value={orderForm.number ?? ""}
              onChange={(v) => setOrderForm({ ...orderForm, number: v })}
            />
          </Field>
          <Field label="Total" hint="USD">
            <Input
              type="number"
              value={String(orderForm.total)}
              onChange={(v) => setOrderForm({ ...orderForm, total: Number(v) || 0 })}
            />
          </Field>
          <Field label="Paid">
            <Input
              type="number"
              value={String(orderForm.paid)}
              onChange={(v) => setOrderForm({ ...orderForm, paid: Number(v) || 0 })}
            />
          </Field>
        </div>
      </Modal>
    </AppShell>
  );
}
