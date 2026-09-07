/**
 * Vescio Vector working data layer.
 * A single reactive store shared by every module, persisted in the browser so
 * every create / edit / delete survives reloads. Swaps to Lovable Cloud later
 * without touching screen code — the hooks below stay the same.
 */
import type { Appearance } from "@/lib/appearance";
import { defaultAppearance } from "@/lib/appearance";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  academy as seedAcademy,
  branches as seedBranches,
  coaches as seedCoaches,
  ledger as seedLedger,
  orders as seedOrders,
  players as seedPlayers,
  rolesMatrix as seedRoles,
  sessions as seedSessions,
  staff as seedStaff,
  stock as seedStock,
  teams as seedTeams,
} from "@/lib/mock-data";
import type {
  Branch,
  Coach,
  Order,
  Player,
  SessionItem,
  Staff,
  StockItem,
  Team,
} from "@/lib/mock-data";

export type LedgerEntry = {
  id: string;
  date: string;
  account: string;
  entry: string;
  type: "Revenue" | "Expense";
  amount: number;
  status: "Collected" | "Paid" | "Pending";
};

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  method: "Google" | "Password";
  active: boolean;
};

export type PlanBlock = {
  id: string;
  name: string;
  minutes: number;
  notes: string;
  /** PNG data URL from the drill drawing board */
  drawing: string | null;
};

export type Plan = {
  id: string;
  title: string;
  category: string;
  coach: string;
  focus: string;
  date: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  blocks: PlanBlock[];
  /** technical director feedback */
  review: string;
};


export type Academy = {
  name: string;
  url: string;
  plan: string;
  renews: string;
  playersLimit: number;
  branchesLimit: number;
  storageUsed: number;
  storageLimit: number;
  sport: "Basketball" | "Football" | "Volleyball";
  currency: string;
  logo: string | null;
  supportPhone: string;
  supportEmail: string;
  softDeadline: number;
  hardDeadline: number;
};

export type { Appearance } from "@/lib/appearance";

export type WhatsAppGroup = { id: string; name: string; scope: string };

export type DB = {
  academy: Academy;
  /** dark/light colour customisation + interface density */
  appearance: Appearance;
  coaches: Coach[];
  players: Player[];
  teams: Team[];
  staff: Staff[];
  branches: Branch[];
  sessions: SessionItem[];
  stock: StockItem[];
  orders: Order[];
  ledger: LedgerEntry[];
  users: UserAccount[];
  plans: Plan[];
  /** editable dropdown option lists used across the system */
  lists: Record<string, string[]>;
  groups: WhatsAppGroup[];
  /** sessionId -> player ids marked present */
  attendance: Record<string, string[]>;
};

const seedUsers: UserAccount[] = [
  { id: "u1", name: "Georges Matta", email: "georges@alba.io", role: "Super Admin", branch: "HQ", method: "Google", active: true },
  { id: "u2", name: "Hiba Daher", email: "hiba@alba.io", role: "Technical Director", branch: "HQ", method: "Google", active: true },
  { id: "u3", name: "Fadi Aoun", email: "fadi@alba.io", role: "Branch Manager", branch: "Achrafieh", method: "Password", active: true },
  { id: "u4", name: "Rana Saad", email: "rana@alba.io", role: "Accountant", branch: "HQ", method: "Password", active: true },
  { id: "u5", name: "Karim Haddad", email: "karim@alba.io", role: "Coach", branch: "Achrafieh", method: "Google", active: true },
];

const block = (name: string, minutes: number, notes = ""): PlanBlock => ({
  id: `b-${name.toLowerCase().replace(/\W+/g, "-")}-${minutes}`,
  name,
  minutes,
  notes,
  drawing: null,
});

const seedPlans: Plan[] = [
  { id: "pl1", title: "U-14 transition offence block", category: "U-14", coach: "Karim Haddad", focus: "Fast break spacing", date: "2026-05-18", status: "Approved", review: "Great spacing progression — keep the 3v2 block.", blocks: [block("Warm-up", 10), block("Live 3v3", 25, "Full court, no dribble past half"), block("Shooting lines", 15), block("Cool down", 10)] },
  { id: "pl2", title: "U-16 girls defensive rotations", category: "U-16", coach: "Nour Sfeir", focus: "Help & recover", date: "2026-05-19", status: "Submitted", review: "", blocks: [block("Warm-up", 12), block("Shell drill", 20, "Close-out and recover"), block("Scrimmage", 20)] },
  { id: "pl3", title: "U-12 fundamentals cycle", category: "U-12", coach: "Elie Mansour", focus: "Ball handling", date: "2026-05-20", status: "Draft", review: "", blocks: [block("Warm-up", 10), block("Two-ball handling", 15)] },
];


export const emptyDB = (): DB => ({
  appearance: defaultAppearance,
  academy: {
    name: seedAcademy.name,
    url: seedAcademy.url,
    plan: seedAcademy.plan,
    renews: seedAcademy.renews,
    playersLimit: seedAcademy.playersLimit,
    branchesLimit: seedAcademy.branchesLimit,
    storageUsed: seedAcademy.storageUsed,
    storageLimit: seedAcademy.storageLimit,
    sport: "Basketball",
    currency: "USD",
    logo: null,
    supportPhone: "+961 3 000 000",
    supportEmail: "help@vesciovector.com",
    softDeadline: 7,
    hardDeadline: 30,
  },
  coaches: seedCoaches,
  players: seedPlayers,
  teams: seedTeams,
  staff: seedStaff,
  branches: seedBranches,
  sessions: seedSessions,
  stock: seedStock,
  orders: seedOrders,
  ledger: seedLedger as LedgerEntry[],
  users: seedUsers,
  plans: seedPlans,
  lists: {
    "Age categories": ["U-10", "U-12", "U-14", "U-16", "U-18", "Senior"],
    "Staff positions": ["General Manager", "Technical Director", "Branch Manager", "Accountant"],
    "Coach levels": ["HEAD", "ASSIST", "SKILLS"],
    "Session types": ["Practice", "Game", "Seminar", "Camp"],
    "Expense accounts": ["Coach payroll", "Court rental", "Merchandise", "Utilities"],
  },
  groups: [
    { id: "g1", name: "Game results · U-14", scope: "U-14 North, U-14 South" },
    { id: "g2", name: "Achrafieh parents", scope: "All Achrafieh teams" },
    { id: "g3", name: "Coaches announcements", scope: "All coaches" },
  ],
  attendance: {},
});

/**
 * Same workspace, but with every operational record removed. Settings,
 * appearance, dropdown lists and the academy identity are kept so the system
 * stays usable — this is what a brand new client starts from.
 */
export const blankDB = (): DB => {
  const base = emptyDB();
  return {
    ...base,
    coaches: [],
    players: [],
    teams: [],
    staff: [],
    branches: [],
    sessions: [],
    stock: [],
    orders: [],
    ledger: [],
    users: [],
    plans: [],
    groups: [],
    attendance: {},
  };
};

const KEY = "vv-db";

/** Keeps browsers that saved an older shape working after new fields ship. */
function migrate(db: DB): DB {
  return {
    ...db,
    plans: (db.plans ?? []).map((p) => ({
      ...p,
      blocks: Array.isArray(p.blocks) ? p.blocks : [],
      review: typeof p.review === "string" ? p.review : "",
    })),
    attendance: db.attendance ?? {},
    appearance: { ...defaultAppearance, ...(db.appearance ?? {}) },
    lists: db.lists ?? emptyDB().lists,
    groups: db.groups ?? [],
  };
}

type Ctx = {
  db: DB;
  ready: boolean;
  update: (fn: (draft: DB) => DB) => void;
  resetDemo: () => void;
};

const DataCtx = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => emptyDB());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setDb(migrate({ ...emptyDB(), ...(JSON.parse(raw) as DB) }));
    } catch {
      /* storage unavailable — stay in memory */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: DB) => {
    setDb(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback(
    (fn: (draft: DB) => DB) => {
      setDb((current) => {
        const next = fn(current);
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const resetDemo = useCallback(() => persist(emptyDB()), [persist]);

  const value = useMemo(() => ({ db, ready, update, resetDemo }), [db, ready, update, resetDemo]);
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useDB() {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useDB must be used inside DataProvider");
  return ctx;
}

type ListKeys = {
  [K in keyof DB]: DB[K] extends { id: string }[] ? K : never;
}[keyof DB];

/** CRUD helpers for any id-keyed collection in the store. */
export function useCollection<K extends ListKeys>(key: K) {
  const { db, update, ready } = useDB();
  const items = db[key] as unknown as ({ id: string } & Record<string, unknown>)[];

  type Item = (DB[K] extends (infer T)[] ? T : never) & { id: string };

  const add = useCallback(
    (item: Omit<Item, "id"> & { id?: string }) => {
      const created = { ...item, id: item.id ?? `${String(key)}-${Date.now().toString(36)}` } as Item;
      update((d) => ({ ...d, [key]: [created, ...(d[key] as unknown as Item[])] }) as DB);
      return created;
    },
    [key, update],
  );

  const save = useCallback(
    (id: string, patch: Partial<Item>) => {
      update(
        (d) =>
          ({
            ...d,
            [key]: (d[key] as unknown as Item[]).map((i) => (i.id === id ? { ...i, ...patch } : i)),
          }) as DB,
      );
    },
    [key, update],
  );

  const remove = useCallback(
    (id: string) => {
      update(
        (d) => ({ ...d, [key]: (d[key] as unknown as Item[]).filter((i) => i.id !== id) }) as DB,
      );
    },
    [key, update],
  );

  return { items: items as unknown as Item[], add, save, remove, ready };
}

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);
