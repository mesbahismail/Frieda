"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpRight,
  CreditCard,
  Globe,
  MailOpen,
  ShoppingCart,
  Ticket,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { activity, balance, goal, personById, quickTransfer, user } from "@/registry/frieda/lib/data"
import { useFrieda } from "@/registry/frieda/lib/store"
import { useAmountDialog } from "@/registry/frieda/components/frieda/amount-dialog"
import { CardStack, Dots } from "@/registry/frieda/components/frieda/bank-card"
import { Gauge, PairBars, RingProgress } from "@/registry/frieda/components/frieda/charts"
import { DateRangeButton, PageHeader, useRange, vary } from "@/registry/frieda/components/frieda/page-header"
import { Money, Panel, PanelMenu } from "@/registry/frieda/components/frieda/panel"
import { PersonAvatar } from "@/registry/frieda/components/frieda/person-avatar"
import { TransactionRow } from "@/registry/frieda/components/frieda/transactions"
import { WidgetCard } from "@/registry/frieda/components/frieda/widgets"

function FlowTile({
  icon: Icon,
  label,
  value,
  share,
  color,
}: {
  icon: LucideIcon
  label: string
  value: number
  share: number
  color: string
}) {
  return (
    <div className="frieda-tile flex items-center justify-between gap-3 px-[15px] pt-[17px] pb-[13px]">
      <div className="min-w-0">
        <span className="grid size-[19px] place-items-center rounded-[5px] border-[1.5px]" style={{ borderColor: color, color }}>
          <Icon className="size-3" strokeWidth={2.4} />
        </span>
        <div className="mt-[13px] text-[14px] leading-none text-[#e0e0e0]">{label}</div>
        <Money value={value} className="mt-[9px] block text-[24px] leading-none" />
      </div>
      <RingProgress value={share} color={color} size={64} stroke={6} className="mr-1 [&>div]:text-[17px]" />
    </div>
  )
}

export function QuickLinks({ items }: { items: { icon: LucideIcon; label: string; onClick: () => void }[] }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-3 gap-x-2 gap-y-5 @[340px]:grid-cols-4">
        {items.map(({ icon: Icon, label, onClick }) => (
          <button key={label} type="button" onClick={onClick} className="group flex flex-col items-center gap-2.5 text-[15px] text-[#c4c4c4] transition-colors hover:text-white">
            <span className="grid size-[46px] place-items-center rounded-[12px] bg-teal-deep text-[#3ad6be] transition-[transform,background-color] group-hover:-translate-y-0.5 group-hover:bg-[#0b6d63]">
              <Icon className="size-[22px]" strokeWidth={1.7} />
            </span>
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [range, setRange] = useRange("today")
  const cards = useFrieda((s) => s.cards)
  const transactions = useFrieda((s) => s.transactions)
  const pinned = useFrieda((s) => s.pinnedWidgets)
  const [cardIndex, setCardIndex] = React.useState(0)
  const send = useAmountDialog()

  const expenses = vary(activity.map((a) => a.expense), range)
  const incomes = vary(activity.map((a) => a.income), range)
  const series = activity.map((a, i) => ({ month: a.month, expense: expenses[i], income: incomes[i] }))
  const card = cards[Math.min(cardIndex, cards.length - 1)]

  const links = [
    { icon: ArrowUpRight, label: "Send", onClick: () => send.open("send") },
    { icon: ArrowDownLeft, label: "Receive", onClick: () => send.open("request") },
    { icon: Globe, label: "Internet", onClick: () => toast("Internet bill paid: $49.99") },
    { icon: ShoppingCart, label: "Shop", onClick: () => router.push("/rewards") },
    { icon: Ticket, label: "Tickets", onClick: () => router.push("/help/tickets") },
    { icon: MailOpen, label: "Receipts", onClick: () => router.push("/documents") },
    { icon: CreditCard, label: "New card", onClick: () => router.push("/cards/new") },
    { icon: Wallet, label: "Add budget", onClick: () => router.push("/budget") },
  ]

  return (
    <>
      <PageHeader title={`Hi, ${user.firstName}`} current="Dashboard" actions={<DateRangeButton value={range} onChange={setRange} />} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.04fr)_minmax(300px,1fr)]">
        <div className="grid min-w-0 gap-6 xl:grid-rows-[minmax(376px,auto)_minmax(328px,auto)]">
          {/* Balance + activity */}
          <section className="frieda-card grid min-w-0 overflow-hidden lg:grid-cols-[326px_minmax(0,1fr)]">
            <div className="flex flex-col gap-[25px] rounded-[18px] bg-[linear-gradient(180deg,#1a1a1a,#1d1d1d)] p-[22px] pt-[26px] shadow-[12px_0_30px_-18px_rgb(0_0_0/0.7)]">
              <div>
                <Money value={balance.total + (range === "today" ? 0 : 1240)} className="block text-[44px] leading-none tracking-[-0.01em]" />
                <div className="mt-[14px] text-[16px] leading-none text-[#bdbdbd]">Total balance</div>
              </div>
              <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-1">
                <FlowTile icon={ArrowUp} label="Income" value={balance.income} share={balance.incomeShare} color="var(--teal)" />
                <FlowTile icon={ArrowDown} label="Expense" value={balance.expense} share={100 - balance.incomeShare} color="#ff4d6d" />
              </div>
            </div>
            <div className="flex min-h-[300px] min-w-0 flex-col p-[22px] pl-[30px]">
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] text-[#ececec]">Activity</h2>
                <PanelMenu label="Activity" />
              </header>
              <PairBars data={series} className="pt-6" />
            </div>
          </section>

          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <Panel title="Goals" bodyClassName="items-center justify-end pb-2">
              <Gauge value={goal.saved} max={goal.target} className="max-w-[284px]">
                <span className="absolute bottom-[2%] left-1/2 grid size-[62px] -translate-x-1/2 place-items-center rounded-full bg-teal text-[#123]">
                  <Trophy className="size-7" strokeWidth={1.7} />
                </span>
              </Gauge>
              <Money value={goal.saved} className="mt-[22px] text-[44px] leading-none" />
              <span className="mt-[10px] text-[24px] leading-none text-[#bdbdbd]">/${goal.target.toLocaleString("de-DE")}</span>
            </Panel>
            <Panel title="My cards" bodyClassName="justify-between">
              {card ? (
                <button type="button" className="mx-auto w-full max-w-[300px] pt-4 text-left" onClick={() => router.push("/cards")}>
                  <CardStack card={card} />
                </button>
              ) : (
                <p className="py-10 text-center text-subtle">No cards yet.</p>
              )}
              <Dots count={cards.length} active={cardIndex} onSelect={setCardIndex} className="mt-5" />
            </Panel>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[auto_1fr_auto]">
          <Panel title="Quick links">
            <QuickLinks items={links} />
          </Panel>
          <Panel title="Recent transactions">
            <div className="-my-1">
              {transactions.slice(0, 3).map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </Panel>
          <Panel title="Quick transfer" className="md:col-span-2 xl:col-span-1" bodyClassName="-mx-[22px] -mb-2">
            <div className="frieda-no-scrollbar flex gap-3 overflow-x-auto px-[22px] pb-2">
              {quickTransfer.map((id) => {
                const p = personById(id)
                if (!p) return null
                return (
                  <button key={id} type="button" onClick={() => send.open("send", id)} className="group flex w-[62px] shrink-0 flex-col items-center gap-2 text-[14px] text-[#c4c4c4] hover:text-white">
                    <PersonAvatar id={id} name={p.name} className="size-[54px] transition-transform group-hover:-translate-y-0.5" />
                    <span className="truncate">{p.name.split(" ")[0]}</span>
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>

      {pinned.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-[18px] text-[#ececec]">Pinned widgets</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pinned.map((id) => (
              <WidgetCard key={id} id={id} removable />
            ))}
          </div>
        </section>
      )}
      {send.dialog}
    </>
  )
}
