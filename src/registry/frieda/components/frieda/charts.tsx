"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { compact, money } from "@/registry/frieda/lib/format"
import { TrendBadge } from "./panel"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** SVG arc path from `start` to `end` degrees (0 = 12 o'clock, clockwise). */
export function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, start)
  const e = polar(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, start)
  const e = polar(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
}

function ringSlice(cx: number, cy: number, r1: number, r2: number, start: number, end: number) {
  const a = polar(cx, cy, r2, start)
  const b = polar(cx, cy, r2, end)
  const c = polar(cx, cy, r1, end)
  const d = polar(cx, cy, r1, start)
  const large = end - start > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r2} ${r2} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${r1} ${r1} 0 ${large} 0 ${d.x} ${d.y} Z`
}

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ""
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function Tooltip({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "pointer-events-none absolute z-20 rounded-[10px] border border-[#474747] bg-[#262626]/95 px-3 py-2 text-[13px] whitespace-nowrap text-white shadow-[0_10px_30px_rgb(0_0_0/0.45)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  )
}

function GridLines({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 flex flex-col justify-between", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-px w-full bg-white/[0.07]" />
      ))}
    </div>
  )
}

// ─── Rings & gauges ──────────────────────────────────────────────────────────

/** Circular progress (income tiles, top spenders). */
export function RingProgress({
  value,
  color,
  size = 88,
  stroke = 7,
  track = "#3c3c3c",
  className,
  children,
}: {
  value: number
  color: string
  size?: number
  stroke?: number
  track?: string
  className?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const len = 2 * Math.PI * r
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - value / 100)}
          className="frieda-ring transition-[stroke-dashoffset] duration-700"
          style={{ "--len": len } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[20px] font-medium tabular-nums">
        {children ?? `${value}%`}
      </div>
    </div>
  )
}

/** Thick half-circle gauge used by the Goals card. */
export function Gauge({ value, max, className, children }: { value: number; max: number; className?: string; children?: React.ReactNode }) {
  const size = 300
  const stroke = 32
  const r = (size - stroke) / 2
  const sweep = 180
  const start = -sweep / 2
  const pct = Math.min(1, value / max)
  const len = (Math.PI * 2 * r * sweep) / 360
  return (
    <div className={cn("relative mx-auto aspect-[300/166] w-full max-w-[300px]", className)}>
      <svg viewBox={`0 0 ${size} 166`} className="size-full overflow-visible">
        <path d={arcPath(size / 2, size / 2, r, start, start + sweep)} fill="none" stroke="#3a3a3a" strokeWidth={stroke} strokeLinecap="round" />
        <path
          d={arcPath(size / 2, size / 2, r, start, start + sweep)}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - pct)}
          className="frieda-ring transition-[stroke-dashoffset] duration-700"
          style={{ "--len": len } as React.CSSProperties}
        />
      </svg>
      {children}
    </div>
  )
}

/** Three concentric rings (Analytics goals). */
export function ConcentricRings({
  rings,
  active,
  onHover,
}: {
  rings: readonly { id: string; label: string; value: number; color: string }[]
  active?: string | null
  onHover?: (id: string | null) => void
}) {
  const size = 320
  const stroke = 15
  const gap = 23
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto aspect-square w-full max-w-[310px] -rotate-90">
      {rings.map((ring, i) => {
        const r = size / 2 - stroke / 2 - i * (stroke + gap)
        const len = 2 * Math.PI * r
        const dim = active && active !== ring.id
        return (
          <g key={ring.id} onMouseEnter={() => onHover?.(ring.id)} onMouseLeave={() => onHover?.(null)} className="cursor-pointer">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3b3b3b" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={active === ring.id ? stroke + 4 : stroke}
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - ring.value)}
              opacity={dim ? 0.35 : 1}
              className="frieda-ring transition-all duration-500"
              style={{ "--len": len } as React.CSSProperties}
            >
              <title>{`${ring.label}: ${Math.round(ring.value * 100)}%`}</title>
            </circle>
          </g>
        )
      })}
    </svg>
  )
}

export type Segment = { label: string; value: number; color: string }

/** Donut with gaps between segments (Transactions spending). */
export function Donut({ segments, className, center }: { segments: Segment[]; className?: string; center?: React.ReactNode }) {
  const [hover, setHover] = React.useState<number | null>(null)
  const size = 240
  const thickness = 34
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const gap = 3.5
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((sum, s) => sum + (s.value / total) * 360, 0))
  const active = hover !== null ? segments[hover] : null
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[236px]", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full overflow-visible">
        {segments.map((s, i) => {
          const sweep = (s.value / total) * 360
          const start = starts[i] + gap / 2
          const end = starts[i] + sweep - gap / 2
          const grow = hover === i ? 5 : 0
          return (
            <path
              key={s.label}
              d={ringSlice(size / 2, size / 2, size / 2 - thickness - grow / 2, size / 2 + grow / 2, start, end)}
              fill={s.color}
              stroke={s.color}
              strokeWidth={6}
              strokeLinejoin="round"
              opacity={hover !== null && hover !== i ? 0.45 : 1}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        {active ? (
          <div className="animate-float-in">
            <div className="text-[22px] font-medium tabular-nums">{money(active.value)}</div>
            <div className="text-[13px] text-subtle">{active.label}</div>
            <div className="text-[12px] text-faint">{Math.round((active.value / total) * 100)}%</div>
          </div>
        ) : (
          center
        )}
      </div>
    </div>
  )
}

/** Solid pie with dark separators (Budget spending). */
export function Pie({
  segments,
  className,
  separator = "#1e1e1e",
  active,
  onHover,
}: {
  segments: Segment[]
  className?: string
  separator?: string
  active?: number | null
  onHover?: (index: number | null) => void
}) {
  const size = 240
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((sum, s) => sum + (s.value / total) * 360, 0))
  return (
    <svg viewBox={`-6 -6 ${size + 12} ${size + 12}`} className={cn("aspect-square w-full", className)}>
      {segments.map((s, i) => {
        const sweep = (s.value / total) * 360
        const start = starts[i]
        const mid = start + sweep / 2
        const lift = active === i ? 6 : 0
        const offset = polar(0, 0, lift, mid)
        return (
          <path
            key={s.label}
            d={slicePath(size / 2, size / 2, size / 2, start, start + sweep)}
            fill={s.color}
            stroke={separator}
            strokeWidth={3}
            strokeLinejoin="round"
            transform={`translate(${offset.x} ${offset.y})`}
            opacity={active != null && active !== i ? 0.55 : 1}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(null)}
          >
            <title>{`${s.label}: ${money(s.value)}`}</title>
          </path>
        )
      })}
    </svg>
  )
}

// ─── Lines & areas ───────────────────────────────────────────────────────────

/** Small wavy line with a soft fill (savings, AI chat balance). */
export function Sparkline({
  data,
  className,
  color = "var(--teal)",
  strokeWidth = 2.4,
}: {
  data: number[]
  className?: string
  color?: string
  strokeWidth?: number
}) {
  const id = React.useId()
  const w = 240
  const h = 80
  const max = Math.max(...data)
  const min = Math.min(...data)
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: 6 + (1 - (v - min) / (max - min || 1)) * (h - 12),
  }))
  const line = smoothPath(points)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-16 w-full overflow-visible", className)}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="frieda-draw" />
    </svg>
  )
}

/**
 * Line + area chart with y-axis, month labels and a hover tooltip.
 * `variant="solid"` draws a flat teal mountain (Wallet total balance).
 */
export function AreaChart({
  data,
  labels,
  max = 100000,
  ticks = [0, 25000, 50000, 75000, 100000],
  variant = "line",
  className,
  showAxis = true,
  initialHover = null,
}: {
  data: number[]
  labels: string[]
  max?: number
  ticks?: number[]
  variant?: "line" | "solid"
  className?: string
  showAxis?: boolean
  initialHover?: number | null
}) {
  const id = React.useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const [hover, setHover] = React.useState<number | null>(initialHover)
  const w = 1000
  const h = 300
  const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - (v / max) * h }))
  const line = points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ")
  const area = `${line} L ${w} ${h} L 0 ${h} Z`

  function onMove(e: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setHover(Math.round(ratio * (data.length - 1)))
  }

  const hp = hover !== null ? points[hover] : null
  const prev = hover !== null && hover > 0 ? data[hover - 1] : null
  const change = hover !== null && prev ? Math.round(((data[hover] - prev) / prev) * 1000) / 10 : 3.2

  return (
    <div className={cn("flex min-h-0 flex-1 gap-3", className)}>
      {showAxis && (
        <div className="flex flex-col justify-between pb-7 text-[12px] leading-none text-[#bdbdbd] tabular-nums">
          {[...ticks].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {compact(t).replace(".0", "")}
            </span>
          ))}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          ref={ref}
          className="relative min-h-0 flex-1 touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(initialHover)}
        >
          {variant === "line" ? (
            <GridLines count={ticks.length} />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex justify-between">
              {labels.map((l) => (
                <div key={l} className="h-full w-px bg-white/[0.09]" />
              ))}
            </div>
          )}
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--teal)" stopOpacity={variant === "solid" ? 1 : 0.38} />
                <stop offset="100%" stopColor="var(--teal)" stopOpacity={variant === "solid" ? 1 : 0.02} />
              </linearGradient>
              <linearGradient id={`${id}-edge`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#1c1c1c" stopOpacity="0.9" />
                <stop offset="4%" stopColor="#1c1c1c" stopOpacity="0" />
                <stop offset="96%" stopColor="#1c1c1c" stopOpacity="0" />
                <stop offset="100%" stopColor="#1c1c1c" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${id})`} className="transition-[d] duration-500" />
            {variant === "line" && (
              <path
                d={line}
                fill="none"
                stroke="var(--teal)"
                strokeWidth={3}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="transition-[d] duration-500"
              />
            )}
            {variant === "solid" && <rect x="0" y="0" width={w} height={h} fill={`url(#${id}-edge)`} />}
          </svg>
          {hp && hover !== null && (
            <>
              <div
                className="pointer-events-none absolute z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#1d1d1d] bg-teal shadow-[0_0_0_4px_rgb(21_224_204/0.25)]"
                style={{ left: `${(hp.x / w) * 100}%`, top: `${(hp.y / h) * 100}%` }}
              />
              <Tooltip
                className="-translate-x-1/2 -translate-y-[calc(100%+14px)]"
                style={{ left: `${Math.min(88, Math.max(12, (hp.x / w) * 100))}%`, top: `${(hp.y / h) * 100}%` }}
              >
                <div className="text-[19px] leading-tight font-normal tabular-nums">{compact(data[hover]).replace(".", ",")}</div>
                <TrendBadge value={change} className="mt-1 h-5 bg-transparent px-0 text-[12px]" />
              </Tooltip>
            </>
          )}
        </div>
        <div className="flex h-7 items-end justify-between px-[2%] text-[12px] text-[#bdbdbd]">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Bars ────────────────────────────────────────────────────────────────────

/** Paired thin bars per month (Dashboard activity). */
export function PairBars({
  data,
  className,
}: {
  data: { month: string; expense: number; income: number }[]
  className?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const max = Math.max(...data.flatMap((d) => [d.expense, d.income])) * 1.18
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="relative min-h-0 flex-1">
        <GridLines count={7} />
        <div className="absolute inset-0 flex items-end justify-around">
          {data.map((d, i) => (
            <div
              key={d.month}
              className="relative flex h-full items-end gap-[13px] px-2"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className={cn("frieda-grow w-[10px] rounded-t-full bg-rose transition-[height,opacity] duration-500", hover !== null && hover !== i && "opacity-40")}
                style={{ height: `${(d.expense / max) * 100}%`, animationDelay: `${i * 50}ms` }}
              />
              <div
                className={cn("frieda-grow w-[10px] rounded-t-full bg-teal transition-[height,opacity] duration-500", hover !== null && hover !== i && "opacity-40")}
                style={{ height: `${(d.income / max) * 100}%`, animationDelay: `${i * 50 + 25}ms` }}
              />
              {hover === i && (
                <Tooltip className="bottom-[calc(100%-8px)] left-1/2 -translate-x-1/2" style={{ bottom: `${(Math.max(d.expense, d.income) / max) * 100 + 4}%` }}>
                  <div className="mb-1 text-[12px] text-subtle">{d.month} 2024</div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal" /> Income <b className="ml-auto pl-3 font-medium">{money(d.income)}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose" /> Expense <b className="ml-auto pl-3 font-medium">{money(d.expense)}</b>
                  </div>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-around text-[14px] text-[#bdbdbd]">
        {data.map((d) => (
          <span key={d.month} className="w-[46px] text-center">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Layered rounded bars with a y-axis (Analytics income management). */
export function LayeredBars({
  data,
  layers,
  max = 100000,
  className,
}: {
  data: Record<string, number | string>[]
  layers: { key: string; color: string; label: string }[]
  max?: number
  className?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const ticks = [100000, 75000, 50000, 25000, 0]
  return (
    <div className={cn("flex min-h-0 flex-1 gap-4", className)}>
      <div className="flex flex-col justify-between pb-[34px] text-[14px] leading-none text-[#c9c9c9] tabular-nums">
        {ticks.map((t) => (
          <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-1/2">
            {t === 0 ? "$0k" : compact(t)}
          </span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1">
          <GridLines count={5} />
          <div className="absolute inset-0 flex items-end justify-around">
            {data.map((d, i) => {
              const top = Math.max(...layers.map((l) => Number(d[l.key])))
              return (
                <div
                  key={String(d.month)}
                  className="relative flex h-full w-[13%] max-w-[54px] items-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {[...layers].reverse().map((l) => (
                    <div
                      key={l.key}
                      className={cn("frieda-grow absolute inset-x-0 bottom-0 rounded-t-[14px] transition-[height,opacity] duration-500", hover !== null && hover !== i && "opacity-50")}
                      style={{ height: `${(Number(d[l.key]) / max) * 100}%`, background: l.color, animationDelay: `${i * 60}ms` }}
                    />
                  ))}
                  {hover === i && (
                    <Tooltip className="left-1/2 -translate-x-1/2" style={{ bottom: `${(top / max) * 100 + 4}%` }}>
                      <div className="mb-1 text-[12px] text-subtle">{d.month} 2024</div>
                      {layers.map((l) => (
                        <div key={l.key} className="flex items-center gap-2">
                          <span className="size-2 rounded-[3px]" style={{ background: l.color }} />
                          {l.label}
                          <b className="ml-auto pl-4 font-medium">{compact(Number(d[l.key]))}</b>
                        </div>
                      ))}
                    </Tooltip>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex h-[34px] items-end justify-around text-[15px] text-[#c9c9c9]">
          {data.map((d) => (
            <span key={String(d.month)} className="w-[13%] max-w-[54px] text-center">
              {String(d.month)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Bars with a value pill on top (Top earners). */
export function ValueBars({
  data,
  className,
  max,
}: {
  data: { label: string; value: number; color: string }[]
  className?: string
  max?: number
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const top = max ?? Math.max(...data.map((d) => d.value)) * 1.38
  return (
    <div className={cn("@container flex min-h-0 flex-1 flex-col", className)}>
      <div className="relative min-h-0 flex-1">
        <GridLines count={7} />
        <div className="absolute inset-0 flex items-end justify-around gap-3 px-1 @max-[22rem]:gap-1.5">
          {data.map((d, i) => (
            <div
              key={`${d.label}-${i}`}
              className="flex h-full min-w-0 max-w-[56px] flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                className={cn(
                  "mb-2 rounded-full bg-[#3a3a3a] px-2.5 py-1 text-[15px] leading-none font-normal whitespace-nowrap text-white tabular-nums transition-colors sm:text-[17px] @max-[22rem]:px-1.5 @max-[22rem]:text-[12px]",
                  hover === i && "bg-[#4a4a4a]"
                )}
              >
                <span className="text-[#bdbdbd]">$</span>
                {(d.value / 1000).toFixed(1).replace(".", ",")}k
              </span>
              <div
                className={cn("frieda-grow w-full rounded-t-[10px] transition-[height,filter] duration-500", hover === i && "brightness-110")}
                style={{ height: `${(d.value / top) * 100}%`, background: d.color, animationDelay: `${i * 60}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-around gap-3 px-1 text-[14px] text-[#d0d0d0] sm:text-[15px] @max-[22rem]:gap-1.5 @max-[22rem]:text-[12px]">
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} className="min-w-0 max-w-[56px] flex-1 text-center whitespace-nowrap">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Six small bars on a baseline (Help center response rate). */
export function MiniBars({ values, className }: { values: number[]; className?: string }) {
  const colors = ["#e4dcff", "#d2c5ff", "#c3b1ff", "#a68cff", "#8661f5", "#7352e3"]
  return (
    <div className={cn("relative flex h-[68px] items-end justify-between gap-2", className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />
      {values.map((v, i) => (
        <div
          key={i}
          className="frieda-grow w-[30px] rounded-t-[8px]"
          style={{ height: `${v * 100}%`, background: colors[i % colors.length], animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  )
}

/** Thick progress bar with an end marker (budgets, points). */
export function ProgressBar({
  value,
  max,
  className,
  overflowColor = "var(--rose)",
}: {
  value: number
  max: number
  className?: string
  overflowColor?: string
}) {
  const over = value > max
  const pct = Math.min(100, (value / max) * 100)
  const base = over ? (max / value) * 100 : pct
  return (
    <div className={cn("relative h-[76px] w-full rounded-[14px] bg-[#363636]", className)}>
      <div
        className="frieda-grow-x absolute inset-y-0 left-0 rounded-l-[14px] bg-teal transition-[width] duration-700"
        style={{ width: `${base}%`, borderRadius: base >= 99.5 ? 14 : undefined }}
      />
      {over && (
        <div
          className="frieda-grow-x absolute inset-y-0 right-0 rounded-r-[14px]"
          style={{ width: `calc(${100 - base}% - 6px)`, background: overflowColor }}
        />
      )}
      {base < 99.5 && (
        <div
          className="absolute -top-2 -bottom-2 w-[2px] rounded-full bg-teal transition-[left] duration-700"
          style={{ left: `calc(${base}% - 1px)` }}
        />
      )}
    </div>
  )
}

/** Budget history: track bars with stacked safe/alarming/over segments. */
export function HistoryBars({
  data,
  className,
}: {
  data: { month: string; safe: number; alarming: number; over: number }[]
  className?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-[17%] border-t border-dashed border-white/15" />
        <div className="pointer-events-none absolute inset-x-0 top-[33%] border-t border-dashed border-white/15" />
        <div className="absolute inset-0 flex justify-between gap-2">
          {data.map((d, i) => (
            <div
              key={d.month}
              className="relative flex h-full max-w-[64px] flex-1 flex-col-reverse gap-[3px] overflow-hidden rounded-[14px] border border-white/[0.05] bg-[#1a1a1a] p-[3px]"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="frieda-grow rounded-[11px] bg-teal" style={{ height: `${d.safe * 100}%`, animationDelay: `${i * 60}ms` }} />
              {d.alarming > 0 && (
                <div className="frieda-grow rounded-[11px] bg-sun" style={{ height: `${d.alarming * 100}%`, animationDelay: `${i * 60 + 120}ms` }} />
              )}
              {d.over > 0 && (
                <div className="frieda-grow rounded-[11px] bg-rose" style={{ height: `${d.over * 100}%`, animationDelay: `${i * 60 + 220}ms` }} />
              )}
              {hover === i && (
                <span className="absolute inset-x-0 top-2 text-center text-[12px] font-medium text-white tabular-nums">
                  {Math.round((d.safe + d.alarming + d.over) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-between gap-2 text-[16px] text-[#cfcfcf]">
        {data.map((d) => (
          <span key={d.month} className="max-w-[64px] flex-1 text-center">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  )
}
