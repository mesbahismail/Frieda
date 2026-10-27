import {
  ArrowRightLeft,
  ChartPie,
  CircleDollarSign,
  CreditCard,
  FileText,
  Info,
  LayoutGrid,
  Settings,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon; keywords?: string }

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutGrid, keywords: "home overview balance" },
  { label: "Wallet", href: "/wallet", icon: Wallet, keywords: "balance add money send" },
  { label: "My cards", href: "/cards", icon: CreditCard, keywords: "debit credit card freeze" },
  { label: "Transactions", href: "/transactions", icon: ArrowRightLeft, keywords: "history payments report" },
  { label: "Analytics", href: "/analytics", icon: ChartPie, keywords: "income spending goals savings" },
  { label: "Documents", href: "/documents", icon: FileText, keywords: "payslip invoice files upload" },
  { label: "Budget", href: "/budget", icon: CircleDollarSign, keywords: "limit spending categories" },
  { label: "Recipients", href: "/recipients", icon: Users, keywords: "contacts people favorites" },
]

export const secondaryNav: NavItem[] = [
  { label: "Rewards", href: "/rewards", icon: Trophy, keywords: "points redeem awards" },
  { label: "Help center", href: "/help", icon: Info, keywords: "support tickets faq" },
  { label: "Settings", href: "/settings", icon: Settings, keywords: "profile preferences security" },
]

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
