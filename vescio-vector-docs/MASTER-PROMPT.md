# Vescio Vector — Master Prompt

Paste this into Google AI Studio (Gemini) together with
`VESCIO-VECTOR-DOCUMENTATION.md` and `vescio-vector-logo.png`, after importing
the GitHub repository.

---

You are a top-tier product designer and senior full-stack engineer. You are
continuing an existing production project called **Vescio Vector**, a corporate
SaaS for managing basketball (and football / volleyball) academies. The full
source code is in the repository I imported, and the attached
`VESCIO-VECTOR-DOCUMENTATION.md` is an accurate audit of it. The attached PNG is
the official logo.

## Non-negotiable rules

1. **Do not redesign anything.** The existing interface ("Courtside Kinetic":
   dark ink surfaces, teal logo accent, Archivo Black / Space Grotesk /
   JetBrains Mono) is final. New screens must be visually indistinguishable in
   quality and style from the existing ones.
2. **Keep the stack:** React 19 + TypeScript, TanStack Start v1 with
   file-based routes in `src/routes`, Vite 7, Tailwind CSS v4 configured in
   `src/styles.css`. No React Router, no Next.js, no CSS framework swaps.
3. **Colours are tokens only.** Every colour is an oklch CSS variable in
   `src/styles.css`. Never hardcode `text-white`, `bg-black`, or `bg-[#hex]`.
   The dark and light skins are user-recolourable at runtime through
   `src/lib/appearance.tsx` — anything you add must respect that.
4. **The backend is Firebase.** Use Firebase Authentication, Cloud Firestore,
   Cloud Storage and Cloud Functions. **Do not use PostgreSQL, Supabase, MySQL
   or any SQL database.** Do not introduce Prisma or an ORM.
5. **Responsive is a hard requirement.** Desktop: sidebar + sticky top bar.
   Mobile: it must feel like a native mobile app — sticky bottom tab bar, large
   touch targets, sheets and full-screen modals.
6. **Everything must actually work.** Every page, every form, every button:
   real validation, real persistence, real feedback states, empty states, and
   loading states. No placeholder screens, no dead buttons, no `TODO`.
7. Reuse the shared primitives in `src/components/kit.tsx` instead of creating
   parallel components. Never edit `src/routeTree.gen.ts`.
8. TypeScript must compile clean (`bunx tsgo --noEmit`).

## Data layer contract

All screens read and write through `src/lib/data-store.tsx`:

```ts
const { db, ready, update, resetDemo, clearData, loadDemo } = useDB();
const { items, add, save, remove } = useCollection("players");
```

When you move to Firebase, **replace only the internals of that file**. The
hook names, signatures and returned shapes must stay identical so that no
screen code has to change. Keep the "Delete all data" and "Load demo data"
buttons in Settings working for the dev workspace.

## Firebase model to implement

```
tenants/{tenantId}
  meta                      name, slug, contact, phone, sport, logoUrl,
                            package, playersLimit, multiBranch, features[],
                            status, createdAt
  settings/{docId}          academy settings, appearance, dropdown lists
  players/ teams/ coaches/ staff/ branches/ sessions/ plans/
  attendance/{sessionId}    { playerIds: [] }
  stock/ orders/ ledger/
  users/{uid}               { role, branch, active }
platformClients/{clientId}  super-admin console records
```

- Roles live in `tenants/{tenantId}/users/{uid}.role`, never on a
  user-editable profile document.
- Firestore security rules must verify tenant membership (custom claim
  `tenantId`) and role on every read and write.
- Cloud Storage holds logos, player photos, documents and practice-plan drawing
  PNGs under `tenants/{tenantId}/...`.
- Cloud Functions handle client provisioning, custom claims, invitations,
  notification/WhatsApp dispatch, scheduled payment-deadline jobs and audit logs.

## Multi-tenant behaviour

- Super administrator is `geogo3@gmail.com`, signing in with Google; enforce it
  through a custom claim checked server-side, never in client code.
- The dev workspace is viewable without login and is where features are built.
- `/admin` creates a client: name, contact person, phone, URL slug, package
  (Starter / Pro / Elite), player limit, multi-branch on/off, feature toggles.
  Creating a client provisions an **empty** database with the latest structure —
  never a copy of demo records.
- The client's URL first runs the Setup Wizard (`/setup`): academy name, sport
  theme, logo upload, one or more admin accounts (Google emails and/or
  username + password). After completion the wizard never appears again and the
  URL always opens the academy workspace.

## Build order

1. Firebase Auth: Google sign-in, super-admin gate, role-based route guards,
   session persistence, sign-out.
2. Migrate `data-store.tsx` to Firestore behind the unchanged hooks; add
   optimistic updates and offline persistence.
3. Real tenant provisioning through Cloud Functions + per-client URL routing.
4. Attendance engine with soft and hard payment deadlines and automatic locking.
5. Game approval workflow: branch manager → technical director → official.
6. Merchandise depth: inventory movements, numbering conflicts, discounts,
   supplier orders.
7. Accounting depth: expenses, revenue validation, period reports, CSV + PDF.
8. Granular permissions per role and per feature flag.
9. WhatsApp broadcast groups, notifications, audit log, import/export.

Work through these in order. After each item, verify in the browser that every
affected page renders, every form saves, and nothing regressed visually.
