import { useCallback, useEffect, useState } from "react";

export const FEATURES = [
  { key: "calendar", label: "Calendar & scheduling", note: "Month / week / day planning" },
  { key: "sessions", label: "Sessions & attendance", note: "Practices, games, check-in" },
  { key: "players", label: "Player database", note: "Profiles, fees, documents" },
  { key: "teams", label: "Teams & rosters", note: "Age validation, assignments" },
  { key: "accounting", label: "Accounting", note: "Invoices, ledger, reports" },
  { key: "merchandise", label: "Merchandise & stock", note: "Inventory, orders, suppliers" },
  { key: "technical", label: "Technical portal", note: "Plans, approvals, seminars" },
  { key: "coach", label: "Coach mobile portal", note: "Geo check-in, attendance" },
  { key: "whatsapp", label: "WhatsApp communications", note: "Automated reminders" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export const PACKAGES: Record<string, { players: number; branches: boolean; features: FeatureKey[] }> = {
  Starter: {
    players: 100,
    branches: false,
    features: ["calendar", "sessions", "players", "teams"],
  },
  Pro: {
    players: 300,
    branches: true,
    features: ["calendar", "sessions", "players", "teams", "accounting", "merchandise", "coach"],
  },
  Elite: {
    players: 1000,
    branches: true,
    features: FEATURES.map((f) => f.key),
  },
};

export type Client = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  slug: string;
  pkg: string;
  playersLimit: number;
  multiBranch: boolean;
  features: FeatureKey[];
  status: "Provisioning" | "Setup pending" | "Live";
  createdAt: string;
  sourceVersion: string;
};

const KEY = "vv-clients";

export const DEV_VERSION = "dev-2026.09.07";

const seed: Client[] = [
  {
    id: "c-alba",
    name: "Alba Academy",
    contact: "Rita Khoury",
    phone: "+961 3 402 118",
    slug: "alba",
    pkg: "Pro",
    playersLimit: 300,
    multiBranch: true,
    features: PACKAGES["Pro"]!.features,
    status: "Live",
    createdAt: "2026-02-14",
    sourceVersion: "dev-2026.02.10",
  },
  {
    id: "c-cedar",
    name: "Cedar Basketball Club",
    contact: "Elie Nassar",
    phone: "+961 70 221 905",
    slug: "cedar-bc",
    pkg: "Starter",
    playersLimit: 100,
    multiBranch: false,
    features: PACKAGES["Starter"]!.features,
    status: "Setup pending",
    createdAt: "2026-08-29",
    sourceVersion: "dev-2026.08.21",
  },
];

function read(): Client[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Client[]) : seed;
  } catch {
    return seed;
  }
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setClients(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: Client[]) => {
    setClients(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, []);

  return { clients, ready, persist };
}

export type SetupState = {
  done: boolean;
  academyName: string;
  sport: "Basketball" | "Football" | "Volleyball";
  logo: string | null;
  admins: { email: string; username: string; password: string }[];
};

const SETUP_KEY = "vv-setup";

export const emptySetup: SetupState = {
  done: false,
  academyName: "",
  sport: "Basketball",
  logo: null,
  admins: [],
};

export function useSetup() {
  const [setup, setSetup] = useState<SetupState>(emptySetup);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETUP_KEY);
      if (raw) setSetup(JSON.parse(raw) as SetupState);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = useCallback((next: SetupState) => {
    setSetup(next);
    try {
      window.localStorage.setItem(SETUP_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  return { setup, ready, save };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
