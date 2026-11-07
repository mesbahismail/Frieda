"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover as PopoverPrimitive } from "radix-ui"
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
      {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 sm:gap-[18px]">{actions}</div>}
    </div>
  )
}

// ─── Date range ──────────────────────────────────────────────────────────────

type PresetId = "today" | "week" | "month" | "lastMonth" | "year" | "lastYear"
export type RangeId = PresetId | `custom:${string}:${string}`
type DateSpan = { from: Date; to: Date }

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function monthAt(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const presets: Record<PresetId, DateSpan & { label: string }> = {
  today: { label: "Today", from: TODAY, to: TODAY },
  week: { label: "Last week", from: addDays(TODAY, -6), to: TODAY },
  month: { label: "This month", from: monthAt(TODAY), to: TODAY },
  lastMonth: { label: "Last month", from: monthAt(TODAY, -1), to: addDays(monthAt(TODAY), -1) },
  year: { label: "This year", from: new Date(TODAY.getFullYear(), 0, 1), to: TODAY },
  lastYear: { label: "Last year", from: new Date(TODAY.getFullYear() - 1, 0, 1), to: new Date(TODAY.getFullYear() - 1, 11, 31) },
}

export function rangeDetails(value: RangeId) {
  const span = value.startsWith("custom:")
    ? { label: "Custom", from: new Date(value.split(":")[1] + "T00:00:00"), to: new Date(value.split(":")[2] + "T00:00:00") }
    : presets[value as PresetId]
  return { ...span, dates: dateKey(span.from) === dateKey(span.to) ? shortDate(span.from) : `${shortDate(span.from)} – ${shortDate(span.to)}` }
}

const rangeSeeds: Record<PresetId, number> = { today: 0, week: 3, month: 7, lastMonth: 11, year: 17, lastYear: 23 }

/** Deterministic demo chart variation, including the actual custom range. */
export function vary(values: number[], range: RangeId, base: RangeId = "today") {
  if (range === base) return values
  const seed = range.startsWith("custom:")
    ? [...range].reduce((n, char) => (n * 31 + char.charCodeAt(0)) % 997, 0) % 997
    : rangeSeeds[range as PresetId]
  return values.map((v, i) => {
    const r = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
    return Math.round(v * (0.78 + (r - Math.floor(r)) * 0.4))
  })
}

export function useRange(initial: RangeId = "today") {
  return React.useState<RangeId>(initial)
}

function CalendarMonth({ month, from, to, onSelect, onNavigate }: {
  month: Date
  from: Date
  to?: Date
  onSelect: (date: Date) => void
  onNavigate: (offset: number) => void
}) {
  const label = month.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const start = addDays(month, -((month.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const end = to ?? from
  return (
    <section aria-label={label} className="min-w-0 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-2">
        <button type="button" aria-label={`Previous month from ${label}`} onClick={() => onNavigate(-1)} className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-white/10 hover:text-white"><ChevronLeft className="size-4" /></button>
        <h3 className="text-[18px] font-medium">{label}</h3>
        <button type="button" aria-label={`Next month from ${label}`} onClick={() => onNavigate(1)} className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-white/10 hover:text-white"><ChevronRight className="size-4" /></button>
      </div>
      <div className="mb-3 grid grid-cols-7 text-center text-xs text-subtle" aria-hidden>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => <span key={i}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-2" onKeyDown={(event) => {
        const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
        if (!(event.key in offsets)) return
        const target = event.target as HTMLButtonElement
        if (!target.dataset.date) return
        const next = addDays(new Date(target.dataset.date + "T00:00:00"), offsets[event.key])
        const button = event.currentTarget.querySelector<HTMLButtonElement>(`[data-date="${dateKey(next)}"]`)
        if (button) { event.preventDefault(); button.focus() }
      }}>
        {days.map((date) => {
          const key = dateKey(date)
          const edge = key === dateKey(from) || key === dateKey(end)
          const selected = date >= from && date <= end
          const outside = date.getMonth() !== month.getMonth()
          return (
            <button key={key} type="button" data-date={key}
              aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              aria-pressed={selected} aria-current={key === dateKey(TODAY) ? "date" : undefined}
              onClick={() => onSelect(date)}
              className={cn("mx-auto grid size-9 place-items-center rounded-full text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#333] sm:size-10",
                outside ? "text-[#858e8d]" : "text-[#e9eceb]",
                selected && "bg-teal/20 text-teal", edge && "bg-teal text-[#103a35] font-medium",
                !selected && "hover:bg-white/10")}
            >{date.getDate()}</button>
          )
        })}
      </div>
    </section>
  )
}

export function DateRangeButton({ value, onChange, className }: {
  value: RangeId
  onChange: (value: RangeId) => void
  className?: string
}) {
  const current = rangeDetails(value)
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<PresetId | "custom">(value.startsWith("custom:") ? "custom" : value as PresetId)
  const [from, setFrom] = React.useState(current.from)
  const [to, setTo] = React.useState<Date | undefined>(current.to)
  const [month, setMonth] = React.useState(monthAt(current.from))
  const titleId = React.useId()

  function choosePreset(id: PresetId) {
    setDraft(id)
    setFrom(presets[id].from)
    setTo(presets[id].to)
    setMonth(monthAt(presets[id].from))
  }
  function selectDay(date: Date) {
    setDraft("custom")
    if (to) { setFrom(date); setTo(undefined) }
    else if (date < from) { setTo(from); setFrom(date) }
    else setTo(date)
  }
  return (
    <PopoverPrimitive.Root modal open={open} onOpenChange={(next) => {
      if (next) {
        setDraft(value.startsWith("custom:") ? "custom" : value as PresetId)
        setFrom(current.from); setTo(current.to); setMonth(monthAt(current.from))
      }
      setOpen(next)
    }}>
      <PopoverPrimitive.Trigger className={cn(outlineAction, "max-w-full pr-3.5", className)}>
        <CalendarDays className="shrink-0 text-[#d9d9d9]" />
        <span className="truncate">{current.label} {current.dates}</span>
        <ChevronDown className={cn("!size-4 shrink-0 text-[#cfcfcf] transition-transform", open && "rotate-180")} />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        {open && <div aria-hidden className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[5px]" />}
        <PopoverPrimitive.Content align="end" sideOffset={16} collisionPadding={16} aria-labelledby={titleId}
          className="frieda-scroll z-50 w-[min(900px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-[18px] border border-white/20 bg-[radial-gradient(ellipse_at_bottom_left,rgb(21_224_204/12%),transparent_65%),linear-gradient(#353737,#303232)] text-[#f0f0f0] shadow-[0_24px_80px_rgb(0_0_0/0.4)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 motion-reduce:animate-none">
          <h2 id={titleId} className="sr-only">Choose date range</h2>
          <div className="flex flex-col sm:flex-row">
            <div className="flex gap-1 overflow-x-auto border-b border-white/15 p-3 sm:w-[172px] sm:shrink-0 sm:flex-col sm:border-r sm:border-b-0 sm:p-4">
              {(["today", "week", "month", "lastMonth", "year", "lastYear", "custom"] as const).map((id) => (
                <button key={id} type="button" aria-pressed={draft === id} onClick={() => id === "custom" ? setDraft("custom") : choosePreset(id)}
                  className={cn("shrink-0 rounded-xl px-4 py-3 text-left text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-white sm:py-3.5", draft === id ? "bg-teal text-[#103a35]" : "hover:bg-white/5")}>
                  {id === "custom" ? "Custom" : presets[id].label}
                </button>
              ))}
            </div>
            <div className="grid min-w-0 flex-1 lg:grid-cols-2">
              <CalendarMonth month={month} from={from} to={to} onSelect={selectDay} onNavigate={(offset) => setMonth(monthAt(month, offset))} />
              <div className="border-t border-white/10 lg:border-t-0">
                <CalendarMonth month={monthAt(month, 1)} from={from} to={to} onSelect={selectDay} onNavigate={(offset) => setMonth(monthAt(month, offset))} />
              </div>
            </div>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5 text-[13px]" aria-live="polite">
              <CalendarDays className="size-5 shrink-0 text-[#d8e3e1]" />
              <span>{draft === "custom" ? "Custom" : presets[draft].label} {shortDate(from)}{to ? ` – ${shortDate(to)}` : " – Select end date"}</span>
            </div>
            <div className="ml-auto flex gap-3">
              <button type="button" className={cn(outlineAction, "h-10")} onClick={() => choosePreset("today")}>Reset</button>
              <button type="button" className={cn(primaryAction, "h-10")} disabled={!to} onClick={() => {
                if (!to) return
                onChange(draft === "custom" ? `custom:${dateKey(from)}:${dateKey(to)}` : draft)
                setOpen(false)
              }}><Check /> Apply</button>
            </div>
          </footer>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
