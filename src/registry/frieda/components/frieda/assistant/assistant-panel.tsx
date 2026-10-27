"use client"

import * as React from "react"
import {
  ArrowRightLeft,
  ChartPie,
  ChevronLeft,
  Copy,
  Download,
  FileText,
  History,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  ShoppingCart,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { ChatComposer, ChatMessage, ChatProvider } from "@/components/ui/chat/chat"
import { useAutoScroll } from "@/components/ui/chat/hooks"
import { ChatConversationItem } from "@/components/ui/chat/layouts"
import { validateFile } from "@/components/ui/chat/security"
import type { ChatMessageData, ChatUser } from "@/components/ui/chat/types"
import { avatarSrc, transactions, user } from "@/registry/frieda/lib/data"
import { downloadCsv, downloadBlob, makePdf } from "@/registry/frieda/lib/download"
import { money } from "@/registry/frieda/lib/format"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { startVoiceInput } from "@/registry/frieda/lib/voice"
import { ProgressBar, Sparkline, ValueBars } from "../charts"
import { FriedaMark } from "../logo"
import { Money, TrendBadge } from "../panel"
import { PersonAvatar } from "../person-avatar"
import { SidePanel, panelButton } from "../side-panel"
import { primaryAction } from "../page-header"
import { TransactionRow } from "../transactions"
import { reply, type AssistantWidget } from "./engine"

type Message = ChatMessageData & {
  widget?: AssistantWidget
  streaming?: boolean
  feedback?: "up" | "down"
}

type Conversation = { id: string; title: string; updatedAt: number; messages: Message[] }

const me: ChatUser = { id: "me", name: user.displayName, avatar: avatarSrc(user.avatar), status: "online" }
const AI = { id: "frieda-ai", name: "Frieda AI" }

const suggestions: { icon: LucideIcon; text: string }[] = [
  { icon: ShoppingCart, text: "What’s the budget for this week’s shopping?" },
  { icon: ReceiptText, text: "Give me the last 6 months report on my spending" },
  { icon: ArrowRightLeft, text: "Give me a list of transactions between me and Ahmed" },
  { icon: ChartPie, text: "Did my spending increase in the last 3 months?" },
]

let counter = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`

function userMessage(text: string, extra?: Partial<Message>): Message {
  return { id: uid("u"), senderId: me.id, senderName: me.name, senderAvatar: me.avatar, text, timestamp: Date.now(), status: "read", ...extra }
}

function aiMessage(text: string, widget?: AssistantWidget, extra?: Partial<Message>): Message {
  return { id: uid("a"), senderId: AI.id, senderName: AI.name, text, widget, timestamp: Date.now(), ...extra }
}

function seed(): Conversation[] {
  const t = Date.now()
  const convo = (title: string, ago: number, pairs: string[]): Conversation => {
    const messages: Message[] = []
    pairs.forEach((q, i) => {
      const r = reply(q)
      const at = t - ago + i * 60_000
      messages.push(userMessage(q, { timestamp: at }), aiMessage(r.text, r.widget, { timestamp: at + 4000 }))
    })
    return { id: uid("c"), title, updatedAt: t - ago, messages }
  }
  return [
    convo("Finance insights", 6 * 60_000, [
      "What’s happening in personal finance in 2024?",
      "What’s my balance right now?",
      "Give me last month’s transactions",
      "Thanks!",
    ]),
    convo("Budget planning", 26 * 3_600_000, ["What’s the budget for this week’s shopping?"]),
    convo("Transactions with Ahmed", 5 * 86_400_000, ["Give me a list of transactions between me and Ahmed"]),
  ]
}

// ─── Widget renderers ────────────────────────────────────────────────────────

function WidgetView({ widget }: { widget: AssistantWidget }) {
  const box = "mt-4 rounded-[12px] bg-[#2b2b2b] p-4"
  switch (widget.type) {
    case "balance":
      return (
        <div className={cn(box, "flex flex-wrap items-center gap-x-4 gap-y-2 px-5")}>
          <Money value={widget.value} className="text-[34px] leading-none" />
          <TrendBadge value={widget.change} className="h-7" />
          <Sparkline data={widget.spark} className="h-14 min-w-[140px] flex-1" />
        </div>
      )
    case "document":
      return (
        <div className={cn(box, "flex items-center gap-4 py-3")}>
          <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#3c3c3c] text-[#d6d6d6]">
            <FileText className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] text-white">{widget.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] tracking-wide text-[#a6a6a6] uppercase">
              PDF file <span className="size-1 rounded-full bg-[#777]" /> {widget.size}
            </div>
          </div>
          <button
            type="button"
            aria-label={`Download ${widget.name}`}
            onClick={() => downloadStatement(widget.name)}
            className="grid size-[30px] place-items-center rounded-[8px] bg-teal text-[#123] transition-[filter] hover:brightness-110"
          >
            <Download className="size-4" />
          </button>
        </div>
      )
    case "budget":
      return (
        <div className={box}>
          <div className="mb-3 flex items-baseline justify-between text-[14px] text-[#cfcfcf]">
            {widget.label}
            <span className="text-white tabular-nums">
              {money(widget.spent, { cents: true })} <span className="text-[#8a8a8a]">/ {money(widget.limit)}</span>
            </span>
          </div>
          <ProgressBar value={widget.spent} max={widget.limit} className="h-9 rounded-[10px]" />
        </div>
      )
    case "spending":
      return (
        <div className={box}>
          <div className="mb-2 flex items-center justify-between text-[14px] text-[#cfcfcf]">
            Monthly spending <TrendBadge value={widget.change} className="h-6 text-[12px]" />
          </div>
          <div className="flex h-[170px]">
            <ValueBars data={widget.months.map((m) => ({ ...m, color: "var(--teal)" }))} />
          </div>
        </div>
      )
    case "transactions":
      return (
        <div className={cn(box, "py-2")}>
          {transactions
            .filter((t) => widget.ids.includes(t.id))
            .map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
        </div>
      )
  }
}

function downloadStatement(name: string) {
  const rows = transactions.slice(0, 16).map((t) => `${t.date.slice(0, 10)}   ${t.title.padEnd(28, " ")} ${money(t.amount, { cents: true, signed: true })}`)
  downloadBlob(makePdf(name.replace(/\.pdf$/, ""), ["Frieda statement", "", ...rows]), name)
  toast.success(`${name} downloaded`)
}

function downloadWidget(widget: AssistantWidget) {
  if (widget.type === "document") return downloadStatement(widget.name)
  if (widget.type === "balance") {
    downloadCsv([["point", "balance"], ...widget.spark.map((v, i) => [i + 1, v * 1000])], "frieda-balance.csv")
  } else if (widget.type === "spending") {
    downloadCsv([["month", "spending"], ...widget.months.map((m) => [m.label, m.value])], "frieda-spending.csv")
  } else if (widget.type === "budget") {
    downloadCsv([["budget", "spent", "limit"], [widget.label, widget.spent, widget.limit]], "frieda-budget.csv")
  } else {
    downloadCsv(
      [["date", "title", "amount"], ...transactions.filter((t) => widget.ids.includes(t.id)).map((t) => [t.date, t.title, t.amount])],
      "frieda-transactions.csv"
    )
  }
  toast.success("Downloaded")
}

// ─── Messages ────────────────────────────────────────────────────────────────

function ActionButton({
  icon: Icon,
  label,
  showLabel = true,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  showLabel?: boolean
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-md py-1 text-[15px] text-[#b3b3b3] transition-colors hover:text-white",
        active && "text-teal hover:text-teal"
      )}
    >
      <Icon className="size-[15px]" strokeWidth={1.8} />
      {showLabel && label}
    </button>
  )
}

function AssistantBubble({
  message,
  speaking,
  onFeedback,
  onRegenerate,
  onSpeak,
}: {
  message: Message
  speaking: boolean
  onFeedback: (value: "up" | "down") => void
  onRegenerate: () => void
  onSpeak: () => void
}) {
  const hasWidget = !!message.widget
  return (
    <div className="flex items-end gap-4">
      <FriedaMark className="size-[38px] shrink-0" />
      <div className="max-w-[min(100%,566px)] min-w-0 flex-1 rounded-[20px] border border-white/[0.06] bg-[#1f1f1f] px-5 pt-4 pb-3.5 shadow-[0_10px_30px_-20px_rgb(0_0_0/0.8)]">
        <p className="text-[15px] leading-[1.65] whitespace-pre-wrap text-[#f1f1f1]">
          {message.text}
          {message.streaming && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-teal align-middle" />}
        </p>
        {hasWidget && !message.streaming && (
          <div className="animate-float-in">
            <WidgetView widget={message.widget!} />
          </div>
        )}
        {!message.streaming && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
            {hasWidget ? (
              <>
                <ActionButton icon={ThumbsUp} label="Like" showLabel={false} active={message.feedback === "up"} onClick={() => onFeedback("up")} />
                <ActionButton icon={ThumbsDown} label="Dislike" showLabel={false} active={message.feedback === "down"} onClick={() => onFeedback("down")} />
                <ActionButton icon={Download} label="Download" onClick={() => downloadWidget(message.widget!)} />
              </>
            ) : (
              <>
                <ActionButton icon={ThumbsUp} label="Like" active={message.feedback === "up"} onClick={() => onFeedback("up")} />
                <ActionButton
                  icon={Copy}
                  label="Copy"
                  onClick={() => {
                    navigator.clipboard?.writeText(message.text ?? "").then(
                      () => toast.success("Copied to clipboard"),
                      () => toast.error("Couldn’t copy")
                    )
                  }}
                />
                <ActionButton icon={speaking ? VolumeX : Volume2} label={speaking ? "Stop" : "Read"} active={speaking} onClick={onSpeak} />
              </>
            )}
            <ActionButton icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />
          </div>
        )}
      </div>
    </div>
  )
}

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex items-end justify-end gap-4">
      {/* chatcn message bubble, themed by .frieda-chat */}
      <ChatMessage message={message} isOutgoing position="solo" className="!mt-0 min-w-0 flex-1" />
      <PersonAvatar id={user.avatar} className="size-[38px] ring-2 ring-[#0f5d56]" />
    </div>
  )
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function AssistantPanel() {
  const open = useFrieda((s) => s.panel === "assistant")
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  // Seeded on first open, so prerendering never reads the clock.
  const [seeded, setSeeded] = React.useState(false)
  if (open && !seeded) {
    setSeeded(true)
    setConversations(seed())
  }
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [view, setView] = React.useState<"chat" | "history">("chat")
  const [thinking, setThinking] = React.useState(false)
  const [speakingId, setSpeakingId] = React.useState<string | null>(null)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const active = conversations.find((c) => c.id === activeId) ?? null
  const messages = React.useMemo(() => active?.messages ?? [], [active])
  const { containerRef, scrollToBottom } = useAutoScroll(messages)

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      if (typeof window !== "undefined") window.speechSynthesis?.cancel()
    }
  }, [])

  const patchMessage = React.useCallback((convoId: string, msgId: string, patch: Partial<Message>) => {
    setConversations((list) =>
      list.map((c) =>
        c.id === convoId ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) } : c
      )
    )
  }, [])

  const stream = React.useCallback(
    (convoId: string, msgId: string, text: string, widget?: AssistantWidget) => {
      let i = 0
      const step = () => {
        i = Math.min(text.length, i + 3)
        const done = i >= text.length
        patchMessage(convoId, msgId, { text: text.slice(0, i), streaming: !done, widget: done ? widget : undefined })
        scrollToBottom("auto")
        if (!done) timers.current.push(setTimeout(step, 16))
        else timers.current.push(setTimeout(() => scrollToBottom("smooth"), 50))
      }
      step()
    },
    [patchMessage, scrollToBottom]
  )

  const ask = React.useCallback(
    (text: string, extra?: Partial<Message>) => {
      const r = reply(text)
      const question = userMessage(text, extra)
      let convoId = activeId
      if (!convoId) {
        const convo: Conversation = { id: uid("c"), title: r.topic, updatedAt: Date.now(), messages: [question] }
        convoId = convo.id
        setConversations((list) => [convo, ...list])
        setActiveId(convo.id)
      } else {
        setConversations((list) =>
          list.map((c) => (c.id === convoId ? { ...c, updatedAt: Date.now(), messages: [...c.messages, question] } : c))
        )
      }
      setView("chat")
      setThinking(true)
      const id = convoId
      timers.current.push(
        setTimeout(() => {
          setThinking(false)
          const answer = aiMessage("", undefined, { streaming: true })
          setConversations((list) => list.map((c) => (c.id === id ? { ...c, messages: [...c.messages, answer] } : c)))
          timers.current.push(setTimeout(() => stream(id, answer.id, r.text, r.widget), 30))
        }, 1100)
      )
    },
    [activeId, stream]
  )

  function regenerate(index: number) {
    if (!active) return
    const question = [...active.messages.slice(0, index)].reverse().find((m) => m.senderId === me.id)
    const target = active.messages[index]
    if (!question?.text || !target) return
    const r = reply(question.text)
    patchMessage(active.id, target.id, { text: "", widget: undefined, streaming: true, feedback: undefined })
    timers.current.push(setTimeout(() => stream(active.id, target.id, r.text, r.widget), 400))
  }

  function speak(message: Message) {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined
    if (!synth) return toast("Text-to-speech isn’t supported in this browser")
    synth.cancel()
    if (speakingId === message.id) return setSpeakingId(null)
    const utterance = new SpeechSynthesisUtterance(message.text ?? "")
    utterance.onend = () => setSpeakingId(null)
    setSpeakingId(message.id)
    synth.speak(utterance)
  }

  function voice() {
    startVoiceInput((text) => ask(text))
  }

  function upload(files: File[]) {
    const ok = files.filter((f) => {
      const result = validateFile(f)
      if (!result.valid) toast.error(result.error ?? `${f.name} can’t be uploaded`)
      return result.valid
    })
    if (!ok.length) return
    const names = ok.map((f) => f.name).join(", ")
    ask(`Summarise ${names}`, {
      files: ok.map((f) => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) })),
    })
  }

  function startNew() {
    setActiveId(null)
    setView("chat")
    setThinking(false)
  }

  const header =
    view === "history"
      ? { title: "History", leading: <BackButton onClick={() => setView("chat")} /> }
      : active
        ? { title: active.title, leading: <BackButton onClick={startNew} /> }
        : { title: "AI Chat", leading: null }

  return (
    <SidePanel
      open={open}
      blur
      onOpenChange={(o) => (o ? actions.openPanel("assistant") : actions.closePanel())}
      title={header.title}
      leading={header.leading}
      actions={
        active || view === "history" ? (
          <button type="button" onClick={startNew} className={cn(primaryAction, "px-5 text-[17px]")}>
            <Plus /> New
          </button>
        ) : (
          <button type="button" onClick={() => setView("history")} className={cn(panelButton, "text-[17px]")}>
            <History /> History
          </button>
        )
      }
    >
      <ChatProvider currentUser={me} theme="midnight" className="frieda-chat relative flex min-h-0 flex-1 flex-col">
        {view === "history" ? (
          <div className="frieda-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-6 sm:px-[29px]">
            {conversations.map((c) => {
              const last = [...c.messages].reverse().find((m) => m.text)
              return (
                <ChatConversationItem
                  key={c.id}
                  isActive={c.id === activeId}
                  onClick={() => {
                    setActiveId(c.id)
                    setView("chat")
                  }}
                  convo={{
                    id: c.id,
                    title: c.title,
                    lastMessage: last?.text,
                    lastMessageTime: relative(c.updatedAt),
                  }}
                />
              )
            })}
          </div>
        ) : active ? (
          <div ref={containerRef} className="frieda-scroll min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-16 sm:px-[37px]" role="log" aria-live="polite">
            <div className="flex flex-col gap-7">
              {messages.map((m, i) =>
                m.senderId === me.id ? (
                  <UserBubble key={m.id} message={m} />
                ) : (
                  <AssistantBubble
                    key={m.id}
                    message={m}
                    speaking={speakingId === m.id}
                    onFeedback={(v) => {
                      patchMessage(active.id, m.id, { feedback: m.feedback === v ? undefined : v })
                      if (m.feedback !== v) toast("Thanks for the feedback")
                    }}
                    onRegenerate={() => regenerate(i)}
                    onSpeak={() => speak(m)}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="frieda-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 sm:px-[37px]">
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <FriedaMark variant="ring" className="size-[114px] shadow-[0_0_80px_rgb(21_224_204/0.25)]" />
              <h3 className="mt-8 text-[26px] leading-tight font-normal text-white sm:text-[30px]">Hi, How can I help you today?</h3>
            </div>
            <div className="flex flex-col gap-[15px] pb-4 sm:px-4">
              {suggestions.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => ask(text)}
                  className="flex min-h-[43px] items-center gap-3 rounded-[10px] border border-white/[0.06] bg-[#232323] px-4 py-2.5 text-left text-[15px] text-[#f0f0f0] transition-colors hover:border-teal/40 hover:bg-[#262b2a]"
                >
                  <Icon className="size-[17px] shrink-0 text-[#d6d6d6]" strokeWidth={1.7} />
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {thinking && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[92px] flex justify-center">
            <span className="flex h-[30px] items-center gap-2 rounded-[8px] border border-[#5f5f5f] bg-[#2b2e2e] px-3 text-[14px] text-white shadow-lg">
              <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} /> Thinking...
            </span>
          </div>
        )}

        {view === "chat" && (
          <div className="shrink-0 px-2 pb-5 sm:px-[25px]">
            <ChatComposer
              placeholder="Message Frieda..."
              onSend={(text) => ask(text)}
              onFileUpload={upload}
              onVoiceRecord={voice}
              disabled={thinking}
            />
          </div>
        )}
      </ChatProvider>
    </SidePanel>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick}
      className="-mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-white transition-colors hover:bg-white/[0.06]"
    >
      <ChevronLeft className="size-6" strokeWidth={1.7} />
    </button>
  )
}

function relative(ts: number) {
  const diff = Date.now() - ts
  if (diff < 60_000) return "now"
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h`
  return `${Math.round(diff / 86_400_000)}d`
}
