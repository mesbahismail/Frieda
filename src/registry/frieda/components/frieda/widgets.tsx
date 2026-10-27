"use client"

import { ArrowRightLeft, Check, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { monthlyBudget, savings, incomeGraph } from "@/registry/frieda/lib/data"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { AreaChart, Pie, ProgressBar, RingProgress, Sparkline, ValueBars } from "./charts"
import { Money, TrendBadge } from "./panel"
import { SidePanel } from "./side-panel"

function Title({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 text-[16px] text-[#ececec]">{children}</div>
}

function BudgetWidget() {
  const limit = useFrieda((s) => s.budgetLimit)
  return (
    <>
      <Title>Budget this month</Title>
      <ProgressBar value={monthlyBudget.spent} max={limit} className="h-[56px] rounded-[12px]" />
      <div className="mt-5 flex items-baseline gap-2">
        <Money value={monthlyBudget.spent} className="text-[34px] leading-none" />
        <span className="text-[18px] text-[#9a9a9a]">/${limit.toLocaleString("de-DE")}</span>
      </div>
    </>
  )
}

function RecipientsWidget() {
  return (
    <div className="flex items-center gap-5">
      <RingProgress value={24} color="var(--sun)" size={78} stroke={6} />
      <div>
        <div className="text-[14px] text-[#d6d6d6]">Recipients</div>
        <Money value={36654} className="text-[24px]" />
      </div>
    </div>
  )
}

const tealPie = [
  { label: "Transfers", value: 875, color: "#15e0cc" },
  { label: "Savings", value: 345, color: "#0fb3a3" },
  { label: "Income", value: 1239, color: "#06a294" },
  { label: "Groceries", value: 312, color: "#077f75" },
]

function SpendingPieWidget() {
  return (
    <>
      <Title>Spending</Title>
      <Pie segments={tealPie} separator="transparent" className="mx-auto max-w-[220px]" />
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
        {tealPie.map((s) => (
          <div key={s.label} className="flex items-start gap-3">
            <span className="mt-2 size-3 rounded-full" style={{ background: s.color }} />
            <div>
              <div className="text-[22px] leading-tight tabular-nums">${s.value.toLocaleString("en-US")}</div>
              <div className="text-[13px] text-subtle">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function MonthlyWidget() {
  return (
    <>
      <Title>Spending monthly</Title>
      <div className="flex h-[200px]">
        <ValueBars
          data={[
            { label: "Shop", value: 6423, color: "#15e0cc" },
            { label: "Bills", value: 5180, color: "#15e0cc" },
            { label: "Others", value: 6423, color: "#15e0cc" },
          ]}
        />
      </div>
    </>
  )
}

function SavingsWidget() {
  return (
    <>
      <Title>Spending</Title>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <Money value={savings.value} className="text-[32px] leading-none" />
          <div className="mt-3 max-w-[130px] text-[14px] leading-snug text-[#bdbdbd]">${savings.leftToGoal.toLocaleString("en-US")} Left to goal</div>
        </div>
        <Sparkline data={savings.spark} className="h-20" />
      </div>
    </>
  )
}

function BudgetAreaWidget() {
  return (
    <>
      <Title>Budget</Title>
      <div className="flex h-[200px]">
        <AreaChart data={incomeGraph} labels={["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]} />
      </div>
    </>
  )
}

function TransferWidget() {
  return (
    <>
      <Title>Spending</Title>
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-teal text-[#123]">
          <ArrowRightLeft className="size-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[15px]">
            Money Transfer <TrendBadge value={3.2} className="h-6 text-[12px]" />
            <span className="ml-auto text-[15px]">25%</span>
          </div>
          <div className="mt-2 h-[6px] rounded-full bg-[#3a3a3a]">
            <div className="frieda-grow-x h-full w-[64%] rounded-full bg-teal" />
          </div>
        </div>
      </div>
    </>
  )
}

export const widgetRegistry = [
  { id: "budget-month", title: "Budget this month", column: 0, Component: BudgetWidget },
  { id: "recipients", title: "Recipients", column: 1, Component: RecipientsWidget },
  { id: "spending-pie", title: "Spending breakdown", column: 1, Component: SpendingPieWidget },
  { id: "spending-monthly", title: "Spending monthly", column: 0, Component: MonthlyWidget },
  { id: "savings", title: "Savings goal", column: 0, Component: SavingsWidget },
  { id: "budget-area", title: "Budget trend", column: 1, Component: BudgetAreaWidget },
  { id: "transfer", title: "Money transfers", column: 0, Component: TransferWidget },
]

export function WidgetCard({
  id,
  className,
  removable = false,
}: {
  id: string
  className?: string
  removable?: boolean
}) {
  const widget = widgetRegistry.find((w) => w.id === id)
  const pinned = useFrieda((s) => s.pinnedWidgets.includes(id))
  if (!widget) return null
  const { Component } = widget
  return (
    <div className={cn("frieda-card group/widget relative p-6", className)}>
      <Component />
      {removable ? (
        <button
          type="button"
          aria-label={`Remove ${widget.title}`}
          onClick={() => {
            actions.toggleWidget(id)
            toast(`${widget.title} removed from your dashboard`)
          }}
          className="absolute top-5 right-5 grid size-7 place-items-center rounded-full border border-white/20 text-subtle opacity-0 transition-opacity group-hover/widget:opacity-100 hover:text-white focus-visible:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            actions.toggleWidget(id)
            toast.success(pinned ? `${widget.title} removed from your dashboard` : `${widget.title} added to your dashboard`)
          }}
          className={cn(
            "absolute top-5 right-5 flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] transition-all",
            pinned
              ? "bg-teal text-[#123]"
              : "border border-white/15 bg-[#2a2a2a]/90 text-white opacity-0 group-hover/widget:opacity-100 focus-visible:opacity-100"
          )}
        >
          {pinned ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          {pinned ? "Added" : "Add"}
        </button>
      )}
    </div>
  )
}

export function WidgetsPanel() {
  const open = useFrieda((s) => s.panel === "widgets")
  return (
    <SidePanel
      open={open}
      onOpenChange={(o) => (o ? actions.openPanel("widgets") : actions.closePanel())}
      title="Widgets center"
    >
      <p className="-mt-2 px-5 pb-5 text-[14px] text-subtle sm:px-[37px]">Pick widgets to pin to your dashboard.</p>
      <div className="frieda-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-10 sm:px-[37px]">
        <div className="grid gap-6 sm:grid-cols-2">
          {[0, 1].map((col) => (
            <div key={col} className="flex flex-col gap-6">
              {widgetRegistry
                .filter((w) => w.column === col)
                .map((w) => (
                  <WidgetCard key={w.id} id={w.id} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </SidePanel>
  )
}
