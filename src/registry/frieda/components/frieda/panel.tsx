"use client"

import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, ChevronRight, Ellipsis, EyeOff, Maximize2, Minus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** A dashboard card: dark gradient surface with an optional title row. */
export function Panel({
  title,
  action,
  menu = true,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  menu?: boolean
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("frieda-card flex min-w-0 flex-col p-[22px]", className)}>
      {(title || action || menu) && (
        <header className="mb-4 flex min-h-7 items-center justify-between gap-3">
          {title && <h2 className="truncate text-[16px] leading-tight font-normal text-[#ececec]">{title}</h2>}
          <div className="ml-auto flex items-center gap-4">
            {action}
            {menu && <PanelMenu label={typeof title === "string" ? title : "widget"} />}
          </div>
        </header>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  )
}

export function PanelMenu({ label }: { label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label} options`}
        className="grid size-7 place-items-center rounded-full border-[1.5px] border-[#8a8a8a] text-[#bdbdbd] transition-colors outline-none hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=open]:border-teal data-[state=open]:text-teal"
      >
        <Ellipsis className="size-3.5" strokeWidth={2.4} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => toast.success(`${label} refreshed`)}>
          <RefreshCw /> Refresh
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast(`${label} expanded view is coming soon`)}>
          <Maximize2 /> Expand
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast(`${label} hidden for this session`)}>
          <EyeOff /> Hide widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SeeAll({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-[15px] text-teal transition-opacity hover:opacity-80">
      See all <ChevronRight className="size-4" />
    </Link>
  )
}

/** "↗ 3.2%" chip. Positive is teal, negative is rose, zero is a neutral dash. */
export function TrendBadge({
  value,
  className,
  plus = false,
}: {
  value: number
  className?: string
  /** Prefix positive values with "+" */
  plus?: boolean
}) {
  if (value === 0) {
    return (
      <span className={cn("inline-grid h-[26px] w-8 place-items-center rounded-md bg-[#3a3a3a] text-[#9c9c9c]", className)}>
        <Minus className="size-4" />
      </span>
    )
  }
  const up = value > 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1 rounded-md px-2 text-[13px] font-medium tabular-nums",
        up ? "bg-[#0c4a43] text-teal" : "bg-[#5a1424] text-[#ff6b81]",
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.2} />
      {plus && up && "+"}
      {Math.abs(value)}%
    </span>
  )
}

/** "$458 Left" style pill */
export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center rounded-lg bg-[#0b4c45] px-3 text-[17px] font-medium whitespace-nowrap text-teal tabular-nums",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Big dollar figure with a dimmed "$" like the designs. */
export function Money({
  value,
  className,
  cents = false,
}: {
  value: number
  className?: string
  cents?: boolean
}) {
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })
  return (
    <span className={cn("tabular-nums", className)}>
      {value < 0 && "-"}
      <span className="mr-[0.08em] text-[#9a9a9a]">$</span>
      {formatted}
    </span>
  )
}
