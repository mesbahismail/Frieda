"use client"

import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, CreditCard, Gift, ShoppingCart, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Transaction, TxKind } from "@/registry/frieda/lib/data"
import { dayLabel, groupBy, longDate, money, monthLabel } from "@/registry/frieda/lib/format"

export const kindMeta: Record<TxKind, { icon: LucideIcon; bg: string; label: string }> = {
  received: { icon: ArrowDownLeft, bg: "#63e9e0", label: "Money received" },
  sent: { icon: ArrowUpRight, bg: "#ff7a8f", label: "Money sent" },
  bills: { icon: CreditCard, bg: "#fdcc53", label: "Bills" },
  savings: { icon: CircleDollarSign, bg: "#a990ff", label: "Savings" },
  shopping: { icon: ShoppingCart, bg: "#63e9e0", label: "Shopping" },
  others: { icon: Gift, bg: "#a990ff", label: "Others" },
}

export function KindIcon({
  kind,
  className,
  icon,
  bg,
  shape = "round",
}: {
  kind?: TxKind
  className?: string
  icon?: LucideIcon
  bg?: string
  shape?: "round" | "square"
}) {
  const meta = kind ? kindMeta[kind] : undefined
  const Icon = icon ?? meta?.icon ?? Gift
  return (
    <span
      className={cn(
        "grid size-[42px] shrink-0 place-items-center text-[#1a1a1a]",
        shape === "round" ? "rounded-full" : "rounded-[12px]",
        className
      )}
      style={{ background: bg ?? meta?.bg }}
    >
      <Icon className="size-[46%]" strokeWidth={2} />
    </span>
  )
}

export function TransactionRow({ tx, className }: { tx: Transaction; className?: string }) {
  const positive = tx.amount > 0
  return (
    <div className={cn("flex items-center gap-4 rounded-xl py-[9px] transition-colors", className)}>
      <KindIcon kind={tx.kind} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-snug text-[#f0f0f0]">{tx.title}</div>
        <div className="mt-0.5 text-[11px] text-[#a3a3a3]">{longDate(tx.date)}</div>
      </div>
      <div className="text-right">
        <div className={cn("text-[15px] leading-snug tabular-nums", positive ? "text-teal" : "text-[#f0f0f0]")}>
          {money(tx.amount, { cents: true, signed: true })}
        </div>
        <div className="mt-0.5 text-[11px] text-[#a3a3a3]">{longDate(tx.date)}</div>
      </div>
    </div>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 pt-3 pb-1 text-[15px] text-[#a3a3a3] first:pt-0">
      <span className="shrink-0">{children}</span>
      <span className="h-px flex-1 bg-white/[0.08]" />
    </div>
  )
}

/** Transactions grouped by day ("Today", "Fri 5 Jul, 2024") or month. */
export function TransactionList({
  items,
  group = "day",
  className,
  empty = "No transactions in this period.",
}: {
  items: Transaction[]
  group?: "day" | "month" | "none"
  className?: string
  empty?: string
}) {
  if (!items.length) return <p className="py-8 text-center text-sm text-subtle">{empty}</p>
  if (group === "none") {
    return (
      <div className={className}>
        {items.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </div>
    )
  }
  const groups = groupBy(items, (tx) => (group === "day" ? dayLabel(tx.date) : monthLabel(tx.date)))
  return (
    <div className={className}>
      {groups.map((g) => (
        <div key={g.label}>
          <GroupLabel>{g.label}</GroupLabel>
          {g.items.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      ))}
    </div>
  )
}
