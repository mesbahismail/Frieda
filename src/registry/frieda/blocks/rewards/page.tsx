"use client"

import * as React from "react"
import { BadgeCheck, ChevronLeft, ChevronRight, Plus, ShoppingBasket } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { rewards, type Reward } from "@/registry/frieda/lib/data"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { ProgressBar } from "@/registry/frieda/components/frieda/charts"
import { FriedaDialog } from "@/registry/frieda/components/frieda/dialogs"
import { DateRangeButton, outlineAction, PageHeader, primaryAction, useRange } from "@/registry/frieda/components/frieda/page-header"
import { Panel, PanelMenu } from "@/registry/frieda/components/frieda/panel"
import { RewardArt } from "@/registry/frieda/components/frieda/reward-art"

const catalogue = [...rewards.popular, ...rewards.newest]

function Points({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-1.5 text-[15px] text-teal tabular-nums", className)}>
      <BadgeCheck className="size-[18px] fill-teal text-[#1f1f1f]" strokeWidth={2} />
      {value.toLocaleString("en-US")}
    </span>
  )
}

function SectionToggle({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex items-center gap-1 text-[15px] text-teal transition-opacity hover:opacity-80">
      {expanded ? "Show less" : "See all"} <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} />
    </button>
  )
}

function AwardsShelf({ title, items, onRedeem }: { title: string; items: Reward[]; onRedeem: (reward: Reward) => void }) {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = React.useState(false)
  const [edges, setEdges] = React.useState({ start: true, end: false })

  const update = React.useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  React.useEffect(() => {
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [update, expanded])

  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 206, behavior: "smooth" })
  const arrow =
    "absolute top-1/2 z-10 grid size-[30px] -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-[#1f1f1f]/80 text-white backdrop-blur transition-colors hover:bg-[#1f1f1f]"

  return (
    <section className="frieda-card flex min-w-0 flex-col p-[22px]">
      <header className="mb-4 flex min-h-7 items-center justify-between gap-3">
        <h2 className="text-[16px] text-[#ececec]">{title}</h2>
        <div className="flex items-center gap-4">
          <SectionToggle expanded={expanded} onToggle={() => setExpanded((e) => !e)} />
          <PanelMenu label={title} />
        </div>
      </header>
      <div className="relative -mr-[22px]">
        <div
          ref={scroller}
          onScroll={update}
          className={cn(
            "frieda-no-scrollbar gap-[15px] pr-[22px]",
            expanded ? "grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))]" : "flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          )}
        >
          {items.map((r) => (
            <article key={r.id} className="frieda-tile flex w-[190px] shrink-0 snap-start flex-col p-[15px] data-[grid=true]:w-auto" data-grid={expanded}>
              <div className="grid h-[118px] place-items-center px-4">
                <RewardArt art={r.art} className="max-h-[110px] transition-transform duration-300 hover:scale-105" />
              </div>
              <h3 className="mt-4 truncate text-[15px] text-[#f2f2f2]">{r.name}</h3>
              <Points value={r.points} className="mt-1.5" />
              <button type="button" onClick={() => onRedeem(r)} className={cn(outlineAction, "mt-4 h-[38px] w-full")}>
                <ShoppingBasket /> Redeem
              </button>
            </article>
          ))}
        </div>
        {!expanded && (
          <>
            {!edges.end && (
              <>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#222] to-transparent" />
                <button type="button" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)} className={cn(arrow, "right-[18px]")}>
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
            {!edges.start && (
              <button type="button" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)} className={cn(arrow, "-left-3")}>
                <ChevronLeft className="size-4" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function RedeemDialog({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const points = useFrieda((s) => s.points)
  const enough = reward ? points >= reward.points : false
  return (
    <FriedaDialog open={!!reward} onOpenChange={(o) => !o && onClose()} title={reward ? `Redeem ${reward.name}?` : "Redeem"}>
      {reward && (
        <>
          <div className="mt-5 flex items-center gap-5 rounded-[14px] bg-[#1b1b1b] p-4">
            <div className="grid size-20 shrink-0 place-items-center">
              <RewardArt art={reward.art} />
            </div>
            <div className="space-y-1 text-[14px]">
              <div className="flex gap-2 text-subtle">
                Cost <Points value={reward.points} className="text-[14px]" />
              </div>
              <div className="text-subtle">
                Your balance <span className="text-white tabular-nums">{points.toLocaleString("en-US")}</span>
              </div>
              <div className="text-subtle">
                After redeeming{" "}
                <span className={cn("tabular-nums", enough ? "text-white" : "text-[#ff6b81]")}>{(points - reward.points).toLocaleString("en-US")}</span>
              </div>
            </div>
          </div>
          {!enough && (
            <p className="mt-4 text-[13px] text-[#ff6b81]">
              You need {(reward.points - points).toLocaleString("en-US")} more points. Add points or pick another award.
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className={outlineAction} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!enough}
              className={primaryAction}
              onClick={() => {
                if (actions.redeem(reward.id, reward.points)) {
                  toast.success(`${reward.name} is on its way`, { description: `${reward.points.toLocaleString("en-US")} points redeemed.` })
                  onClose()
                }
              }}
            >
              <ShoppingBasket /> Redeem
            </button>
          </div>
        </>
      )}
    </FriedaDialog>
  )
}

function AddPointsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [value, setValue] = React.useState(250)
  const options = [
    { points: 100, cost: "$10" },
    { points: 250, cost: "$22" },
    { points: 500, cost: "$40" },
    { points: 1000, cost: "$75" },
  ]
  return (
    <FriedaDialog open={open} onOpenChange={onOpenChange} title="Add points" description="Points are charged to your main debit card.">
      <div role="radiogroup" aria-label="Points pack" className="mt-6 grid grid-cols-2 gap-3">
        {options.map((o) => (
          <button
            key={o.points}
            type="button"
            role="radio"
            aria-checked={value === o.points}
            onClick={() => setValue(o.points)}
            className={cn(
              "rounded-[14px] border p-4 text-left transition-colors",
              value === o.points ? "border-teal bg-teal/10" : "border-white/10 hover:bg-white/[0.04]"
            )}
          >
            <Points value={o.points} className="text-[18px]" />
            <div className="mt-1 text-[13px] text-subtle">{o.cost}</div>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={cn(primaryAction, "mt-6 h-12 w-full text-[16px]")}
        onClick={() => {
          actions.addPoints(value)
          toast.success(`${value.toLocaleString("en-US")} points added`)
          onOpenChange(false)
        }}
      >
        <Plus /> Add {value.toLocaleString("en-US")} points
      </button>
    </FriedaDialog>
  )
}

export default function RewardsPage() {
  const [range, setRange] = useRange("today")
  const points = useFrieda((s) => s.points)
  const orders = useFrieda((s) => s.orders)
  const [redeeming, setRedeeming] = React.useState<Reward | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [allOrders, setAllOrders] = React.useState(false)

  const ordered = orders.map((id) => catalogue.find((r) => r.id === id)).filter((r): r is Reward => !!r)
  const shown = allOrders ? ordered : ordered.slice(0, 4)

  return (
    <>
      <PageHeader title="Rewards" actions={<DateRangeButton value={range} onChange={setRange} />} />

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,411px)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
          <Panel title="Available points">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[30px] leading-none tabular-nums">{points.toLocaleString("en-US")}</div>
                <span className="mt-3 flex items-center gap-1.5 text-[14px] text-teal">
                  <BadgeCheck className="size-[19px] fill-teal text-[#1f1f1f]" strokeWidth={2} /> Available points
                </span>
              </div>
              <button type="button" className={cn(outlineAction, "mt-1")} onClick={() => setAdding(true)}>
                <Plus /> Add points
              </button>
            </div>
            <ProgressBar value={Math.min(points, rewards.nextTier)} max={rewards.nextTier} className="mt-6 h-[58px] rounded-[12px]" />
            <p className="mt-3 text-[13px] text-subtle">
              {points >= rewards.nextTier
                ? "You’ve reached Gold tier."
                : `${(rewards.nextTier - points).toLocaleString("en-US")} points to Gold tier`}
            </p>
          </Panel>

          <Panel title="Order again" action={<SectionToggle expanded={allOrders} onToggle={() => setAllOrders((a) => !a)} />}>
            {shown.length ? (
              <ul className={cn("relative space-y-4", !allOrders && ordered.length > 3 && "max-h-[384px] overflow-hidden")}>
                {shown.map((r) => (
                  <li key={r.id} className="frieda-tile flex items-center gap-5 px-5 py-4">
                    <div className="grid size-[62px] shrink-0 place-items-center">
                      <RewardArt art={r.art} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[16px]">{r.name}</div>
                      <Points value={r.points} className="mt-1" />
                    </div>
                    <button
                      type="button"
                      aria-label={`Order ${r.name} again`}
                      onClick={() => setRedeeming(r)}
                      className="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-[#5b5b5b] text-white transition-colors hover:border-teal hover:text-teal"
                    >
                      <ShoppingBasket className="size-[18px]" strokeWidth={1.7} />
                    </button>
                  </li>
                ))}
                {!allOrders && ordered.length > 3 && (
                  <li aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#232323] to-transparent" />
                )}
              </ul>
            ) : (
              <p className="py-8 text-center text-subtle">Awards you redeem will show up here.</p>
            )}
          </Panel>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <AwardsShelf title="Popular awards" items={rewards.popular} onRedeem={setRedeeming} />
          <AwardsShelf title="Newly added awards" items={rewards.newest} onRedeem={setRedeeming} />
        </div>
      </div>

      <RedeemDialog reward={redeeming} onClose={() => setRedeeming(null)} />
      <AddPointsDialog open={adding} onOpenChange={setAdding} />
    </>
  )
}
