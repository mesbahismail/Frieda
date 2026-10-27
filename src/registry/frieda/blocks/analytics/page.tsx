"use client"

import * as React from "react"
import { ShoppingBasket } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  goalRings,
  incomeGraph,
  incomeManagement,
  incomeStats,
  savingsGoals,
  spendingCategories,
} from "@/registry/frieda/lib/data"
import { compact, money } from "@/registry/frieda/lib/format"
import { AreaChart, ConcentricRings, LayeredBars, Sparkline } from "@/registry/frieda/components/frieda/charts"
import { Dots } from "@/registry/frieda/components/frieda/bank-card"
import { DateRangeButton, PageHeader, useRange, vary } from "@/registry/frieda/components/frieda/page-header"
import { Money, Panel, TrendBadge } from "@/registry/frieda/components/frieda/panel"
import { KindIcon, kindMeta } from "@/registry/frieda/components/frieda/transactions"

const months = incomeManagement.map((m) => m.month)

export default function AnalyticsPage() {
  const [range, setRange] = useRange("lastMonth")
  const [goal, setGoal] = React.useState<string | null>(null)
  const [slide, setSlide] = React.useState(0)

  const stats = vary(incomeStats.map((s) => s.value), range, "lastMonth")
  const saved = vary(incomeManagement.map((m) => m.saved), range, "lastMonth")
  const spent = vary(incomeManagement.map((m) => m.spent), range, "lastMonth")
  // Layers overlap rather than stack, so each total must stay above what was spent.
  const total = vary(incomeManagement.map((m) => m.total), range, "lastMonth").map((t, i) => Math.max(t, spent[i] + 8000))
  // The income graph moves in steps of two points, so vary each step once.
  const graph = vary(incomeGraph.filter((_, i) => i % 2 === 0), range, "lastMonth").flatMap((v) => [v, v])
  const rings = goalRings.map((r) => ({ ...r, value: Math.min(0.95, vary([r.value * 100], range, "lastMonth")[0] / 100) }))
  const current = savingsGoals[slide]

  return (
    <>
      <PageHeader title="Analytics" actions={<DateRangeButton value={range} onChange={setRange} />} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.04fr)_minmax(320px,1fr)]">
        <div className="grid min-w-0 gap-6">
          <Panel title="Income management" bodyClassName="min-h-[300px]">
            <div className="grid gap-4 sm:grid-cols-3">
              {incomeStats.map((s, i) => (
                <div key={s.label} className={cn("min-w-0", i > 0 && "sm:border-l sm:border-white/[0.08] sm:pl-[30px]")}>
                  <div className="flex items-center gap-2.5 text-[14px] text-[#e0e0e0]">
                    <span className="size-[15px] rounded-[4px]" style={{ background: s.color }} />
                    {s.label}
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="text-[26px] leading-none tabular-nums">{compact(stats[i])}</span>
                    <TrendBadge value={s.change} className="h-[22px] px-1.5 text-[11px]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex min-h-[190px] flex-1">
              <LayeredBars
                data={incomeManagement.map((m, i) => ({ month: m.month, saved: saved[i], spent: spent[i], total: total[i] }))}
                layers={[
                  { key: "saved", color: incomeStats[0].color, label: "Saved" },
                  { key: "spent", color: incomeStats[1].color, label: "Spent" },
                  { key: "total", color: incomeStats[2].color, label: "Total" },
                ]}
              />
            </div>
          </Panel>

          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <Panel title="Income graph" bodyClassName="min-h-[230px]">
              <AreaChart data={graph} labels={months} initialHover={6} className="[&_span]:text-[12px]" />
            </Panel>

            <Panel title="Spending">
              <ul className="flex flex-1 flex-col justify-between gap-4">
                {spendingCategories.map((c) => {
                  const meta = kindMeta[c.kind]
                  return (
                    <li key={c.label} className="flex items-center gap-3.5">
                      <KindIcon kind={c.kind} icon={c.label === "Others" ? ShoppingBasket : undefined} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 text-[14px] text-[#f0f0f0]">
                          <span className="truncate">{c.label}</span>
                          <TrendBadge value={c.change} className="h-[22px] w-auto min-w-[26px] px-1.5 text-[11px]" />
                          <span className="ml-auto tabular-nums">{c.share}%</span>
                        </div>
                        <div className="mt-2.5 mr-[19px] h-[5px] rounded-full bg-[#3a3a3a]">
                          <div className="frieda-grow-x h-full rounded-full" style={{ width: `${c.share}%`, background: meta.bg }} />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[minmax(0,1fr)_auto]">
          <Panel title="Goals">
            <div className="flex flex-wrap gap-3">
              {rings.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={goal === r.id}
                  onMouseEnter={() => setGoal(r.id)}
                  onMouseLeave={() => setGoal(null)}
                  onFocus={() => setGoal(r.id)}
                  onBlur={() => setGoal(null)}
                  className={cn(
                    "flex h-[34px] flex-1 items-center justify-center gap-2 rounded-[8px] px-3 text-[14px] transition-[filter,opacity]",
                    goal && goal !== r.id && "opacity-50"
                  )}
                  style={{ background: r.chip, color: r.text }}
                >
                  <span className="size-[7px] rounded-full" style={{ background: r.color }} />
                  {r.label}
                  {goal === r.id && <span className="tabular-nums">{Math.round(r.value * 100)}%</span>}
                </button>
              ))}
            </div>
            <div className="grid flex-1 place-items-center py-6 xl:py-0">
              <ConcentricRings rings={rings} active={goal} onHover={setGoal} />
            </div>
          </Panel>

          <Panel title={current.name}>
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <Money value={current.value} className="text-[34px] leading-none" />
                <div className="mt-3 w-fit rounded-[6px] bg-[#0b4c45] px-2 py-1 text-[14px] text-teal tabular-nums">
                  {money(current.leftToGoal)} Left to goal
                </div>
              </div>
              <Sparkline key={current.id} data={current.spark} className="h-[70px] min-w-0 flex-1" />
            </div>
            <Dots count={savingsGoals.length} active={slide} onSelect={setSlide} className="mt-5" />
          </Panel>
        </div>
      </div>
    </>
  )
}
