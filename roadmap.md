# Vescio Vector — Roadmap

## Phase 1 (current) — UI shell + all module screens with demo data
- [x] Design system tokens (Courtside Kinetic)
- [x] App shell: desktop sidebar, sticky top bar, mobile bottom tab bar
- [x] Dashboard, Calendar (month/week/day), Personnel, Coaches, Branches,
      Teams, Players, Sessions, Merchandise, Accounting, Users & Access,
      System Settings
- [x] Technical Portal (/technical)
- [x] Coach Portal (/coach) — mobile-app style

## Phase 2 — backend + auth
- [ ] Enable Cloud (database, storage, auth)
- [ ] Gmail sign-in, super admin geogo3@gmail.com
- [ ] Admin console: create client, assign URL, seed empty DB from dev version,
      player limits, multi-branch flag, feature toggles / packages
- [ ] Tenant Setup Wizard (academy name, sport theme, logo, admin accounts)

## Phase 3 — deep functionality
- [ ] Attendance engine + soft/hard payment deadlines
- [ ] Game approval workflow (branch manager -> technical director -> official)
- [ ] Practice plan builder with drawing board
- [ ] Merchandise inventory, orders, numbering conflicts, discounts
- [ ] Accounting reports, expenses, revenue validation
- [ ] Roles & granular permissions
- [ ] WhatsApp broadcast groups

## Open items
- [x] Logo received — Vescio Vector mark extracted, used in app shell, coach portal and favicon

## Phase 1b — brand + theming (done)
- [x] Palette rebuilt around the Vescio Vector teal mark (all tokens runtime variables)
- [x] Light theme + dark/light switch (persists per browser, available in workspace, coach portal and wizard)
- [x] Super-admin Client Console (/admin): provision client, URL, package, player limit, multi-branch, feature switches
- [x] Tenant Setup Wizard (/setup): academy name, sport theme, logo upload, admin accounts; hides once completed

## Next
- [ ] Gmail sign-in + super-admin gate (geogo3@gmail.com), real per-client databases and deployment
