"use client"

import * as React from "react"
import { CreditCard, Gift, Pencil, ShoppingBasket, ShoppingCart, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { budgetCategories, budgetHistory, monthlyBudget } from "@/registry/frieda/lib/data"
import { money } from "@/registry/frieda/lib/format"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { HistoryBars, Pie, ProgressBar } from "@/registry/frieda/components/frieda/charts"
import { FriedaDialog } from "@/registry/frieda/components/frieda/dialogs"
import { DateRangeButton, PageHeader, primaryAction, useRange, vary } from "@/registry/frieda/components/frieda/page-header"
import { Money, Panel, Pill, SeeAll } from "@/registry/frieda/components/frieda/panel"
import { TransactionList } from "@/registry/frieda/components/frieda/transactions"

const categoryIcons: Record<string, LucideIcon> = {
  "Bills & payments": CreditCard,
  "Food & Groceries": ShoppingBasket,
  Shopping: ShoppingCart,
  Others: Gift,
}

/** Clockwise order of the pie in the design (legend keeps its own order). */
const pieOrder = ["Others", "Shopping", "Food & Groceries", "Bills & payments"]

const legend = [
  { label: "Safe", color: "var(--teal)" },
  { label: "Alarming", color: "var(--sun)" },
  { label: "Over budget", color: "var(--rose)" },
]

function EditBudgetDialog({ open, onOpenChange, spent }: { open: boolean; onOpenChange: (open: boolean) => void; spent: number }) {
  const limit = useFrieda((s) => s.budgetLimit)
  const [value, setValue] = React.useState(String(limit))
  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setValue(String(limit))
  }
  const next = Number(value)
  const valid = next >= 100 && next <= 1_000_000

  return (
    <FriedaDialog open={open} onOpenChange={onOpenChange} title="Edit budget" description="Set how much you plan to spend each month.">
      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          actions.setBudgetLimit(next)
          toast.success("Budget updated", {
            description: next < spent ? `You’re already ${money(spent - next)} over this month.` : `${money(next - spent)} left this month.`,
          })
          onOpenChange(false)
        }}
      >
        <label className="block">
          <span className="mb-2 block text-[13px] text-subtle">Monthly budget</span>
          <div className="flex h-16 items-center rounded-[14px] bg-[#1b1b1b] px-4 ring-teal/60 focus-within:ring-2">
            <span className="text-[30px] text-[#8a8a8a]">$</span>
            <input
              autoFocus
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
              aria-label="Monthly budget in dollars"
              className="ml-1 w-full bg-transparent text-[30px] tabular-nums outline-none"
            />
          </div>
        </label>
        <div className="flex gap-2">
          {[15000, 20000, 25000, 30000].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue(String(p))}
              className={cn(
                "h-9 flex-1 rounded-[10px] border text-[14px] tabular-nums transition-colors",
                next === p ? "border-teal bg-teal/10 text-teal" : "border-white/10 text-[#d6d6d6] hover:bg-white/5"
              )}
            >
              ${p / 1000}k
            </button>
          ))}
        </div>
        <ProgressBar value={spent} max={valid ? next : limit} className="h-10 rounded-[10px]" />
        <p className="text-[13px] text-subtle">
          {valid ? `You’ve spent ${money(spent)} so far — ${Math.round((spent / next) * 100)}% of this budget.` : "Enter an amount between $100 and $1,000,000."}
        </p>
        <button type="submit" disabled={!valid} className={cn(primaryAction, "h-12 w-full text-[16px]")}>
          Save budget
        </button>
      </form>
    </FriedaDialog>
  )
}

export default function BudgetPage() {
  const [range, setRange] = useRange("month")
  const [editing, setEditing] = React.useState(false)
  const [active, setActive] = React.useState<number | null>(null)
  const limit = useFrieda((s) => s.budgetLimit)
  const transactions = useFrieda((s) => s.transactions)

  const spent = vary([monthlyBudget.spent], range, "month")[0]
  const values = vary(budgetCategories.map((c) => c.value), range, "month")
  const categories = budgetCategories.map((c, i) => ({ ...c, value: values[i] }))
  const pie = [...categories].sort((a, b) => pieOrder.indexOf(a.label) - pieOrder.indexOf(b.label))
  const activeLabel = active !== null ? pie[active].label : null

  return (
    <>
      <PageHeader
        title="Budget"
        actions={
          <>
            <DateRangeButton value={range} onChange={setRange} />
            <button type="button" className={primaryAction} onClick={() => setEditing(true)}>
              <Pencil /> Edit budget
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 gap-6 lg:grid-rows-[auto_minmax(0,1fr)]">
          <Panel title="Budget this month">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <Money value={spent} className="text-[34px] leading-none sm:text-[38px]" />
                <span className="text-[18px] text-[#9a9a9a]">/${limit.toLocaleString("de-DE")}</span>
              </div>
              {spent > limit ? (
                <Pill className="bg-[#5a1424] text-[#ff6b81]">{money(spent - limit)} Over</Pill>
              ) : (
                <Pill>{money(limit - spent)} Left</Pill>
              )}
            </div>
            <ProgressBar value={spent} max={limit} className="mt-6" />
          </Panel>

          <Panel title="Latest transactions" action={<SeeAll href="/transactions" />} className="lg:h-[480px]" bodyClassName="-mr-3">
            <TransactionList items={transactions} className="frieda-scroll min-h-0 flex-1 overflow-y-auto pr-3" />
          </Panel>
        </div>

        <div className="grid min-w-0 gap-6">
          <Panel title="Spending">
            <div className="flex flex-1 flex-col items-center gap-8 sm:flex-row sm:gap-[30px]">
              <Pie segments={pie} active={active} onHover={setActive} className="max-w-[244px] shrink-0" />
              <ul className="grid w-full gap-[22px] sm:w-auto">
                {categories.map((c) => {
                  const Icon = categoryIcons[c.label] ?? Gift
                  const index = pie.findIndex((p) => p.label === c.label)
                  return (
                    <li
                      key={c.label}
                      onMouseEnter={() => setActive(index)}
                      onMouseLeave={() => setActive(null)}
                      className={cn("flex items-center gap-4 transition-opacity", activeLabel && activeLabel !== c.label && "opacity-45")}
                    >
                      <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] text-[#1a1a1a]" style={{ background: c.color }}>
                        <Icon className="size-[19px]" strokeWidth={1.9} />
                      </span>
                      <div>
                        <div className="text-[22px] leading-tight tabular-nums">{money(c.value)}</div>
                        <div className="text-[14px] text-[#bdbdbd]">{c.label}</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Panel>

          <Panel title="Budget history" bodyClassName="min-h-[260px]">
            <HistoryBars data={budgetHistory} />
            <div className="mt-6 flex flex-wrap justify-around gap-3 text-[14px]">
              {legend.map((l) => (
                <span key={l.label} className="flex items-center gap-2" style={{ color: l.color }}>
                  <span className="size-[7px] rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <EditBudgetDialog open={editing} onOpenChange={setEditing} spent={spent} />
    </>
  )
}
