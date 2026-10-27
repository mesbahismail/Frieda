"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MessagesSquare } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import type { ChatMessageData } from "@/components/ui/chat/types"
import { avatarSrc, support, user, type Ticket, type TicketStatus } from "@/registry/frieda/lib/data"
import { actions, getFriedaState, useFrieda } from "@/registry/frieda/lib/store"
import { FriedaDialog, fieldClass } from "./dialogs"
import { primaryAction } from "./page-header"

export const ticketTabs: { id: TicketStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "feedback", label: "Feedback" },
  { id: "closed", label: "Closed" },
]

export const supportAgent = { id: support.id, name: support.name, avatar: avatarSrc(support.id), status: "online" as const }
export const supportMe = { id: "me", name: user.displayName, avatar: avatarSrc(user.avatar), status: "online" as const }

let counter = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`

/** Message builders. Pass `timestamp` in `extra` to backdate a message. */
export function myMessage(text: string, extra?: Partial<ChatMessageData>): ChatMessageData {
  return { id: uid("me"), senderId: supportMe.id, senderName: supportMe.name, senderAvatar: supportMe.avatar, text, timestamp: Date.now(), status: "read", ...extra }
}

export function agentMessage(text: string, extra?: Partial<ChatMessageData>): ChatMessageData {
  return { id: uid("sam"), senderId: supportAgent.id, senderName: supportAgent.name, senderAvatar: supportAgent.avatar, text, timestamp: Date.now(), ...extra }
}

export function systemMessage(text: string, extra?: Partial<ChatMessageData>): ChatMessageData {
  return { id: uid("sys"), senderId: "system", senderName: "System", isSystem: true, systemEvent: text, timestamp: Date.now(), ...extra }
}

/**
 * Shows the agent typing in a ticket, then posts their reply.
 * Runs outside React so the reply still lands if you leave the page.
 */
export function queueSupportReply(ticketId: string, text: string, extra?: Partial<ChatMessageData>) {
  actions.setSupportTyping(ticketId)
  window.setTimeout(
    () => {
      actions.addMessage(ticketId, agentMessage(text, extra))
      if (getFriedaState().supportTyping === ticketId) actions.setSupportTyping(null)
    },
    Math.min(3200, 1100 + text.length * 14)
  )
}

export function TicketTabs({
  value,
  onChange,
  tickets,
  className,
}: {
  value: TicketStatus
  onChange: (value: TicketStatus) => void
  tickets: Ticket[]
  className?: string
}) {
  return (
    <div role="tablist" aria-label="Ticket status" className={cn("flex border-b border-white/[0.08]", className)}>
      {ticketTabs.map((t) => {
        const count = tickets.filter((k) => k.status === t.id).length
        const active = value === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative -mb-px flex h-[44px] flex-1 items-center justify-center gap-2 border-b-2 text-[16px] transition-colors",
              active ? "border-teal text-white" : "border-transparent text-[#a3a3a3] hover:text-white"
            )}
          >
            {t.label}
            <span className={cn("grid h-5 min-w-5 place-items-center rounded-full border px-1 text-[11px] tabular-nums", active ? "border-white/80" : "border-[#6b6b6b]")}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function TicketRow({
  ticket,
  active,
  onClick,
  className,
}: {
  ticket: Ticket
  active?: boolean
  onClick: () => void
  className?: string
}) {
  const today = /AM|PM/.test(ticket.time)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-[12px] px-[11px] py-[11px] text-left transition-colors",
        active ? "bg-[#333]" : "hover:bg-white/[0.03]",
        className
      )}
    >
      <span className="grid size-[46px] shrink-0 place-items-center rounded-full bg-[#3a3a3a] text-[#e6e6e6]">
        <MessagesSquare className="size-5" strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[12px] text-[#bdbdbd]">
          {today ? "Today" : ticket.time}
          {today && (
            <>
              <span className="size-[3px] rounded-full bg-[#777]" /> {ticket.time}
            </>
          )}
          {ticket.status === "closed" && <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 text-[10px] text-subtle">Closed</span>}
        </span>
        <span className="mt-1 block truncate text-[16px] text-[#f2f2f2]">{ticket.title}</span>
      </span>
    </button>
  )
}

const categories = ["Account & login", "Cards", "Transfers", "Budget & analytics", "Something else"]

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

/** "New ticket" dialog. Creates the ticket, seeds its chat and opens it. */
export function NewTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState(categories[0])
  const [message, setMessage] = React.useState("")
  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setTitle("")
      setCategory(categories[0])
      setMessage("")
    }
  }
  const valid = title.trim().length >= 4 && message.trim().length >= 4

  return (
    <FriedaDialog open={open} onOpenChange={onOpenChange} title="New ticket" description="Our support team usually replies within a few hours.">
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          const id = `k-${Date.now().toString(36)}`
          actions.addTicket({ id, title: title.trim(), status: "open", time: nowTime() })
          actions.setThread(id, [systemMessage(`${category} ticket opened`), myMessage(message.trim(), { status: "sent" })])
          queueSupportReply(id, `Hi ${user.firstName}, thanks for opening a ticket! I’m on it and will reply here as soon as I know more.`)
          toast.success("Ticket created", { description: `${support.name} will reply here shortly.` })
          onOpenChange(false)
          router.push(`/help/tickets?ticket=${id}`)
        }}
      >
        <label className="block">
          <span className="mb-2 block text-[13px] text-subtle">Subject</span>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My card was declined" className={fieldClass} />
        </label>
        <div>
          <span className="mb-2 block text-[13px] text-subtle">Topic</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cn(
                  "h-8 rounded-full border px-3 text-[13px] transition-colors",
                  category === c ? "border-teal bg-teal/10 text-teal" : "border-white/10 text-[#d6d6d6] hover:bg-white/5"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-[13px] text-subtle">How can we help?</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Describe what happened"
            className={cn(fieldClass, "h-auto resize-none py-3 leading-relaxed")}
          />
        </label>
        <button type="submit" disabled={!valid} className={cn(primaryAction, "!mt-6 h-12 w-full text-[16px]")}>
          Create ticket
        </button>
      </form>
    </FriedaDialog>
  )
}

/** Tickets from the store, newest first. */
export function useTickets() {
  return useFrieda((s) => s.tickets)
}
