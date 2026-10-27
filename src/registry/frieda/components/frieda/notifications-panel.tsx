"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDownLeft,
  ArrowUpRight,
  BellOff,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileText,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { money } from "@/registry/frieda/lib/format"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { useAmountDialog } from "./amount-dialog"
import { ProgressBar } from "./charts"
import { Money } from "./panel"
import { PersonAvatar } from "./person-avatar"
import { SidePanel, panelButton } from "./side-panel"

type Category = "payments" | "budget" | "awards" | "others"

type Note = { id: string; category: Category; title: string; time: string; icon: LucideIcon; color: string } & (
  | { kind: "received"; amount: number }
  | { kind: "budget"; spent: number; limit: number }
  | { kind: "award"; value: number; max: number }
  | { kind: "request"; amount: number; personId: string }
  | { kind: "info"; body: string; href: string; cta: string }
)

const notes: Note[] = [
  { id: "n1", category: "payments", kind: "received", title: "You received money", time: "Today", amount: 25000, icon: ArrowUpRight, color: "#63e9e0" },
  { id: "n2", category: "budget", kind: "budget", title: "New alert for budget", time: "Today", spent: 21820, limit: 20000, icon: CircleDollarSign, color: "#a990ff" },
  { id: "n3", category: "awards", kind: "award", title: "New award unlocked", time: "Today", value: 10000, max: 10000, icon: Trophy, color: "#fdcc53" },
  { id: "n4", category: "payments", kind: "request", title: "Ahmed Halici requested money from you", time: "Today", amount: 10000, personId: "ahmed-halici", icon: ArrowDownLeft, color: "#ff6b81" },
  { id: "n5", category: "payments", kind: "received", title: "Brandon Philips sent you money", time: "Yesterday", amount: 20000, icon: ArrowUpRight, color: "#63e9e0" },
  { id: "n6", category: "budget", kind: "budget", title: "Groceries are close to the limit", time: "Yesterday", spent: 2860, limit: 3200, icon: CircleDollarSign, color: "#a990ff" },
  { id: "n7", category: "others", kind: "info", title: "Your October statement is ready", time: "Yesterday", body: "Download it from Documents or ask Frieda AI for a summary.", href: "/documents", cta: "Open", icon: FileText, color: "#63e9e0" },
  { id: "n8", category: "payments", kind: "request", title: "Hafsa Idrissi requested money from you", time: "Oct 31", amount: 180, personId: "hafsa", icon: ArrowDownLeft, color: "#ff6b81" },
  { id: "n9", category: "awards", kind: "award", title: "Savings streak: 6 months", time: "Oct 30", value: 6, max: 6, icon: Trophy, color: "#fdcc53" },
  { id: "n10", category: "payments", kind: "received", title: "Carlos Mendes paid you back", time: "Oct 18", amount: 1250, icon: ArrowUpRight, color: "#63e9e0" },
  { id: "n11", category: "budget", kind: "budget", title: "Shopping budget reset", time: "Oct 1", spent: 0, limit: 2500, icon: CircleDollarSign, color: "#a990ff" },
  { id: "n12", category: "others", kind: "info", title: "New sign-in from Safari on macOS", time: "Sep 29", body: "If this wasn’t you, freeze your cards and contact support.", href: "/settings", cta: "Review", icon: ShieldCheck, color: "#63e9e0" },
  { id: "n13", category: "payments", kind: "received", title: "You received money", time: "Sep 28", amount: 20000, icon: ArrowUpRight, color: "#63e9e0" },
  { id: "n14", category: "payments", kind: "received", title: "Ahmed Halici sent you money", time: "Sep 14", amount: 640, icon: ArrowUpRight, color: "#63e9e0" },
]

const tabs: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "payments", label: "Payments" },
  { id: "budget", label: "Budget" },
  { id: "awards", label: "Awards" },
  { id: "others", label: "Others" },
]

function NoteBody({ note, onPay }: { note: Note; onPay: (personId: string) => void }) {
  const router = useRouter()
  const claimed = useFrieda((s) => s.claimed.includes(note.id))
  const cardClass = "frieda-tile mt-4 rounded-[18px] bg-[linear-gradient(180deg,#212121,#232323)] p-5 sm:p-6"

  switch (note.kind) {
    case "received":
      return (
        <div className={cn(cardClass, "flex items-center justify-between gap-4")}>
          <Money value={note.amount} className="text-[30px] leading-none sm:text-[40px]" />
          <button
            type="button"
            className={panelButton}
            onClick={() => {
              actions.closePanel()
              router.push("/transactions")
            }}
          >
            Check <ChevronRight />
          </button>
        </div>
      )
    case "budget": {
      const over = note.spent - note.limit
      return (
        <div className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <Money value={note.spent} className="text-[30px] leading-none sm:text-[40px]" />
              <span className="text-[18px] text-[#9a9a9a] sm:text-[22px]">/${note.limit.toLocaleString("de-DE")}</span>
            </div>
            {over > 0 ? (
              <span className="rounded-[8px] border border-rose px-3 py-1.5 text-[14px] text-[#ff5a78]">{money(over)} Over the budget</span>
            ) : (
              <span className="rounded-[8px] border border-teal/50 px-3 py-1.5 text-[14px] text-teal">{money(note.limit - note.spent)} left</span>
            )}
          </div>
          <ProgressBar value={note.spent} max={note.limit} className="mt-5 h-[46px] sm:h-[62px]" />
        </div>
      )
    }
    case "award":
      return (
        <div className={cn(cardClass, "flex items-center gap-4 sm:gap-5")}>
          <span className="grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-teal text-teal sm:size-[66px]">
            <Trophy className="size-7" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] text-[#e5e5e5] sm:text-[17px]">{note.title}</div>
            <div className="mt-1 flex items-baseline gap-2">
              {note.max > 100 ? (
                <>
                  <Money value={note.value} className="text-[28px] leading-none sm:text-[34px]" />
                  <span className="text-[17px] text-[#9a9a9a]">/${note.max.toLocaleString("de-DE")}</span>
                </>
              ) : (
                <span className="text-[28px] leading-none sm:text-[34px]">
                  {note.value}
                  <span className="text-[17px] text-[#9a9a9a]">/{note.max} months</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={cn(panelButton, claimed && "border-teal/60 text-teal")}
            disabled={claimed}
            onClick={() => actions.claim(note.id)}
          >
            <Check /> {claimed ? "Claimed" : "Claim"}
          </button>
        </div>
      )
    case "request":
      return (
        <div className={cn(cardClass, "flex items-center gap-4")}>
          <PersonAvatar id={note.personId} className="size-[58px] bg-[#3a3a3a]" />
          <Money value={note.amount} className="flex-1 text-[30px] leading-none sm:text-[40px]" />
          <button type="button" className={panelButton} onClick={() => onPay(note.personId)}>
            Pay <ChevronRight />
          </button>
        </div>
      )
    case "info":
      return (
        <div className={cn(cardClass, "flex items-center gap-4")}>
          <p className="flex-1 text-[14px] leading-relaxed text-[#bdbdbd]">{note.body}</p>
          <button
            type="button"
            className={panelButton}
            onClick={() => {
              actions.closePanel()
              router.push(note.href)
            }}
          >
            {note.cta} <ChevronRight />
          </button>
        </div>
      )
  }
}

export function NotificationsPanel() {
  const open = useFrieda((s) => s.panel === "notifications")
  const cleared = useFrieda((s) => s.notificationsCleared)
  const [tab, setTab] = React.useState<(typeof tabs)[number]["id"]>("all")
  const pay = useAmountDialog()
  const list = cleared ? [] : notes
  const visible = tab === "all" ? list : list.filter((n) => n.category === tab)

  return (
    <SidePanel
      open={open}
      onOpenChange={(o) => (o ? actions.openPanel("notifications") : actions.closePanel())}
      title="Notifications"
      actions={
        <button type="button" className={panelButton} onClick={actions.clearNotifications} disabled={cleared}>
          Clear all
        </button>
      }
    >
      <div role="tablist" className="frieda-no-scrollbar mx-5 flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.08] sm:mx-[37px] sm:gap-3">
        {tabs.map((t) => {
          const count = t.id === "all" ? list.length : list.filter((n) => n.category === t.id).length
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex h-[52px] shrink-0 items-center gap-2 px-3 text-[17px] transition-colors sm:px-5",
                active ? "text-white" : "text-[#b5b5b5] hover:text-white"
              )}
            >
              {t.label}
              <span className="grid h-[26px] min-w-[26px] place-items-center rounded-full border border-current/60 px-1.5 text-[13px] tabular-nums">
                {count}
              </span>
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-teal" />}
            </button>
          )
        })}
      </div>
      <div className="frieda-scroll min-h-0 flex-1 overflow-y-auto px-5 pt-8 pb-10 sm:px-[37px]">
        {visible.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-subtle">
            <div>
              <BellOff className="mx-auto mb-3 size-10 text-faint" strokeWidth={1.4} />
              You’re all caught up.
            </div>
          </div>
        ) : (
          <ol className="relative">
            {visible.map((note, i) => {
              const Icon = note.icon
              return (
                <li key={note.id} className="relative flex gap-4 pb-8 last:pb-0 sm:gap-6">
                  {i < visible.length - 1 && <span className="absolute top-[58px] bottom-2 left-[22px] w-[2px] rounded-full bg-[#3c3c3c] sm:left-[23px]" />}
                  <span className="grid size-[46px] shrink-0 place-items-center rounded-full text-[#1d1d1d]" style={{ background: note.color }}>
                    <Icon className="size-[22px]" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[17px] leading-snug text-white sm:text-[18px]">{note.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[13px] text-[#a6a6a6]">
                      {note.time} <span className="size-1 rounded-full bg-[#777]" /> 12:34 AM
                    </div>
                    <NoteBody note={note} onPay={(id) => pay.open("send", id)} />
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
      {pay.dialog}
    </SidePanel>
  )
}
