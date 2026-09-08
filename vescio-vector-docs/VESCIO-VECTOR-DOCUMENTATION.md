# Vescio Vector — System Documentation

![Vescio Vector](./vescio-vector-logo.png)

Basketball (and football / volleyball) academy management SaaS.
This document is a complete audit of the current codebase so another AI or
developer can continue building without changing the look or the architecture.

**Backend decision: Firebase.** The production backend is Firebase
(Authentication + Cloud Firestore + Cloud Storage + Cloud Functions).
Do NOT introduce PostgreSQL, Supabase, or any SQL database.

---

## 1. Product

Vescio Vector is a multi-tenant SaaS. One dev/master workspace is used to build
features; each client (academy) is provisioned as its own tenant with its own
URL, its own empty database cloned from the latest dev structure, a player
limit, a multi-branch flag, and a set of enabled feature flags.

Flow:
1. Super administrator (`geogo3@gmail.com`) signs in with Google.
2. In the Client Console (`/admin`) he creates a client: name, contact person,
   phone, URL slug, package, player limit, multi-branch on/off, feature toggles.
3. The client opens their URL and runs the Setup Wizard (`/setup`): academy
   name, sport theme, logo upload, admin accounts (emails and/or usernames +
   passwords). Once completed, the wizard never shows again.
4. The URL then always lands on the academy workspace.

## 2. Tech stack (must not change)

- React 19 + TypeScript
- TanStack Start v1 / TanStack Router (file-based routes in `src/routes`)
- Vite 7
- Tailwind CSS v4 configured entirely inside `src/styles.css` (no tailwind.config.js)
- shadcn-style primitives in `src/components/ui`
- TanStack Query for server state
- Firebase for backend (see section 7)

## 3. Repository map

```
src/
  routes/                 file-based routes (one file = one URL)
    __root.tsx            html shell, head metadata, providers
    index.tsx             Dashboard
    calendar.tsx          month / week / day scheduling
    players.tsx           player database
    teams.tsx             teams & rosters
    coaches.tsx           coach records
    personnel.tsx         non-coaching staff
    branches.tsx          branches / locations
    sessions.tsx          practices, games, attendance
    merchandise.tsx       stock, orders, suppliers
    accounting.tsx        ledger, revenue/expense, CSV + PDF export
    users.tsx             users & access
    settings.tsx          system settings, appearance, data admin
    technical.tsx         Technical Director portal
    coach.tsx             Coach mobile portal
    admin.tsx             Super-admin client console
    setup.tsx             Tenant setup wizard
  components/
    app-shell.tsx         desktop sidebar + top bar + mobile bottom tab bar
    kit.tsx               shared UI primitives (Card, Table, Field, Input,
                          Select, Toggle, Modal, RowActions, Search,
                          FilterSelect, EmptyState, Badge, StatTile...)
    drawing-board.tsx     canvas court drawing board (basketball/football/volleyball)
    plan-editor.tsx       practice plan builder + read-only PlanView
    ui/                   shadcn primitives
  lib/
    data-store.tsx        the whole working data layer (see section 5)
    mock-data.ts          demo seed records
    tenant-store.ts       clients, packages, feature flags, setup state
    appearance.tsx        runtime theming (independent dark & light skins)
    theme.tsx             dark/light switch, persisted per browser
    report.ts             CSV download + printable PDF export
  styles.css              all design tokens
```

## 4. Design system — "Courtside Kinetic"

- Dark, corporate, operational interface; teal accent taken from the logo mark.
- Fonts: `Archivo Black` (display), `Space Grotesk` (UI), `JetBrains Mono` (numbers).
- Every colour is an oklch CSS variable in `src/styles.css`. **Never hardcode a
  colour utility** (`text-white`, `bg-[#...]`) in a component.
- Dark theme lives on `:root`, light theme on `.light`. The `<html>` class is
  switched by `src/lib/theme.tsx`.
- Users can recolour both skins independently in Settings → Appearance
  (accent / background / surface / text, radius, base font size, texture).
  `src/lib/appearance.tsx` writes those values back onto the CSS variables at
  runtime and `AppearanceSync` (mounted in `__root.tsx`) keeps them applied.
- Responsiveness is a hard requirement: desktop = sidebar + sticky top bar;
  mobile = full mobile-app feel with a sticky bottom tab bar, large touch
  targets, and sheet/modal flows.

## 5. Data layer (current: browser-persisted)

`src/lib/data-store.tsx` exposes one reactive store, persisted to
`localStorage` under `vv-db`, shared by every screen:

```ts
const { db, ready, update, resetDemo, clearData, loadDemo } = useDB();
const { items, add, save, remove } = useCollection("players");
```

`DB` shape: `academy`, `appearance`, `coaches`, `players`, `teams`, `staff`,
`branches`, `sessions`, `stock`, `orders`, `ledger`, `users`, `plans`,
`lists` (editable dropdown option lists), `groups` (WhatsApp broadcast groups),
`attendance` (`sessionId -> playerId[]`).

Helpers: `emptyDB()` (demo data), `blankDB()` (no records, settings kept),
`migrate()` (keeps older saved shapes working), `uid()`, `todayISO()`.

Settings → Data administration exposes **Delete all data** and **Load demo
data** buttons for the dev version.

**Migration rule:** replace only the internals of `data-store.tsx` with
Firestore reads/writes. The hook signatures (`useDB`, `useCollection`) must
stay identical so no screen code changes.

## 6. Feature audit (what already works)

Working end-to-end against the local store, with create / edit / delete forms,
search, filters and validation:

- Dashboard KPIs and activity
- Calendar: month, week and day views
- Players, Teams (age validation), Coaches, Personnel, Branches
- Sessions: practices/games, attendance check-in
- Merchandise: stock, orders
- Accounting: ledger, revenue/expense, CSV export **and** PDF export (branded
  print report via `src/lib/report.ts`)
- Users & Access
- System Settings: academy identity, URL, sport, currency, package, renewal,
  limits, logo, support contacts, payment deadlines, dropdown option lists,
  feature switches, WhatsApp groups + broadcast queue, appearance, data admin
- Technical Portal: game approvals with a game details modal, practice plan
  review (approve / reject / feedback), resources, completed games
- Coach Portal (mobile-app styled): coach + session switching, geo-style
  check-in, attendance, game results, practice plan CRUD and submission
- Practice Plan Builder: ordered sections with name, duration and notes, plus a
  **drawing board per section** (court canvas per sport, offense/defense/pass/
  movement pens, undo, clear, saved as PNG on the section)
- Super-admin Client Console `/admin` and Tenant Setup Wizard `/setup`
- Dark/light switch, persisted per browser

## 7. Backend to build — Firebase

Use Firebase, not SQL.

- **Auth:** Firebase Authentication with the Google provider. Super admin is
  `geogo3@gmail.com` (verify server-side via a custom claim, never client-side).
  Tenant admins may also use email/password accounts created in the wizard.
- **Database:** Cloud Firestore, tenant-scoped:

```
tenants/{tenantId}
  meta: { name, slug, contact, phone, sport, logoUrl, package,
          playersLimit, multiBranch, features[], status, createdAt }
  settings/{docId}          academy settings, appearance, lists
  players/{playerId}
  teams/{teamId}
  coaches/{coachId}
  staff/{staffId}
  branches/{branchId}
  sessions/{sessionId}
  attendance/{sessionId}    { playerIds: [] }
  plans/{planId}            blocks[] with drawing (Storage URL)
  stock/{itemId}
  orders/{orderId}
  ledger/{entryId}
  users/{uid}               { role, branch, active }
platformClients/{clientId}  super-admin console records
```

- **Security rules:** every read/write must check the caller belongs to the
  tenant (custom claim `tenantId`) and has the required role. Roles live in
  `tenants/{tenantId}/users/{uid}.role` — never on a profile the user can edit.
- **Storage:** logos, player photos, documents, and practice-plan drawing PNGs
  under `tenants/{tenantId}/...`. Store the download URL on the record.
- **Cloud Functions:** provisioning a new client (create tenant doc tree from
  the latest dev structure, set custom claims, seed empty collections),
  invitations, WhatsApp/notification dispatch, scheduled payment-deadline jobs,
  audit logging.
- **Provisioning rule:** a new client gets an EMPTY database with the current
  structure — never a copy of demo records.

## 8. Remaining roadmap

1. Firebase Auth + super-admin gate + role-based route guards
2. Firestore migration behind `useDB` / `useCollection`
3. Real tenant provisioning + URL routing per client
4. Attendance engine with soft/hard payment deadlines
5. Game approval workflow: branch manager → technical director → official
6. Merchandise depth: inventory movements, numbering conflicts, discounts
7. Accounting depth: expenses, revenue validation, period reports
8. Granular permissions per role and per feature
9. WhatsApp broadcast groups, notifications, audit log, import/export

## 9. Conventions

- One file per route; parent routes render `<Outlet />`.
- Never edit `src/routeTree.gen.ts`.
- Keep the app fully typed; `bunx tsgo --noEmit` must pass.
- Every page must give the same visual quality as the existing screens; reuse
  `kit.tsx` primitives instead of inventing new ones.
- Every form must actually work (validate, persist, show feedback).

## 10. Local development

```bash
bun install
bun run dev      # http://localhost:8080
bunx tsgo --noEmit
```
