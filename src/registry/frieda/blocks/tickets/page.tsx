"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, CircleCheck, Download, Ellipsis, FileText, MessageSquarePlus, Plus, RotateCcw, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { ChatComposer, ChatMessage, ChatProvider, ChatSystemMessage } from "@/components/ui/chat/chat"
import { useAutoScroll } from "@/components/ui/chat/hooks"
import { validateFile } from "@/components/ui/chat/security"
import type { ChatMessageData } from "@/components/ui/chat/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { support, TODAY, transactions, user, type Ticket, type TicketStatus } from "@/registry/frieda/lib/data"
import { downloadBlob, makePdf } from "@/registry/frieda/lib/download"
import { money } from "@/registry/frieda/lib/format"
import { actions, getFriedaState, useFrieda } from "@/registry/frieda/lib/store"
import { startVoiceInput } from "@/registry/frieda/lib/voice"
import { FriedaDialog, fieldClass } from "@/registry/frieda/components/frieda/dialogs"
import { outlineAction, PageHeader, primaryAction } from "@/registry/frieda/components/frieda/page-header"
import { PersonAvatar } from "@/registry/frieda/components/frieda/person-avatar"
import {
  agentMessage,
  myMessage,
  NewTicketDialog,
  queueSupportReply,
  supportMe,
  systemMessage,
  TicketRow,
  TicketTabs,
} from "@/registry/frieda/components/frieda/support"

// ─── Conversation data ───────────────────────────────────────────────────────

const statement = { name: "February 2024 Transactions.pdf", size: 943718, type: "application/pdf", url: "" }

const seeded = new Map<string, ChatMessageData[]>()

/** First conversation for tickets that don't have one yet (stable per ticket). */
function seedThread(ticket: Ticket) {
  const key = `${ticket.id}:${ticket.status}`
  if (!seeded.has(key)) seeded.set(key, buildThread(ticket))
  return seeded.get(key)!
}

function buildThread(ticket: Ticket): ChatMessageData[] {
  // Seeded chats end at the ticket's "12:34 AM" on the template's fixed today.
  const t = new Date(TODAY).setHours(0, 26)
  const min = (n: number) => t + n * 60_000
  if (ticket.id === "k2") {
    return [
      myMessage("Hi! My dashboard stopped loading the Activity chart after I added a new card. Could you take a look?", { timestamp: min(0) }),
      agentMessage("Sorry about that! While we look into it, here’s your latest statement so nothing is blocking you:", { timestamp: min(3), files: [statement] }),
      myMessage("Thanks. The chart is still empty though, even after a refresh.", { timestamp: min(5) }),
      agentMessage(
        "Got it. Your new card is still importing its history, which can take up to an hour. The Activity chart fills in on its own once that’s done. Could you check again in a bit and let me know?",
        { timestamp: min(7) }
      ),
      myMessage("Sure, I’ll check back later today.", { timestamp: min(8) }),
    ]
  }
  const thread = [
    myMessage(`${ticket.title}. Can you help?`, { timestamp: min(0) }),
    agentMessage(`Hi ${user.firstName}, thanks for reaching out! I’m looking into “${ticket.title}” now and will update you right here.`, { timestamp: min(2) }),
  ]
  if (ticket.status === "feedback") thread.push(agentMessage("Thanks for the feedback, I’ve shared it with the product team. 💚", { timestamp: min(4) }))
  if (ticket.status === "closed") {
    thread.push(agentMessage("This should be sorted now. I’m closing the ticket, but you can reopen it any time.", { timestamp: min(6) }), systemMessage("Ticket closed", { timestamp: min(6) }))
  }
  return thread
}

function autoReply(text: string): Partial<ChatMessageData> & { text: string } {
  const q = text.toLowerCase()
  if (/\b(statement|document|pdf|report|invoice)\b/.test(q)) {
    return { text: "Here’s your document:", files: [statement] }
  }
  if (/\b(card|frozen|freeze|limit)\b/.test(q)) {
    return { text: "I can see all three of your cards. If one is frozen, open My cards and tap Freeze again to unfreeze it. Limits can be raised from the same screen under Details." }
  }
  if (/\b(transfer|sent|send|stuck|ahmed)\b/.test(q)) {
    return { text: "Transfers between Frieda accounts are instant. I’ve nudged this one on our side, so it should land within a few minutes." }
  }
  if (/\b(access|login|log in|password|locked)\b/.test(q)) {
    return { text: `For your security I’ve sent a reset link to ${user.email}. It expires in 30 minutes.` }
  }
  if (/\b(thanks|thank you|great|perfect|awesome)\b/.test(q)) {
    return { text: "You’re welcome! Anything else I can help with? If not, feel free to close this ticket." }
  }
  if (/\b(hi|hello|hey)\b/.test(q)) {
    return { text: `Hi ${user.firstName}! What can I help you with today?` }
  }
  return { text: "Thanks, that helps. I’ve added it to your ticket and I’ll update you here as soon as I hear back from the team." }
}

function downloadFile(file: NonNullable<ChatMessageData["files"]>[number]) {
  if (file.url) {
    const a = document.createElement("a")
    a.href = file.url
    a.download = file.name
    a.click()
  } else {
    const rows = transactions.slice(0, 16).map((t) => `${t.date.slice(0, 10)}   ${t.title.padEnd(28, " ")} ${money(t.amount, { cents: true, signed: true })}`)
    downloadBlob(makePdf(file.name.replace(/\.pdf$/, ""), ["Frieda statement", "", ...rows]), file.name)
  }
  toast.success(`${file.name} downloaded`)
}

function fileSize(bytes: number) {
  return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────

function FileCard({ file }: { file: NonNullable<ChatMessageData["files"]>[number] }) {
  return (
    <div className="mt-4 flex items-center gap-4 rounded-[12px] bg-[#2b2b2b] px-3 py-3">
      <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#3c3c3c] text-[#d6d6d6]">
        <FileText className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] text-white">{file.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] tracking-wide text-[#a6a6a6] uppercase">
          {file.name.split(".").pop()} file <span className="size-1 rounded-full bg-[#777]" /> {fileSize(file.size)}
        </div>
      </div>
      <button
        type="button"
        aria-label={`Download ${file.name}`}
        onClick={() => downloadFile(file)}
        className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-teal text-[#123] transition-[filter] hover:brightness-110"
      >
        <Download className="size-4" />
      </button>
    </div>
  )
}

function SupportBubble({ message }: { message: ChatMessageData }) {
  return (
    <div className="flex items-end gap-3 sm:gap-4">
      <PersonAvatar id={support.id} name={support.name} tone="purple" className="size-[38px]" />
      <div className="max-w-[min(85%,410px)] min-w-0 rounded-[20px] border border-white/[0.06] bg-[#1f1f1f] px-4 pt-[18px] pb-4 shadow-[0_10px_30px_-20px_rgb(0_0_0/0.8)]">
        {message.replyTo && (
          <p className="mb-2 border-l-2 border-teal/70 pl-2 text-[13px] text-subtle">
            <span className="text-teal">{message.replyTo.senderName}</span> · {message.replyTo.text}
          </p>
        )}
        <p className="text-[15px] leading-[1.6] whitespace-pre-wrap text-[#f1f1f1]">{message.text}</p>
        {message.files?.map((file) => (
          <FileCard key={file.name} file={file} />
        ))}
      </div>
    </div>
  )
}

function MyBubble({ message }: { message: ChatMessageData }) {
  return (
    <div className="flex items-end justify-end gap-3 sm:gap-4">
      {/* chatcn bubble: hover it for reply, reactions, edit and delete */}
      <ChatMessage message={message} isOutgoing position="solo" className="!mt-0 max-w-[min(85%,410px)] min-w-0 [&>div]:max-w-full" />
      <PersonAvatar id={user.avatar} className="size-[38px] ring-2 ring-[#0f5d56]" />
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function EditDialog({ message, onClose, onSave }: { message: ChatMessageData | null; onClose: () => void; onSave: (text: string) => void }) {
  const [text, setText] = React.useState("")
  const [prev, setPrev] = React.useState<ChatMessageData | null>(null)
  if (message !== prev) {
    setPrev(message)
    if (message) setText(message.text ?? "")
  }
  return (
    <FriedaDialog open={!!message} onOpenChange={(o) => !o && onClose()} title="Edit message">
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          onSave(text.trim())
          onClose()
        }}
      >
        <textarea autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)} className={cn(fieldClass, "h-auto resize-none py-3")} />
        <button type="submit" disabled={!text.trim()} className={cn(primaryAction, "h-11 w-full")}>
          Save
        </button>
      </form>
    </FriedaDialog>
  )
}

const subscribeNoop = () => () => {}

function TicketsView() {
  // Chats are client state and show local times, so they render after hydration.
  const mounted = React.useSyncExternalStore(subscribeNoop, () => true, () => false)
  const router = useRouter()
  const params = useSearchParams()
  const tickets = useFrieda((s) => s.tickets)
  const threads = useFrieda((s) => s.threads)

  const fromUrl = params.get("ticket")
  const tabFromUrl = params.get("tab") as TicketStatus | null
  const urlTicket = tickets.find((t) => t.id === fromUrl)
  const [tab, setTab] = React.useState<TicketStatus>(urlTicket?.status ?? tabFromUrl ?? "open")
  const [selectedId, setSelectedId] = React.useState(fromUrl ?? (tabFromUrl && tabFromUrl !== "open" ? null : "k2"))
  const [query, setQuery] = React.useState("")
  const typingFor = useFrieda((s) => s.supportTyping)
  const [replyingTo, setReplyingTo] = React.useState<ChatMessageData | null>(null)
  const [editing, setEditing] = React.useState<ChatMessageData | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [mobileChat, setMobileChat] = React.useState(!!fromUrl)
  const timers = React.useRef<number[]>([])

  const [prevUrl, setPrevUrl] = React.useState(fromUrl)
  if (fromUrl !== prevUrl) {
    setPrevUrl(fromUrl)
    if (fromUrl) {
      setSelectedId(fromUrl)
      if (urlTicket) setTab(urlTicket.status)
      setMobileChat(true)
    }
  }

  const q = query.trim().toLowerCase()
  const list = tickets.filter((t) => t.status === tab && t.title.toLowerCase().includes(q))
  const ticket = tickets.find((t) => t.id === selectedId) ?? list[0]
  const messages = ticket ? (threads[ticket.id] ?? seedThread(ticket)) : []
  const { containerRef, scrollToBottom } = useAutoScroll(messages)
  const closed = ticket?.status === "closed"
  const typing = !!ticket && typingFor === ticket.id

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  // Jump to the latest message when switching tickets or when Samantha starts typing.
  React.useEffect(() => {
    scrollToBottom("instant")
  }, [ticket?.id, scrollToBottom])
  React.useEffect(() => {
    if (typing) scrollToBottom("smooth")
  }, [typing, scrollToBottom])

  function write(id: string, next: ChatMessageData[]) {
    actions.setThread(id, next)
  }

  /** Latest messages for a ticket, read at call time so timers never use a stale thread. */
  function current(id: string) {
    const state = getFriedaState()
    const t = state.tickets.find((k) => k.id === id)
    return state.threads[id] ?? (t ? seedThread(t) : [])
  }

  function send(text: string, extra?: Partial<ChatMessageData>) {
    if (!ticket || closed) return
    const quote = replyingTo ? { replyTo: { id: replyingTo.id, senderName: replyingTo.senderName, text: replyingTo.text ?? "" } } : {}
    const msg = myMessage(text, { status: "sent", ...quote, ...extra })
    write(ticket.id, [...current(ticket.id), msg])
    setReplyingTo(null)
    timers.current.push(
      window.setTimeout(() => write(ticket.id, current(ticket.id).map((m) => (m.id === msg.id ? { ...m, status: "read" as const } : m))), 700)
    )
    const answer = autoReply(text)
    const { text: replyText, ...rest } = answer
    queueSupportReply(ticket.id, replyText, rest)
  }

  function upload(files: File[]) {
    const ok = files.filter((f) => {
      const result = validateFile(f)
      if (!result.valid) toast.error(result.error ?? `${f.name} can’t be uploaded`)
      return result.valid
    })
    if (!ok.length || !ticket) return
    const msg = myMessage(ok.length === 1 ? `Sent ${ok[0].name}` : `Sent ${ok.length} files`, {
      files: ok.map((f) => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) })),
    })
    write(ticket.id, [...current(ticket.id), msg])
    queueSupportReply(ticket.id, "Thanks, I’ve got the file and attached it to your ticket.")
  }

  function patch(id: string, update: (m: ChatMessageData) => ChatMessageData | null) {
    if (!ticket) return
    write(
      ticket.id,
      current(ticket.id).flatMap((m) => {
        if (m.id !== id) return [m]
        const next = update(m)
        return next ? [next] : []
      })
    )
  }

  function react(id: string, emoji: string, add: boolean) {
    patch(id, (m) => {
      const reactions = [...(m.reactions ?? [])]
      const i = reactions.findIndex((r) => r.emoji === emoji)
      const has = i >= 0 && reactions[i].userIds.includes(supportMe.id)
      if (add && !has) {
        if (i >= 0) reactions[i] = { ...reactions[i], userIds: [...reactions[i].userIds, supportMe.id], count: reactions[i].count + 1 }
        else reactions.push({ emoji, userIds: [supportMe.id], count: 1 })
      } else if (has) {
        const r = reactions[i]
        if (r.count <= 1) reactions.splice(i, 1)
        else reactions[i] = { ...r, userIds: r.userIds.filter((u) => u !== supportMe.id), count: r.count - 1 }
      }
      return { ...m, reactions }
    })
  }

  function select(id: string) {
    setSelectedId(id)
    setReplyingTo(null)
    setMobileChat(true)
    router.replace(`/help/tickets?ticket=${id}`, { scroll: false })
  }

  function setStatus(status: TicketStatus) {
    if (!ticket) return
    actions.setTicketStatus(ticket.id, status)
    write(ticket.id, [...current(ticket.id), systemMessage(status === "closed" ? "Ticket closed" : "Ticket reopened")])
    setTab(status)
    toast.success(status === "closed" ? "Ticket closed" : "Ticket reopened")
  }

  function transcript() {
    if (!ticket) return
    const lines = messages
      .filter((m) => m.text || m.systemEvent)
      .map((m) => `${new Date(m.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}  ${m.isSystem ? "--" : m.senderName}: ${m.text ?? m.systemEvent}`)
    downloadBlob(makePdf(`Ticket: ${ticket.title}`, lines), `ticket-${ticket.id}.pdf`)
    toast.success("Transcript downloaded")
  }

  return (
    <>
      <PageHeader
        title="My tickets"
        crumbs={[{ label: "Help center", href: "/help" }]}
        actions={
          <button type="button" className={primaryAction} onClick={() => setCreating(true)}>
            <Plus /> New ticket
          </button>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:h-[max(640px,calc(100svh-207px))] lg:grid-cols-[minmax(300px,457px)_minmax(0,1fr)]">
        {/* Ticket list */}
        <section className={cn("frieda-card min-h-0 flex-col p-[22px]", mobileChat ? "hidden lg:flex" : "flex")}>
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-[#bdbdbd]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search tickets"
              className="h-[38px] w-full rounded-[10px] border border-white/[0.06] bg-[#1b1b1b] pr-4 pl-[34px] text-[14px] outline-none placeholder:text-[#bdbdbd] focus:border-teal/50"
            />
          </label>
          <TicketTabs value={tab} onChange={setTab} tickets={tickets.filter((t) => t.title.toLowerCase().includes(q))} className="mt-4" />
          <div className="frieda-scroll -mr-3 mt-4 min-h-[280px] flex-1 space-y-1.5 overflow-y-auto pr-3">
            {list.length ? (
              list.map((t) => <TicketRow key={t.id} ticket={t} active={t.id === ticket?.id} onClick={() => select(t.id)} />)
            ) : (
              <p className="py-12 text-center text-subtle">{q ? "No tickets match your search." : "No tickets here."}</p>
            )}
          </div>
        </section>

        {/* Conversation */}
        <section className={cn("frieda-card relative min-h-[560px] flex-col overflow-hidden", mobileChat ? "flex" : "hidden lg:flex")}>
          {ticket ? (
            <ChatProvider
              currentUser={supportMe}
              theme="midnight"
              className="frieda-chat flex min-h-0 flex-1 flex-col"
              onReply={(m) => setReplyingTo(m)}
              onReactionAdd={(id, emoji) => react(id, emoji, true)}
              onReactionRemove={(id, emoji) => react(id, emoji, false)}
              onEdit={(m) => setEditing(m)}
              onDelete={(id) => patch(id, () => null)}
              onPin={(id) => {
                const pinned = messages.find((m) => m.id === id)?.isPinned
                patch(id, (m) => ({ ...m, isPinned: !m.isPinned }))
                toast(pinned ? "Message unpinned" : "Message pinned")
              }}
            >
              <header className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-[18px] sm:px-[22px]">
                <div className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-2/3 rounded-full bg-teal/20 blur-3xl" />
                <button type="button" aria-label="Back to tickets" onClick={() => setMobileChat(false)} className="grid size-8 place-items-center rounded-lg text-subtle hover:text-white lg:hidden">
                  <ChevronLeft className="size-5" />
                </button>
                <PersonAvatar id={support.id} name={support.name} tone="purple" className="size-[46px]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px]">{support.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-teal">
                    <span className="size-[6px] rounded-full bg-teal" /> {typing ? "Typing…" : "Active"}
                  </div>
                </div>
                {closed ? (
                  <button type="button" className={cn(outlineAction, "relative")} onClick={() => setStatus("open")}>
                    <RotateCcw /> <span className="hidden sm:inline">Reopen ticket</span>
                  </button>
                ) : (
                  <button type="button" className={cn(outlineAction, "relative")} onClick={() => setStatus("closed")}>
                    <CircleCheck /> <span className="hidden sm:inline">Close ticket</span>
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger aria-label="Ticket options" className={cn(outlineAction, "relative w-[38px] px-0")}>
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={transcript}>
                      <Download /> Download transcript
                    </DropdownMenuItem>
                    {ticket.status !== "feedback" && (
                      <DropdownMenuItem onSelect={() => setStatus("feedback")}>
                        <MessageSquarePlus /> Move to feedback
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => {
                        write(ticket.id, [systemMessage("Chat cleared")])
                        toast("Chat cleared")
                      }}
                    >
                      <Trash2 /> Clear chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <div className="px-[22px] pt-3 text-center text-[13px] text-subtle sm:hidden">{ticket.title}</div>

              <div ref={containerRef} role="log" aria-live="polite" aria-label={`Conversation about ${ticket.title}`} className="frieda-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-16 sm:px-[67px]">
                <div className="flex flex-col gap-6">
                  {mounted && messages.map((m) =>
                    m.isSystem ? (
                      <ChatSystemMessage key={m.id} message={m} className="my-0" />
                    ) : m.senderId === supportMe.id ? (
                      <MyBubble key={m.id} message={m} />
                    ) : (
                      <SupportBubble key={m.id} message={m} />
                    )
                  )}
                </div>
              </div>

              {typing && (
                <div className="pointer-events-none absolute inset-x-0 bottom-[86px] flex justify-center">
                  <span className="flex h-[26px] items-center gap-2 rounded-[6px] border border-[#5f5f5f] bg-[#2b2e2e] px-2.5 text-[13px] text-white shadow-lg">
                    <span className="flex gap-[3px]">
                      {[0, 160, 320].map((d) => (
                        <span key={d} className="chat-typing-dot size-[4px] rounded-full bg-white" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                    Typing...
                  </span>
                </div>
              )}

              <div className="shrink-0 px-2 pb-5 sm:px-[52px]">
                {closed ? (
                  <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#1b1b1b] px-4 py-3 text-[14px] text-subtle">
                    This ticket is closed.
                    <button type="button" className="text-teal hover:opacity-80" onClick={() => setStatus("open")}>
                      Reopen ticket
                    </button>
                  </div>
                ) : (
                  <ChatComposer
                    placeholder={`Message ${support.name}...`}
                    onSend={(text) => send(text)}
                    onFileUpload={upload}
                    onVoiceRecord={() => startVoiceInput((text) => send(text))}
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                  />
                )}
              </div>
            </ChatProvider>
          ) : (
            <div className="grid flex-1 place-items-center p-10 text-center text-subtle">Pick a ticket to see the conversation.</div>
          )}
        </section>
      </div>

      <EditDialog
        message={editing}
        onClose={() => setEditing(null)}
        onSave={(text) => editing && patch(editing.id, (m) => ({ ...m, text, isEdited: true }))}
      />
      <NewTicketDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}

export default function TicketsPage() {
  return (
    <React.Suspense>
      <TicketsView />
    </React.Suspense>
  )
}
