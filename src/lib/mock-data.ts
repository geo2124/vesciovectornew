// Demo data for the Vescio Vector dev version (no backend yet).

export const academy = {
  name: "Alba Academy",
  url: "alba.io/vector",
  plan: "Pro",
  renews: "30 May",
  playersUsed: 248,
  playersLimit: 300,
  branchesUsed: 3,
  branchesLimit: 5,
  storageUsed: 18,
  storageLimit: 50,
};

export const kpis = [
  { label: "Total players", value: "248", note: "▲ 12 this month", accent: true },
  { label: "Active teams", value: "18", note: "6 U-14 · 4 U-16 · 8 senior" },
  { label: "This week", value: "42", note: "practices · 9 games" },
  { label: "Collected · Apr", value: "$64.2k", note: "91% target · $6.4k open", accent: true },
];

export type Coach = {
  id: string;
  name: string;
  phone: string;
  years: number;
  level: "HEAD" | "ASSIST" | "SKILLS";
  gender: "M" | "F";
  wins: number;
  losses: number;
  sessions: number;
  sessionTarget: number;
  outstanding: number;
  branch: string;
  portal: boolean;
  rate: number;
  email: string;
};

export const coaches: Coach[] = [
  { id: "c1", name: "Karim Haddad", phone: "+961 3 402 118", years: 12, level: "HEAD", gender: "M", wins: 11, losses: 3, sessions: 26, sessionTarget: 30, outstanding: 1150, branch: "Achrafieh", portal: true, rate: 45, email: "karim@alba.io" },
  { id: "c2", name: "Nour Sfeir", phone: "+961 71 884 220", years: 8, level: "HEAD", gender: "F", wins: 9, losses: 5, sessions: 24, sessionTarget: 30, outstanding: 0, branch: "Jounieh", portal: true, rate: 40, email: "nour@alba.io" },
  { id: "c3", name: "Rami Choukair", phone: "+961 70 221 905", years: 5, level: "ASSIST", gender: "M", wins: 4, losses: 2, sessions: 18, sessionTarget: 30, outstanding: 780, branch: "Achrafieh", portal: false, rate: 25, email: "rami@alba.io" },
  { id: "c4", name: "Pauline Aoun", phone: "+961 3 557 301", years: 14, level: "HEAD", gender: "F", wins: 13, losses: 1, sessions: 29, sessionTarget: 30, outstanding: 0, branch: "Broumana", portal: true, rate: 50, email: "pauline@alba.io" },
  { id: "c5", name: "Elie Mansour", phone: "+961 76 118 442", years: 3, level: "SKILLS", gender: "M", wins: 2, losses: 4, sessions: 12, sessionTarget: 20, outstanding: 320, branch: "Jounieh", portal: false, rate: 22, email: "elie@alba.io" },
  { id: "c6", name: "Sara Khoury", phone: "+961 3 990 117", years: 7, level: "ASSIST", gender: "F", wins: 6, losses: 6, sessions: 21, sessionTarget: 30, outstanding: 240, branch: "Broumana", portal: false, rate: 28, email: "sara@alba.io" },
];

export type Player = {
  id: string;
  name: string;
  gender: "Boy" | "Girl";
  dob: string;
  category: string;
  team: string;
  branch: string;
  parent: string;
  parentPhone: string;
  school: string;
  fee: number;
  balance: number;
  status: "Active" | "Soft flag" | "Inactive";
};

export const players: Player[] = [
  { id: "p1", name: "Marc Gebara", gender: "Boy", dob: "2011-04-02", category: "U-14", team: "U-14 North", branch: "Achrafieh", parent: "Joe Gebara", parentPhone: "+961 3 111 220", school: "Collège Louise Wegmann", fee: 85, balance: 0, status: "Active" },
  { id: "p2", name: "Lea Abou Jaoude", gender: "Girl", dob: "2010-09-19", category: "U-16", team: "U-16 Girls", branch: "Jounieh", parent: "Rita Abou Jaoude", parentPhone: "+961 70 552 118", school: "Sagesse", fee: 85, balance: 170, status: "Soft flag" },
  { id: "p3", name: "Ziad Nassar", gender: "Boy", dob: "2009-01-08", category: "U-18", team: "U-18 Elite", branch: "Achrafieh", parent: "Sami Nassar", parentPhone: "+961 3 447 902", school: "IC", fee: 95, balance: 0, status: "Active" },
  { id: "p4", name: "Karla Feghali", gender: "Girl", dob: "2012-06-27", category: "U-12", team: "U-12 Mixed", branch: "Broumana", parent: "Nada Feghali", parentPhone: "+961 71 330 811", school: "Brummana High", fee: 70, balance: 280, status: "Inactive" },
  { id: "p5", name: "Jad Rizk", gender: "Boy", dob: "2011-11-14", category: "U-14", team: "U-14 North", branch: "Achrafieh", parent: "Toni Rizk", parentPhone: "+961 3 664 190", school: "Champville", fee: 85, balance: 85, status: "Soft flag" },
  { id: "p6", name: "Maya Chamoun", gender: "Girl", dob: "2010-03-05", category: "U-16", team: "U-16 Girls", branch: "Jounieh", parent: "Hala Chamoun", parentPhone: "+961 76 221 447", school: "Antonine", fee: 85, balance: 0, status: "Active" },
  { id: "p7", name: "Rayan Salame", gender: "Boy", dob: "2013-02-21", category: "U-12", team: "U-12 Mixed", branch: "Broumana", parent: "Georges Salame", parentPhone: "+961 3 887 004", school: "Brummana High", fee: 70, balance: 0, status: "Active" },
  { id: "p8", name: "Tala Zeidan", gender: "Girl", dob: "2009-07-30", category: "U-18", team: "U-18 Girls", branch: "Achrafieh", parent: "Wissam Zeidan", parentPhone: "+961 71 009 553", school: "Jesus & Mary", fee: 95, balance: 95, status: "Soft flag" },
];

export type Team = {
  id: string;
  name: string;
  category: string;
  gender: "Boys" | "Girls" | "Mixed";
  headCoach: string;
  assistant?: string;
  branch: string;
  players: number;
  wins: number;
  losses: number;
};

export const teams: Team[] = [
  { id: "t1", name: "U-14 North", category: "U-14", gender: "Boys", headCoach: "Karim Haddad", assistant: "Rami Choukair", branch: "Achrafieh", players: 14, wins: 11, losses: 3 },
  { id: "t2", name: "U-16 Girls", category: "U-16", gender: "Girls", headCoach: "Nour Sfeir", branch: "Jounieh", players: 12, wins: 9, losses: 5 },
  { id: "t3", name: "U-18 Elite", category: "U-18", gender: "Boys", headCoach: "Pauline Aoun", assistant: "Sara Khoury", branch: "Achrafieh", players: 15, wins: 13, losses: 1 },
  { id: "t4", name: "U-12 Mixed", category: "U-12", gender: "Mixed", headCoach: "Elie Mansour", branch: "Broumana", players: 16, wins: 5, losses: 7 },
  { id: "t5", name: "U-18 Girls", category: "U-18", gender: "Girls", headCoach: "Sara Khoury", branch: "Achrafieh", players: 11, wins: 6, losses: 6 },
];

export type Staff = {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  branch: string;
  dob: string;
  docs: number;
};

export const staff: Staff[] = [
  { id: "s1", name: "Georges Matta", position: "General Manager", phone: "+961 3 220 118", email: "georges@alba.io", branch: "HQ", dob: "1981-05-12", docs: 2 },
  { id: "s2", name: "Hiba Daher", position: "Technical Director", phone: "+961 71 445 220", email: "hiba@alba.io", branch: "HQ", dob: "1986-11-03", docs: 2 },
  { id: "s3", name: "Fadi Aoun", position: "Branch Manager", phone: "+961 3 776 001", email: "fadi@alba.io", branch: "Achrafieh", dob: "1990-02-19", docs: 1 },
  { id: "s4", name: "Rana Saad", position: "Accountant", phone: "+961 70 330 552", email: "rana@alba.io", branch: "HQ", dob: "1993-08-27", docs: 2 },
  { id: "s5", name: "Wissam Tannous", position: "Branch Manager", phone: "+961 76 118 990", email: "wissam@alba.io", branch: "Jounieh", dob: "1988-04-08", docs: 0 },
];

export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  manager: string;
  courts: { name: string; contact: string; phone: string }[];
  teams: number;
  players: number;
};

export const branches: Branch[] = [
  { id: "b1", name: "Achrafieh", city: "Beirut", address: "Rue Sassine, Achrafieh, Beirut", manager: "Fadi Aoun", courts: [{ name: "Court A", contact: "Elias Rahme", phone: "+961 3 118 220" }, { name: "Court B", contact: "Elias Rahme", phone: "+961 3 118 220" }], teams: 8, players: 112 },
  { id: "b2", name: "Jounieh", city: "Keserwan", address: "Maameltein highway, Jounieh", manager: "Wissam Tannous", courts: [{ name: "Main Hall", contact: "Nabil Aad", phone: "+961 71 552 003" }], teams: 6, players: 84 },
  { id: "b3", name: "Broumana", city: "Metn", address: "Main road, Broumana", manager: "Fadi Aoun", courts: [{ name: "Outdoor 1", contact: "Charbel Nehme", phone: "+961 70 441 118" }, { name: "Indoor", contact: "Charbel Nehme", phone: "+961 70 441 118" }], teams: 4, players: 52 },
];

export type SessionItem = {
  id: string;
  kind: "Practice" | "Game" | "Seminar" | "Camp";
  title: string;
  detail: string;
  date: string;
  time: string;
  branch: string;
  coach: string;
  status: "Live" | "Planned" | "Pending approval" | "Pre-approved" | "Official" | "Completed";
};

export const sessions: SessionItem[] = [
  { id: "e1", kind: "Practice", title: "U-16 North · Practice", detail: "Court A · attendance open", date: "2026-05-18", time: "14:00", branch: "Achrafieh", coach: "Karim Haddad", status: "Live" },
  { id: "e2", kind: "Game", title: "U-14 vs Cedar BC", detail: "Broumana · official", date: "2026-05-18", time: "17:30", branch: "Broumana", coach: "Karim Haddad", status: "Official" },
  { id: "e3", kind: "Seminar", title: "Senior · Seminar", detail: "Technical direction · 10 attendees", date: "2026-05-18", time: "19:00", branch: "HQ", coach: "Hiba Daher", status: "Planned" },
  { id: "e4", kind: "Practice", title: "U-12 Mixed · Practice", detail: "Outdoor 1 · recurring weekly", date: "2026-05-19", time: "16:00", branch: "Broumana", coach: "Elie Mansour", status: "Planned" },
  { id: "e5", kind: "Game", title: "U-18 Elite vs Levant", detail: "Away · friendly", date: "2026-05-20", time: "18:00", branch: "Achrafieh", coach: "Pauline Aoun", status: "Pending approval" },
  { id: "e6", kind: "Game", title: "U-16 Girls vs Homenetmen", detail: "Home · official", date: "2026-05-21", time: "17:00", branch: "Jounieh", coach: "Nour Sfeir", status: "Pre-approved" },
  { id: "e7", kind: "Camp", title: "Spring skills camp", detail: "Court B · intake day", date: "2026-05-22", time: "10:00", branch: "Achrafieh", coach: "Sara Khoury", status: "Planned" },
  { id: "e8", kind: "Practice", title: "U-18 Girls · Practice", detail: "Court A", date: "2026-05-22", time: "18:30", branch: "Achrafieh", coach: "Sara Khoury", status: "Planned" },
];

export type StockItem = {
  id: string;
  item: string;
  supplier: string;
  variant: string;
  stock: number;
  reorder: number;
  price: number;
};

export const stock: StockItem[] = [
  { id: "m1", item: "Game jersey · home", supplier: "Spalding LB", variant: "Navy · S–XL", stock: 42, reorder: 20, price: 45 },
  { id: "m2", item: "Game jersey · away", supplier: "Spalding LB", variant: "White · S–XL", stock: 18, reorder: 20, price: 45 },
  { id: "m3", item: "Basketball", supplier: "Molten Levant", variant: "Size 7", stock: 6, reorder: 15, price: 30 },
  { id: "m4", item: "Basketball", supplier: "Molten Levant", variant: "Size 5", stock: 24, reorder: 15, price: 24 },
  { id: "m5", item: "Training bibs", supplier: "Pro Kit", variant: "Orange · one size", stock: 11, reorder: 12, price: 8 },
  { id: "m6", item: "Cones set", supplier: "Pro Kit", variant: "20 pcs", stock: 30, reorder: 10, price: 15 },
];

export type Order = {
  id: string;
  player: string;
  items: string;
  number?: string;
  total: number;
  paid: number;
  delivered: boolean;
};

export const orders: Order[] = [
  { id: "o1", player: "Marc Gebara", items: "Jersey home + shorts", number: "7", total: 75, paid: 75, delivered: true },
  { id: "o2", player: "Lea Abou Jaoude", items: "Jersey away", number: "12", total: 45, paid: 20, delivered: false },
  { id: "o3", player: "Ziad Nassar", items: "Ball size 7", total: 30, paid: 0, delivered: false },
  { id: "o4", player: "Maya Chamoun", items: "Jersey home", number: "9", total: 45, paid: 45, delivered: true },
];

export const ledger = [
  { id: "l1", date: "2026-05-17", account: "Monthly fees", entry: "K. Haddad group · 14 players", type: "Revenue", amount: 1190, status: "Collected" },
  { id: "l2", date: "2026-05-16", account: "Coach payroll", entry: "Rami Choukair · 18 sessions", type: "Expense", amount: -450, status: "Paid" },
  { id: "l3", date: "2026-05-15", account: "Merchandise", entry: "Jersey restock · Spalding LB", type: "Expense", amount: -1800, status: "Pending" },
  { id: "l4", date: "2026-05-14", account: "Court rental", entry: "Broumana Indoor · May", type: "Expense", amount: -900, status: "Paid" },
  { id: "l5", date: "2026-05-13", account: "Camp income", entry: "Spring camp deposits", type: "Revenue", amount: 2400, status: "Collected" },
];

export const rolesMatrix = [
  { role: "Super Admin", users: 2, scope: "All modules", perms: "Read · Add · Edit · Delete" },
  { role: "Technical Director", users: 1, scope: "Technical portal, teams, games", perms: "Read · Add · Edit" },
  { role: "Branch Manager", users: 3, scope: "Own branch", perms: "Read · Add · Edit" },
  { role: "Accountant", users: 1, scope: "Accounting, merchandise", perms: "Read · Add · Edit" },
  { role: "Coach", users: 22, scope: "Coach portal", perms: "Read · Add" },
];
