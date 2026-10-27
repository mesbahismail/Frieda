// Mock data for the Frieda template. Replace these with your API calls.

/** The template's "today". Every relative label ("Today", date ranges) is based on it. */
export const TODAY = new Date(2024, 10, 2)

export const user = {
  firstName: "Ismail",
  displayName: "Frieda",
  fullName: "Frieda Wirtz",
  email: "frieda@frieda.app",
  avatar: "frieda",
}

export function avatarSrc(id: string) {
  return `/frieda/avatars/${id}.svg`
}

// ─── People ──────────────────────────────────────────────────────────────────

export type Person = {
  id: string
  name: string
  addedAt: string
  favorite?: boolean
  /** Avatar backdrop. Defaults to Frieda teal. */
  tone?: "teal" | "purple"
}

export const people: Person[] = [
  { id: "ann-matic", name: "Ann Matic", addedAt: "2023-02-14" },
  { id: "ahmed-halici", name: "Ahmed Halici", addedAt: "2022-09-03", favorite: true },
  { id: "arnold-barzan", name: "Arnold Barzan", addedAt: "2023-06-21" },
  { id: "brandon-philips", name: "Brandon Philips", addedAt: "2023-11-03" },
  { id: "bella-samaan", name: "Bella Samaan", addedAt: "2024-01-09" },
  { id: "carlos", name: "Carlos Mendes", addedAt: "2023-04-18" },
  { id: "chaimae-mahfoud", name: "Chaimae Mahfoud", addedAt: "2023-08-27" },
  { id: "chad-asmeer", name: "Chad Asmeer", addedAt: "2022-12-30", favorite: true },
  { id: "chris-bumford", name: "Chris Bumford", addedAt: "2024-03-02" },
  { id: "dana", name: "Dana Kowalski", addedAt: "2023-05-11" },
  { id: "danny", name: "Danny Okafor", addedAt: "2022-10-08" },
  { id: "david-osei", name: "David Osei", addedAt: "2024-02-19" },
  { id: "diana-ruiz", name: "Diana Ruiz", addedAt: "2023-07-07" },
  { id: "elias-karam", name: "Elias Karam", addedAt: "2023-09-15" },
  { id: "eva-lindt", name: "Eva Lindt", addedAt: "2024-04-22" },
  { id: "farah-nasser", name: "Farah Nasser", addedAt: "2023-01-28" },
  { id: "felix-wong", name: "Felix Wong", addedAt: "2022-11-12" },
  { id: "hafsa", name: "Hafsa Idrissi", addedAt: "2023-03-05", favorite: true },
  { id: "hana-sato", name: "Hana Sato", addedAt: "2024-05-30" },
  { id: "imane", name: "Imane Berrada", addedAt: "2022-08-16" },
  { id: "karim-bennani", name: "Karim Bennani", addedAt: "2023-10-01" },
  { id: "lara-voss", name: "Lara Voss", addedAt: "2024-06-12" },
  { id: "mona-adel", name: "Mona Adel", addedAt: "2023-12-24" },
  { id: "omar-faris", name: "Omar Faris", addedAt: "2022-07-19" },
  { id: "sarah", name: "Sarah Lindqvist", addedAt: "2023-02-02" },
  { id: "sofia-marin", name: "Sofia Marin", addedAt: "2024-07-08" },
  { id: "tom-becker", name: "Tom Becker", addedAt: "2023-05-26" },
  { id: "yara-haddad", name: "Yara Haddad", addedAt: "2024-08-14" },
  { id: "zane-cooper", name: "Zane Cooper", addedAt: "2023-09-29" },
]

export const support = { id: "samantha", name: "Samantha", tone: "purple" as const }

export function personById(id: string) {
  return people.find((p) => p.id === id)
}

export const quickTransfer = ["imane", "carlos", "hafsa", "danny", "sarah", "dana", "ahmed-halici", "bella-samaan"]

// ─── Transactions ────────────────────────────────────────────────────────────

export type TxKind = "received" | "sent" | "bills" | "savings" | "shopping" | "others"

export type Transaction = {
  id: string
  kind: TxKind
  title: string
  amount: number
  date: string
  personId?: string
}

export const transactions: Transaction[] = [
  { id: "t1", kind: "received", title: "Money received", amount: 20000, date: "2024-11-02T09:12", personId: "brandon-philips" },
  { id: "t2", kind: "bills", title: "Bills and groceries", amount: -121.36, date: "2024-11-02T08:40" },
  { id: "t3", kind: "savings", title: "Savings", amount: -500, date: "2024-11-01T18:05" },
  { id: "t4", kind: "sent", title: "Money sent to Ahmed", amount: -250, date: "2024-11-01T12:30", personId: "ahmed-halici" },
  { id: "t5", kind: "received", title: "Money received", amount: 20000, date: "2024-10-28T10:00", personId: "brandon-philips" },
  { id: "t6", kind: "shopping", title: "Online shopping", amount: -86.4, date: "2024-10-27T16:22" },
  { id: "t7", kind: "bills", title: "Bills and groceries", amount: -121.36, date: "2024-10-25T19:41" },
  { id: "t8", kind: "sent", title: "Money sent to Hafsa", amount: -180, date: "2024-10-24T11:15", personId: "hafsa" },
  { id: "t9", kind: "savings", title: "Savings", amount: -500, date: "2024-10-20T08:00" },
  { id: "t10", kind: "received", title: "Money received", amount: 1250, date: "2024-10-18T14:48", personId: "carlos" },
  { id: "t11", kind: "others", title: "Gym membership", amount: -45, date: "2024-10-15T07:30" },
  { id: "t12", kind: "bills", title: "Electricity bill", amount: -94.2, date: "2024-10-12T09:10" },
  { id: "t13", kind: "sent", title: "Money sent to Ahmed", amount: -250, date: "2024-10-08T17:05", personId: "ahmed-halici" },
  { id: "t14", kind: "received", title: "Money received", amount: 20000, date: "2024-09-28T10:00", personId: "brandon-philips" },
  { id: "t15", kind: "shopping", title: "Shopping", amount: -212.9, date: "2024-09-21T15:31" },
  { id: "t16", kind: "received", title: "Money received", amount: 640, date: "2024-09-14T13:02", personId: "ahmed-halici" },
  { id: "t17", kind: "sent", title: "Money sent to Brandon", amount: -250, date: "2024-07-05T12:00", personId: "brandon-philips" },
  { id: "t18", kind: "received", title: "Money received", amount: 20000, date: "2024-07-05T09:00", personId: "brandon-philips" },
  { id: "t19", kind: "sent", title: "Money sent to Brandon", amount: -250, date: "2024-06-21T12:00", personId: "brandon-philips" },
  { id: "t20", kind: "received", title: "Money received", amount: 20000, date: "2024-06-12T09:00", personId: "brandon-philips" },
  { id: "t21", kind: "sent", title: "Money sent to Brandon", amount: -250, date: "2024-06-02T12:00", personId: "brandon-philips" },
  { id: "t22", kind: "sent", title: "Money sent to Brandon", amount: -250, date: "2024-05-17T12:00", personId: "brandon-philips" },
]

// ─── Cards ───────────────────────────────────────────────────────────────────

export type CardColor = "orange" | "green" | "teal" | "blue" | "purple" | "red"

export type BankCard = {
  id: string
  type: "Debit card" | "Credit card"
  holder: string
  balance: number
  number: string
  expiry: string
  color: CardColor
  frozen?: boolean
}

export const cards: BankCard[] = [
  { id: "c1", type: "Debit card", holder: "Frieda Wirtz", balance: 36654, number: "4532 7720 1184 3465", expiry: "7/27", color: "teal" },
  { id: "c2", type: "Debit card", holder: "Frieda Wirtz", balance: 36654, number: "5214 0091 6630 3465", expiry: "7/27", color: "purple" },
  { id: "c3", type: "Credit card", holder: "Frieda Wirtz", balance: 8240, number: "4916 3380 2207 9012", expiry: "2/28", color: "red" },
]

export const cardColors: { id: CardColor; swatch: string }[] = [
  { id: "orange", swatch: "#e89934" },
  { id: "green", swatch: "#39e23d" },
  { id: "teal", swatch: "#15e0cd" },
  { id: "blue", swatch: "#109bf0" },
  { id: "purple", swatch: "#5a42b4" },
  { id: "red", swatch: "#f93a59" },
]

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const balance = { total: 48654, income: 36654, expense: 12000, incomeShare: 75 }

export const activity = [
  { month: "Jan", expense: 3200, income: 4400 },
  { month: "Feb", expense: 4800, income: 6000 },
  { month: "Mar", expense: 4400, income: 4800 },
  { month: "Apr", expense: 4800, income: 6400 },
  { month: "May", expense: 7300, income: 7700 },
  { month: "Jun", expense: 4800, income: 6000 },
  { month: "Jul", expense: 5200, income: 6400 },
]

export const goal = { saved: 16654, target: 20000 }

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const wallet = {
  total: 338654,
  change: 2,
  history: [
    { month: "Jan", value: 196000 },
    { month: "Feb", value: 262000 },
    { month: "Mar", value: 236000 },
    { month: "Apr", value: 194000 },
    { month: "May", value: 255000 },
    { month: "Jun", value: 298000 },
    { month: "Jul", value: 214000 },
    { month: "Aug", value: 280000 },
  ],
  spenders: [
    { label: "Spending", value: 36654, share: 35, color: "var(--pink)" },
    { label: "Savings", value: 36654, share: 31, color: "var(--lilac)" },
    { label: "Recipients", value: 36654, share: 24, color: "var(--sun)" },
    { label: "Others", value: 36654, share: 10, color: "var(--teal-soft)" },
  ],
  earners: [
    { label: "Work", value: 25600, color: "#d7cbff" },
    { label: "Stock", value: 16100, color: "#c3b1ff" },
    { label: "Freelance", value: 13600, color: "#a68cff" },
    { label: "Shop", value: 9300, color: "#8661f5" },
    { label: "Others", value: 6400, color: "#7352e3" },
  ],
  recipients: [
    { personId: "bella-samaan", value: 11023 },
    { personId: "frieda", value: 6464 },
    { personId: "brandon-philips", value: 5664 },
    { personId: "danny", value: 1809 },
    { personId: "ahmed-halici", value: 564 },
  ],
}

export const cardEarners = [
  { label: "Work", value: 6200, color: "#13c8b4" },
  { label: "Stock", value: 8200, color: "#b9f6ef" },
  { label: "Freelance", value: 7300, color: "#8eeee3" },
  { label: "Shop", value: 6900, color: "#5ee6d7" },
  { label: "Rent", value: 4200, color: "#0f9c8c" },
  { label: "Others", value: 6400, color: "#15e0cc" },
]

export const cardBudget = { spent: 5654, limit: 10000 }

// ─── Transactions page ───────────────────────────────────────────────────────

export const spendingBreakdown = [
  { label: "Transfers", value: 1239, color: "var(--pink)" },
  { label: "Savings", value: 690, color: "var(--lilac)" },
  { label: "Income", value: 560, color: "var(--teal-soft)" },
  { label: "Groceries", value: 520, color: "var(--sun)" },
]

export const monthlyBudget = { spent: 16654, limit: 20000 }

// ─── Analytics ───────────────────────────────────────────────────────────────

export const incomeStats = [
  { label: "Saved", value: 19500, change: 3.2, color: "#c4b4fd" },
  { label: "Spent", value: 51800, change: -3.2, color: "#9a7dfd" },
  { label: "Total", value: 72100, change: 2, color: "#7555e4" },
]

export const incomeManagement = [
  { month: "Jun", saved: 33000, spent: 68000, total: 86000 },
  { month: "Jul", saved: 21000, spent: 49000, total: 73000 },
  { month: "Aug", saved: 14000, spent: 49000, total: 79000 },
  { month: "Sep", saved: 33000, spent: 68000, total: 86000 },
  { month: "Oct", saved: 14000, spent: 49000, total: 79000 },
  { month: "Nov", saved: 8000, spent: 43000, total: 61000 },
]

/** Income graph points (index runs Jun → Nov) */
export const incomeGraph = [
  40, 40, 58, 58, 40, 40, 51, 51, 40, 40, 51, 51, 63, 63, 85, 85,
].map((v) => v * 1000)

export const spendingCategories = [
  { label: "Money Transfer", share: 35, change: 3.2, kind: "sent" as TxKind },
  { label: "Bills & groceries", share: 25, change: -3.2, kind: "bills" as TxKind },
  { label: "Savings", share: 20, change: 0, kind: "savings" as TxKind },
  { label: "Others", share: 10, change: 3.2, kind: "shopping" as TxKind },
]

export const goalRings = [
  { id: "done", label: "Done", value: 0.68, color: "#42e7d6", chip: "#095f56", text: "#d9fffa" },
  { id: "pending", label: "Pending", value: 0.6, color: "#ffc334", chip: "#704900", text: "#ffd77a" },
  { id: "cancelled", label: "Cancelled", value: 0.5, color: "#ff5e7b", chip: "#7b1022", text: "#ff8da1" },
] as const

export const savings = {
  value: 23923,
  leftToGoal: 45234,
  change: 3.2,
  spark: [12, 6, 14, 4, 9, 11, 8, 18, 10, 13, 6, 11, 7, 12, 5, 13, 9],
}

/** Savings goals carousel on Analytics. */
export const savingsGoals = [
  { id: "savings", name: "Savings", ...savings },
  {
    id: "vacation",
    name: "Summer vacation",
    value: 4280,
    leftToGoal: 1720,
    change: 5.4,
    spark: [4, 6, 5, 8, 7, 9, 8, 11, 10, 12, 11, 13, 12, 14, 13, 15, 16],
  },
  {
    id: "car",
    name: "New car",
    value: 9650,
    leftToGoal: 15350,
    change: -1.2,
    spark: [10, 12, 9, 13, 11, 8, 12, 10, 14, 9, 11, 13, 8, 10, 12, 9, 11],
  },
]

// ─── Budget ──────────────────────────────────────────────────────────────────

export const budgetCategories = [
  { label: "Bills & payments", value: 11239, color: "#ff6b81", kind: "bills" as TxKind },
  { label: "Food & Groceries", value: 3112, color: "#fdcc53", kind: "others" as TxKind },
  { label: "Shopping", value: 2239, color: "#63e9e0", kind: "shopping" as TxKind },
  { label: "Others", value: 2345, color: "#a990ff", kind: "savings" as TxKind },
]

/** Share of the monthly budget per month: safe, alarming, over. */
export const budgetHistory = [
  { month: "Jan", safe: 0.62, alarming: 0.06, over: 0 },
  { month: "Feb", safe: 0.56, alarming: 0, over: 0 },
  { month: "Mar", safe: 0.62, alarming: 0.12, over: 0 },
  { month: "Apr", safe: 0.62, alarming: 0.16, over: 0.15 },
  { month: "Jun", safe: 0.64, alarming: 0.02, over: 0 },
  { month: "Jul", safe: 0.62, alarming: 0.16, over: 0.15 },
  { month: "Aug", safe: 0.45, alarming: 0, over: 0 },
]

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentItem = {
  id: string
  name: string
  /** "file" is anything the user uploads */
  kind: "payslip" | "agreement" | "invoice" | "file"
  /** Size in MB */
  size: number
  added: string
  modified: string
  sharedWith: string[]
  /** Object URL and type of an uploaded file (images get a real thumbnail) */
  url?: string
  mime?: string
}

const payslipMonths = [
  "February 2024",
  "January 2024",
  "December 2023",
  "November 2023",
  "October 2023",
  "September 2023",
  "August 2023",
  "July 2023",
  "June 2023",
  "May 2023",
  "April 2023",
  "March 2023",
]

export const documents: DocumentItem[] = [
  ...payslipMonths.slice(0, 8).map((m, i) => ({
    id: `d${i + 1}`,
    name: `Payslip ${m}`,
    kind: "payslip" as const,
    size: 1.1,
    added: "2024-11-02",
    modified: "2024-02-05",
    sharedWith: ["carlos", "danny", "sarah", "samantha"],
  })),
  {
    id: "d9",
    name: "Settlement Agreement",
    kind: "agreement",
    size: 1.1,
    added: "2024-11-02",
    modified: "2024-03-12",
    sharedWith: ["ahmed-halici", "imane"],
  },
  ...["2023", "2022", "2021"].map((y, i) => ({
    id: `d${10 + i}`,
    name: `Salary Invoice ${y}`,
    kind: "invoice" as const,
    size: 1.1,
    added: "2024-11-02",
    modified: "2024-02-05",
    sharedWith: ["carlos", "danny", "sarah", "samantha"],
  })),
  ...payslipMonths.slice(8).map((m, i) => ({
    id: `d${13 + i}`,
    name: `Payslip ${m}`,
    kind: "payslip" as const,
    size: 1.0,
    added: "2024-10-14",
    modified: "2023-06-30",
    sharedWith: ["carlos", "sarah"],
  })),
  {
    id: "d17",
    name: "Lease Agreement",
    kind: "agreement",
    size: 2.4,
    added: "2024-09-01",
    modified: "2024-09-01",
    sharedWith: ["hafsa"],
  },
  {
    id: "d18",
    name: "Tax Return 2023",
    kind: "invoice",
    size: 3.2,
    added: "2024-04-10",
    modified: "2024-04-12",
    sharedWith: ["imane", "danny", "carlos"],
  },
]

// ─── Rewards ─────────────────────────────────────────────────────────────────

export type RewardArt = "tablet" | "headphones" | "buds" | "laptop" | "surface" | "speaker" | "phone" | "watch"

export type Reward = { id: string; name: string; points: number; art: RewardArt }

export const rewards = {
  points: 1623,
  nextTier: 2320,
  popular: [
    { id: "r1", name: "Tablet Pro", points: 2500, art: "tablet" },
    { id: "r2", name: "Studio Pro", points: 1500, art: "headphones" },
    { id: "r3", name: "Solo Buds", points: 1000, art: "buds" },
    { id: "r4", name: "Smart Watch", points: 3200, art: "watch" },
  ] as Reward[],
  newest: [
    { id: "r5", name: "Laptop Pro", points: 5000, art: "laptop" },
    { id: "r6", name: "Surface 2-in-1", points: 6000, art: "surface" },
    { id: "r7", name: "Pill Speaker", points: 1000, art: "speaker" },
    { id: "r8", name: "Phone 15 Pro", points: 9000, art: "phone" },
  ] as Reward[],
  orderAgain: ["r3", "r2", "r1", "r8"],
}

// ─── Help center ─────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "feedback" | "closed"

export type Ticket = { id: string; title: string; status: TicketStatus; time: string }

export const tickets: Ticket[] = [
  { id: "k1", title: "I can’t access my account anymore", status: "open", time: "12:34 AM" },
  { id: "k2", title: "My dashboard doesn’t work", status: "open", time: "12:34 AM" },
  { id: "k3", title: "I can’t find my card", status: "open", time: "12:34 AM" },
  { id: "k4", title: "A transfer to Ahmed is stuck", status: "open", time: "12:34 AM" },
  { id: "k5", title: "How do I raise my card limit?", status: "open", time: "12:34 AM" },
  { id: "k6", title: "Love the new budget page", status: "feedback", time: "Yesterday" },
  { id: "k7", title: "Please add a light mode", status: "feedback", time: "Yesterday" },
  { id: "k8", title: "Export transactions to CSV", status: "feedback", time: "Mon" },
  { id: "k9", title: "Rewards are a great idea", status: "feedback", time: "Mon" },
  { id: "k10", title: "Widgets center feedback", status: "feedback", time: "Sun" },
  { id: "k11", title: "Notification sounds", status: "feedback", time: "Sat" },
  { id: "k12", title: "Dark charts are hard to read", status: "feedback", time: "Fri" },
  { id: "k13", title: "AI chat answered in French", status: "feedback", time: "Thu" },
  { id: "k14", title: "Card frozen by mistake", status: "closed", time: "Oct 28" },
  { id: "k15", title: "Payslip upload failed", status: "closed", time: "Oct 24" },
  { id: "k16", title: "Wrong currency on wallet", status: "closed", time: "Oct 20" },
  { id: "k17", title: "Can’t add a recipient", status: "closed", time: "Oct 14" },
  { id: "k18", title: "Budget alert too early", status: "closed", time: "Oct 9" },
  { id: "k19", title: "Duplicate transaction", status: "closed", time: "Oct 2" },
  { id: "k20", title: "Login loop on mobile", status: "closed", time: "Sep 30" },
  { id: "k21", title: "Reward not delivered", status: "closed", time: "Sep 22" },
]

export const ticketStats = { open: 5, total: 16, closed: 8, unresolved: 3 }

export const responseRate = { hours: 2.4, change: 3.2, bars: [0.62, 0.86, 0.8, 0.7, 0.55, 0.5] }

export const faqs = [
  {
    q: "Can I control how I see my store data and stats?",
    a: "Yes. Every widget has a menu where you can change its date range, and the Widgets center lets you pin the cards you care about to your dashboard.",
  },
  {
    q: "How do I change my product details?",
    a: "Open Settings, then Profile. Changes to your name, email or address are saved instantly and synced to every card you hold with Frieda.",
  },
  {
    q: "How can I add a new plugin?",
    a: "Plugins live in Settings → Integrations. Connect your accounting or payroll tool and Frieda will import transactions and payslips automatically.",
  },
  {
    q: "Is dark mode available as well?",
    a: "Frieda is designed dark-first. A light theme is on the roadmap. Vote for it from the Feedback tab so we know you want it.",
  },
  {
    q: "How can I create a new account without deleting my current one?",
    a: "Use the profile menu in the top right and pick “Add account”. You can switch between accounts without signing out.",
  },
]

// ─── Search ──────────────────────────────────────────────────────────────────

export const recentSearches = [
  "Latest transactions from Ahmed",
  "Credit card",
  "Danie Balboa",
  "Send payment offshore",
]
