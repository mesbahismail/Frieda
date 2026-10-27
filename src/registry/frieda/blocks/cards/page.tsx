"use client"

import * as React from "react"
import Link from "next/link"
import { Info, PauseCircle, Pencil, Play, Plus, Trash2, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { cardBudget, cardColors, cardEarners, type CardColor } from "@/registry/frieda/lib/data"
import { money } from "@/registry/frieda/lib/format"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { useAmountDialog } from "@/registry/frieda/components/frieda/amount-dialog"
import { CardCarousel } from "@/registry/frieda/components/frieda/bank-card"
import { ProgressBar, ValueBars } from "@/registry/frieda/components/frieda/charts"
import { ConfirmDialog, FriedaDialog, fieldClass } from "@/registry/frieda/components/frieda/dialogs"
import { DateRangeButton, PageHeader, primaryAction, useRange, vary } from "@/registry/frieda/components/frieda/page-header"
import { Money, Panel, Pill } from "@/registry/frieda/components/frieda/panel"
import { TransactionList } from "@/registry/frieda/components/frieda/transactions"

function CardAction({
  icon: Icon,
  label,
  onClick,
  pressed,
  danger,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  pressed?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="group flex flex-col items-center gap-2.5 text-[15px] text-[#c4c4c4] transition-colors hover:text-white"
    >
      <span
        className={cn(
          "grid size-[46px] place-items-center rounded-[12px] transition-[transform,background-color] group-hover:-translate-y-0.5",
          danger ? "bg-[#7d0f24] text-[#ff4d6d] group-hover:bg-[#93142c]" : "bg-teal-deep text-[#3ad6be] group-hover:bg-[#0b6d63]",
          pressed && "bg-teal text-[#123] group-hover:bg-teal"
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.7} />
      </span>
      {label}
    </button>
  )
}

function EditCardDialog({ cardId, onOpenChange }: { cardId: string | null; onOpenChange: (open: boolean) => void }) {
  const card = useFrieda((s) => s.cards.find((c) => c.id === cardId))
  const [holder, setHolder] = React.useState("")
  const [color, setColor] = React.useState<CardColor>("teal")
  const [prevId, setPrevId] = React.useState<string | null>(null)

  if (cardId !== prevId) {
    setPrevId(cardId)
    if (card) {
      setHolder(card.holder)
      setColor(card.color)
    }
  }

  return (
    <FriedaDialog open={!!cardId} onOpenChange={onOpenChange} title="Edit card" description="Update the name on the card and its color.">
      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (!card || !holder.trim()) return
          actions.updateCard(card.id, { holder: holder.trim(), color })
          toast.success("Card updated")
          onOpenChange(false)
        }}
      >
        <label className="block">
          <span className="mb-2 block text-[13px] text-subtle">Card holder</span>
          <input value={holder} onChange={(e) => setHolder(e.target.value)} className={fieldClass} />
        </label>
        <div>
          <span className="mb-2 block text-[13px] text-subtle">Color</span>
          <div className="flex gap-3">
            {cardColors.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.id}
                aria-pressed={color === c.id}
                onClick={() => setColor(c.id)}
                className={cn("size-8 rounded-full ring-offset-2 ring-offset-[#252525] transition", color === c.id && "ring-2 ring-white")}
                style={{ background: c.swatch }}
              />
            ))}
          </div>
        </div>
        <button type="submit" disabled={!holder.trim()} className={cn(primaryAction, "h-12 w-full text-[16px]")}>
          Save changes
        </button>
      </form>
    </FriedaDialog>
  )
}

export default function CardsPage() {
  const [range, setRange] = useRange("today")
  const cards = useFrieda((s) => s.cards)
  const transactions = useFrieda((s) => s.transactions)
  const [index, setIndex] = React.useState(0)
  const [reveal, setReveal] = React.useState(false)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const topup = useAmountDialog()

  const active = Math.min(index, Math.max(0, cards.length - 1))
  const card = cards[active]
  const earners = vary(cardEarners.map((e) => e.value), range)
  const spent = vary([cardBudget.spent], range)[0]

  return (
    <>
      <PageHeader
        title="My cards"
        actions={
          <>
            <DateRangeButton value={range} onChange={setRange} />
            <Link href="/cards/new" className={primaryAction}>
              <Plus /> New card
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 gap-6">
          <Panel title="My cards">
            {card ? (
              <>
                <CardCarousel
                  cards={cards}
                  active={active}
                  onChange={(i) => {
                    setIndex(i)
                    setReveal(false)
                  }}
                  reveal={reveal}
                />
                <div className="mt-7 flex items-center gap-4 text-[15px] text-[#bdbdbd]">
                  Card actions <span className="h-px flex-1 bg-white/[0.08]" />
                </div>
                <div className="mt-5 flex justify-around gap-2">
                  <CardAction icon={Plus} label="Top up" onClick={() => topup.open("topup", undefined, (amount) => actions.updateCard(card.id, { balance: card.balance + amount }))} />
                  <CardAction icon={Info} label="Details" pressed={reveal} onClick={() => setReveal((r) => !r)} />
                  <CardAction
                    icon={card.frozen ? Play : PauseCircle}
                    label={card.frozen ? "Unfreeze" : "Freeze"}
                    pressed={card.frozen}
                    onClick={() => {
                      actions.updateCard(card.id, { frozen: !card.frozen })
                      toast(card.frozen ? "Card unfrozen" : "Card frozen", {
                        description: card.frozen ? "Payments are enabled again." : "New payments will be declined until you unfreeze it.",
                      })
                    }}
                  />
                  <CardAction icon={Pencil} label="Edit" onClick={() => setEditing(card.id)} />
                  <CardAction icon={Trash2} label="Delete" danger onClick={() => setDeleting(true)} />
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center py-12 text-center">
                <div>
                  <p className="text-subtle">You don’t have any cards yet.</p>
                  <Link href="/cards/new" className={cn(primaryAction, "mt-4")}>
                    <Plus /> Add a card
                  </Link>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Top earners" bodyClassName="min-h-[220px]">
            <ValueBars data={cardEarners.map((e, i) => ({ ...e, value: earners[i] }))} max={10500} />
          </Panel>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-rows-[auto_minmax(0,1fr)]">
          <Panel title="Card budget">
            <ProgressBar value={spent} max={cardBudget.limit} className="mt-1" />
            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <Money value={spent} className="text-[34px] leading-none sm:text-[38px]" />
                <span className="text-[18px] text-[#9a9a9a]">/${cardBudget.limit.toLocaleString("de-DE")}</span>
              </div>
              <Pill>{money(Math.max(0, cardBudget.limit - spent))} Left</Pill>
            </div>
          </Panel>

          <Panel title="Recent transactions" className="lg:max-h-[488px]" bodyClassName="-mr-3">
            <TransactionList items={transactions.slice(0, 12)} className="frieda-scroll min-h-0 flex-1 overflow-y-auto pr-3" />
          </Panel>
        </div>
      </div>

      <EditCardDialog cardId={editing} onOpenChange={(o) => !o && setEditing(null)} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this card?"
        description={card ? `${card.type} ending ${card.number.slice(-4)} will be removed from Frieda.` : undefined}
        confirm="Delete card"
        onConfirm={() => {
          if (!card) return
          actions.removeCard(card.id)
          setIndex(0)
          toast.success("Card deleted")
        }}
      />
      {topup.dialog}
    </>
  )
}
