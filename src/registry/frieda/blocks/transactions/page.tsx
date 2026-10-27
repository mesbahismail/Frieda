"use client"

import * as React from "react"
import { Check, Download, ListFilter } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { monthlyBudget, spendingBreakdown, type TxKind } from "@/registry/frieda/lib/data"
import { downloadCsv } from "@/registry/frieda/lib/download"
import { longDate, money } from "@/registry/frieda/lib/format"
import { useFrieda } from "@/registry/frieda/lib/store"
import { Donut, ProgressBar } from "@/registry/frieda/components/frieda/charts"
import { DateRangeButton, PageHeader, primaryAction, ranges, useRange, vary } from "@/registry/frieda/components/frieda/page-header"
import { Money, Panel, Pill } from "@/registry/frieda/components/frieda/panel"
import { kindMeta, TransactionList } from "@/registry/frieda/components/frieda/transactions"

/** Clockwise order of the donut in the design (legend keeps its own order). */
const donutOrder = ["Transfers", "Groceries", "Savings", "Income"]

export function SpendingLegend({ items }: { items: { label: string; value: number; color: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      {items.map((s) => (
        <div key={s.label} className="flex items-start gap-4">
          <span className="mt-1.5 size-[22px] shrink-0 rounded-[6px]" style={{ background: s.color }} />
          <div className="min-w-0">
            <div className="text-[22px] leading-tight tabular-nums">{money(s.value)}</div>
            <div className="mt-1 truncate text-[14px] text-[#a3a3a3]">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TransactionsPage() {
  const [range, setRange] = useRange("today")
  const [kind, setKind] = React.useState<TxKind | "all">("all")
  const transactions = useFrieda((s) => s.transactions)
  const limit = useFrieda((s) => s.budgetLimit)

  const items = kind === "all" ? transactions : transactions.filter((t) => t.kind === kind)
  const values = vary(spendingBreakdown.map((s) => s.value), range)
  const spending = spendingBreakdown.map((s, i) => ({ ...s, value: values[i] }))
  const donut = [...spending].sort((a, b) => donutOrder.indexOf(a.label) - donutOrder.indexOf(b.label))
  const spent = vary([monthlyBudget.spent], range)[0]

  function downloadReport() {
    downloadCsv(
      [
        ["Date", "Description", "Type", "Amount (USD)"],
        ...items.map((t) => [longDate(t.date), t.title, kindMeta[t.kind].label, t.amount.toFixed(2)]),
      ],
      `frieda-transactions-${ranges[range].label.toLowerCase().replace(/\s+/g, "-")}.csv`
    )
    toast.success("Report downloaded", { description: `${items.length} transactions exported as CSV.` })
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        actions={
          <>
            <DateRangeButton value={range} onChange={setRange} />
            <button type="button" className={primaryAction} onClick={downloadReport}>
              <Download /> Download report
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,373px)]">
        <Panel
          title="Latest transactions"
          menu={false}
          className="xl:h-[max(640px,calc(100svh-207px))]"
          bodyClassName="-mr-3"
          action={
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] text-[#bdbdbd] transition-colors outline-none hover:text-white data-[state=open]:text-teal",
                  kind !== "all" && "bg-teal/10 text-teal"
                )}
              >
                <ListFilter className="size-3.5" />
                {kind === "all" ? "All types" : kindMeta[kind].label}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {(["all", ...Object.keys(kindMeta)] as (TxKind | "all")[]).map((k) => (
                  <DropdownMenuItem key={k} onSelect={() => setKind(k)} className="justify-between">
                    {k === "all" ? "All types" : kindMeta[k].label}
                    {kind === k && <Check className="text-teal" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          <TransactionList items={items} className="frieda-scroll min-h-0 flex-1 overflow-y-auto pr-3 [&_.rounded-xl]:py-[11px]" />
        </Panel>

        <div className="grid min-w-0 content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
          <Panel title="Spending">
            <Donut segments={donut} className="mt-1 max-w-[232px]" />
            <div className="mt-8 px-2">
              <SpendingLegend items={spending} />
            </div>
          </Panel>
          <Panel title="Budget this month">
            <ProgressBar value={spent} max={limit} className="mt-1" />
            <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <Money value={spent} className="text-[32px] leading-none" />
                <span className="text-[16px] text-[#9a9a9a]">/${limit.toLocaleString("de-DE")}</span>
              </div>
              <Pill className="h-8 px-2.5 text-[15px]">{money(Math.max(0, limit - spent))} Left</Pill>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
