"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Snowflake } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BankCard, CardColor } from "@/registry/frieda/lib/data"

export const cardGradients: Record<CardColor, string> = {
  teal: "radial-gradient(110% 95% at 0% 0%, #2457b8 0%, rgb(36 87 184 / 0) 58%), radial-gradient(85% 90% at 100% 0%, #4cc5a8 0%, rgb(76 197 168 / 0) 62%), radial-gradient(120% 80% at 8% 100%, #00e6fb 0%, rgb(0 230 251 / 0) 62%), linear-gradient(165deg, #2a8fbb 0%, #20d4d4 100%)",
  purple:
    "radial-gradient(110% 95% at 100% 0%, #2c47b4 0%, rgb(44 71 180 / 0) 60%), radial-gradient(100% 100% at 0% 100%, #8a4cf0 0%, rgb(138 76 240 / 0) 62%), linear-gradient(160deg, #5b2fbf 0%, #3a2aa2 100%)",
  red: "radial-gradient(110% 95% at 0% 0%, #7d1162 0%, rgb(125 17 98 / 0) 60%), radial-gradient(100% 100% at 100% 100%, #ff5a7e 0%, rgb(255 90 126 / 0) 62%), linear-gradient(160deg, #bb1a6c 0%, #e2365e 100%)",
  orange:
    "radial-gradient(110% 95% at 0% 0%, #b3410e 0%, rgb(179 65 14 / 0) 60%), radial-gradient(100% 100% at 100% 100%, #ffd25c 0%, rgb(255 210 92 / 0) 62%), linear-gradient(160deg, #e2761f 0%, #f5a524 100%)",
  green:
    "radial-gradient(110% 95% at 0% 0%, #0f6d3a 0%, rgb(15 109 58 / 0) 60%), radial-gradient(100% 100% at 100% 100%, #b6f36a 0%, rgb(182 243 106 / 0) 62%), linear-gradient(160deg, #1fa34c 0%, #3ddc57 100%)",
  blue: "radial-gradient(110% 95% at 0% 0%, #1b2f8f 0%, rgb(27 47 143 / 0) 60%), radial-gradient(100% 100% at 100% 100%, #38d6ff 0%, rgb(56 214 255 / 0) 62%), linear-gradient(160deg, #1f5fe0 0%, #1d9bf0 100%)",
}

/** Abstract issuer mark (four quarter petals). */
function IssuerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <g fill="white">
        <path d="M15 3.2a12.8 12.8 0 0 0-11.8 11.8H11a4 4 0 0 1 4-4Z" />
        <path d="M17 3.2V11a4 4 0 0 1 4 4h7.8A12.8 12.8 0 0 0 17 3.2Z" />
        <path d="M28.8 17H21a4 4 0 0 1-4 4v7.8A12.8 12.8 0 0 0 28.8 17Z" />
        <path d="M15 28.8V21a4 4 0 0 1-4-4H3.2A12.8 12.8 0 0 0 15 28.8Z" />
      </g>
    </svg>
  )
}

export function BankCardVisual({
  card,
  className,
  reveal = false,
}: {
  card: Pick<BankCard, "type" | "holder" | "balance" | "number" | "expiry" | "color" | "frozen">
  className?: string
  reveal?: boolean
}) {
  const digits = card.number.replace(/\s/g, "")
  const last4 = digits.slice(-4).padStart(4, "•")
  const groups = reveal ? card.number.split(" ").slice(0, 3) : ["••••", "••••", "••••"]
  return (
    <div
      className={cn(
        "@container relative isolate aspect-[343/209] w-full overflow-hidden rounded-[22px] text-white shadow-[0_24px_40px_-22px_rgb(0_0_0/0.8)] select-none",
        className
      )}
      style={{ background: cardGradients[card.color] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgb(255_255_255/0.10)_0%,rgb(255_255_255/0)_38%)]" />
      <div className="relative flex h-full flex-col justify-between p-[7%] pb-[6%]">
        <div>
          <div className="flex items-start justify-between gap-3 text-[clamp(11px,4.6cqw,16px)] font-medium tracking-[0.02em]">
            <span>{card.type}</span>
            <span className="truncate">{card.holder || "Card holder"}</span>
          </div>
          <div className="mt-[3%] text-[clamp(20px,11.5cqw,40px)] leading-none font-normal tabular-nums">
            ${card.balance.toLocaleString("en-US")}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <IssuerMark className="aspect-square w-[14cqw] max-w-[50px] min-w-7" />
          <div className="text-right">
            <div className="flex items-center justify-end gap-[0.6em] text-[clamp(13px,7cqw,24px)] leading-none tabular-nums">
              {groups.map((g, i) => (
                <span key={i} className={cn(!reveal && "text-[0.7em] tracking-[0.12em]")}>
                  {g}
                </span>
              ))}
              <span>{last4}</span>
            </div>
            <div className="mt-[0.7em] text-[clamp(11px,4.8cqw,17px)] tracking-[0.04em] tabular-nums">{card.expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
      {card.frozen && (
        <div className="absolute inset-0 grid place-items-center bg-[#b9e9ff]/25 backdrop-blur-[3px]">
          <span className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-sm font-medium">
            <Snowflake className="size-4" /> Frozen
          </span>
        </div>
      )}
    </div>
  )
}

/** Card with two "plates" peeking underneath (Dashboard → My cards). */
export function CardStack({ card, className }: { card: BankCard; className?: string }) {
  return (
    <div className={cn("relative pb-6", className)}>
      <div className="absolute inset-x-[8%] bottom-0 h-[40%] rounded-[22px] bg-[#164c47]" />
      <div className="absolute inset-x-[4%] bottom-3 h-[40%] rounded-[22px] bg-[#1d6a62]" />
      <BankCardVisual card={card} className="relative" />
    </div>
  )
}

export function Dots({
  count,
  active,
  onSelect,
  className,
}: {
  count: number
  active: number
  onSelect?: (index: number) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Show item ${i + 1}`}
          aria-current={i === active}
          onClick={() => onSelect?.(i)}
          className={cn(
            "h-[7px] rounded-full transition-all duration-300",
            i === active ? "w-6 bg-teal" : "w-[7px] bg-[#9b9b9b] hover:bg-white"
          )}
        />
      ))}
    </div>
  )
}

/** Horizontal card carousel with peeking neighbours and arrows. */
export function CardCarousel({
  cards,
  active,
  onChange,
  reveal,
}: {
  cards: BankCard[]
  active: number
  onChange: (index: number) => void
  reveal?: boolean
}) {
  const go = (dir: number) => onChange((active + dir + cards.length) % cards.length)
  const arrow =
    "absolute top-1/2 z-10 grid size-[30px] -translate-y-1/2 place-items-center rounded-[9px] border border-white/30 bg-[#1f1f1f]/70 text-white backdrop-blur transition-colors hover:bg-[#1f1f1f]"
  return (
    <div>
      <div
        className="relative -mx-[22px] overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1)
          if (e.key === "ArrowRight") go(1)
        }}
      >
        <div aria-hidden className="invisible mx-auto aspect-[343/209] w-[266px] max-w-[64%]" />
        {cards.map((card, i) => {
          let offset = i - active
          if (offset > cards.length / 2) offset -= cards.length
          if (offset < -cards.length / 2) offset += cards.length
          return (
            <button
              key={card.id}
              type="button"
              tabIndex={offset === 0 ? 0 : -1}
              onClick={() => onChange(i)}
              aria-label={`${card.type} ending ${card.number.slice(-4)}`}
              className="absolute top-0 left-1/2 w-[266px] max-w-[64%] transition-[transform,opacity] duration-500 ease-out"
              style={{
                transform: `translateX(calc(-50% + ${offset} * (100% + 39px)))`,
                opacity: Math.abs(offset) > 1 ? 0 : 1,
              }}
            >
              <BankCardVisual card={card} reveal={reveal && offset === 0} />
            </button>
          )
        })}
        {cards.length > 1 && (
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[266px] max-w-[64%] -translate-x-1/2">
            <button type="button" aria-label="Previous card" onClick={() => go(-1)} className={cn(arrow, "pointer-events-auto -left-[118px]")}>
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" aria-label="Next card" onClick={() => go(1)} className={cn(arrow, "pointer-events-auto -right-[118px]")}>
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
      <Dots count={cards.length} active={active} onSelect={onChange} className="mt-6" />
    </div>
  )
}
