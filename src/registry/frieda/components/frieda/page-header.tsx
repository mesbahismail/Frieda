"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarDays, Check, ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TODAY } from "@/registry/frieda/lib/data"
import { shortDate } from "@/registry/frieda/lib/format"

export const primaryAction =
  "inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-[10px] bg-teal px-4 text-[15px] whitespace-nowrap text-[#14302d] transition-[filter,transform] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-teal/50 active:translate-y-px disabled:opacity-50 [&_svg]:size-[18px]"

export const outlineAction =
  "inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[#4a4a4a] bg-transparent px-4 text-[15px] whitespace-nowrap text-[#ececec] transition-colors outline-none hover:border-[#5c5c5c] hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-teal/50 data-[state=open]:border-[#5c5c5c] data-[state=open]:bg-white/[0.04] [&_svg]:size-[18px]"

export function PageHeader({
  title,
  current,
  crumbs = [],
  actions,
}: {
  title: string
  /** Breadcrumb label for this page when it differs from the title */
  current?: string
  /** Parent pages between "Home" and the current page */
  crumbs?: { label: string; href: string }[]
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] leading-5 text-[#a2a2a2]">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          {crumbs.map((c) => (
            <React.Fragment key={c.href}>
              <ChevronRight className="size-3.5" />
              <Link href={c.href} className="transition-colors hover:text-white">
                {c.label}
              </Link>
            </React.Fragment>
          ))}
          <ChevronRight className="size-3.5" />
          <span aria-current="page" className="text-[#efefef]">
            {current ?? title}
          </span>
        </nav>
        <h1 className="mt-2 text-[30px] leading-[1.25] font-normal tracking-[-0.01em] text-white">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 sm:gap-[18px]">{actions}</div>}
    </div>
  )
}

// ─── Date range ──────────────────────────────────────────────────────────────

export type RangeId = "today" | "week" | "month" | "lastMonth" | "year"

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export const ranges: Record<RangeId, { label: string; dates: string }> = {
  today: { label: "Today", dates: shortDate(TODAY) },
  week: { label: "Last 7 days", dates: `${shortDate(addDays(TODAY, -6))} - ${shortDate(TODAY)}` },
  month: {
    label: "This month",
    dates: `${shortDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))} - ${shortDate(TODAY)}`,
  },
  lastMonth: {
    label: "Last month",
    dates: `${shortDate(new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1))} - ${shortDate(
      new Date(TODAY.getFullYear(), TODAY.getMonth(), 0)
    )}`,
  },
  year: { label: "This year", dates: `${shortDate(new Date(TODAY.getFullYear(), 0, 1))} - ${shortDate(TODAY)}` },
}

const rangeSeeds: Record<RangeId, number> = { today: 0, week: 3, month: 7, lastMonth: 11, year: 17 }

/**
 * Deterministic variation so charts visibly change when the range changes.
 * `base` is the page's default range, which shows the data unchanged.
 */
export function vary(values: number[], range: RangeId, base: RangeId = "today") {
  if (range === base) return values
  const seed = rangeSeeds[range] || rangeSeeds[base]
  return values.map((v, i) => {
    const r = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
    const f = 0.78 + (r - Math.floor(r)) * 0.4
    return Math.round(v * f)
  })
}

export function useRange(initial: RangeId = "today") {
  return React.useState<RangeId>(initial)
}

export function DateRangeButton({
  value,
  onChange,
  className,
}: {
  value: RangeId
  onChange: (value: RangeId) => void
  className?: string
}) {
  const current = ranges[value]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(outlineAction, "pr-3.5", className)}>
        <CalendarDays className="text-[#d9d9d9]" />
        <span>
          {current.label} {current.dates}
        </span>
        <ChevronDown className="!size-4 text-[#cfcfcf]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        {(Object.keys(ranges) as RangeId[]).map((id) => (
          <DropdownMenuItem key={id} onSelect={() => onChange(id)} className="justify-between gap-6">
            <span>
              {ranges[id].label}
              <span className="ml-2 text-xs text-muted-foreground">{ranges[id].dates}</span>
            </span>
            {id === value && <Check className="text-teal" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
