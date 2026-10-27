"use client"

import * as React from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { quickTransfer } from "@/registry/frieda/lib/data"
import { money } from "@/registry/frieda/lib/format"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { primaryAction } from "./page-header"
import { PersonAvatar } from "./person-avatar"

export type AmountMode = "send" | "request" | "gift" | "add" | "topup"

const copy: Record<AmountMode, { title: string; description: string; cta: string; needsPerson: boolean }> = {
  send: { title: "Send money", description: "Transfers arrive instantly between Frieda accounts.", cta: "Send", needsPerson: true },
  request: { title: "Request money", description: "They’ll get a notification with a Pay button.", cta: "Request", needsPerson: true },
  gift: { title: "Send a gift", description: "Wrap a little surprise with a note.", cta: "Send gift", needsPerson: true },
  add: { title: "Add money", description: "Top up your wallet from a linked bank.", cta: "Add money", needsPerson: false },
  topup: { title: "Top up card", description: "Move money from your wallet to this card.", cta: "Top up", needsPerson: false },
}

const presets = [50, 100, 250, 500]

export function AmountDialog({
  open,
  onOpenChange,
  mode,
  personId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AmountMode
  personId?: string
  onDone?: (amount: number) => void
}) {
  const text = copy[mode]
  const [to, setTo] = React.useState(personId)
  const [value, setValue] = React.useState("")
  const [note, setNote] = React.useState("")
  const [prevOpen, setPrevOpen] = React.useState(open)

  // Reset the form each time the dialog opens.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setTo(personId)
      setValue("")
      setNote("")
    }
  }

  const people = useFrieda((s) => s.people)
  const personById = (id: string) => people.find((p) => p.id === id)
  const amount = Number(value.replace(/[^0-9.]/g, ""))
  const person = to ? personById(to) : undefined
  const valid = amount > 0 && (!text.needsPerson || !!person)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    const first = person?.name.split(" ")[0]
    if (mode === "send" || mode === "gift") {
      actions.addTransaction({
        id: `t-${Date.now()}`,
        kind: "sent",
        title: mode === "gift" ? `Gift to ${first}` : `Money sent to ${first}`,
        amount: -amount,
        date: new Date().toISOString(),
        personId: person?.id,
      })
    }
    if (mode === "add") {
      actions.addTransaction({ id: `t-${Date.now()}`, kind: "received", title: "Money added", amount, date: new Date().toISOString() })
    }
    const messages: Record<AmountMode, string> = {
      send: `${money(amount, { cents: amount % 1 !== 0 })} sent to ${person?.name}`,
      request: `Requested ${money(amount)} from ${person?.name}`,
      gift: `Gift of ${money(amount)} sent to ${person?.name}`,
      add: `${money(amount)} added to your wallet`,
      topup: `Card topped up with ${money(amount)}`,
    }
    toast.success(messages[mode], { description: note || undefined })
    onDone?.(amount)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] border border-white/10 bg-[#252525] p-6 sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-normal">{text.title}</DialogTitle>
          <DialogDescription className="text-[13px] text-subtle">{text.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-6 space-y-5">
          {text.needsPerson && (
            <div>
              <div className="mb-2 text-[13px] text-subtle">{person ? "To" : "Choose a recipient"}</div>
              <div className="frieda-no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {(personId ? [personId] : quickTransfer).map((id) => {
                  const p = personById(id)
                  if (!p) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTo(id)}
                      className={cn(
                        "flex w-[68px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-1.5 text-[12px] text-subtle transition-colors",
                        to === id ? "bg-white/[0.06] text-white" : "hover:bg-white/[0.04]"
                      )}
                    >
                      <PersonAvatar id={id} name={p.name} className={cn("size-12", to === id && "ring-2 ring-teal")} />
                      <span className="w-full truncate text-center">{p.name.split(" ")[0]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <label className="block">
            <span className="mb-2 block text-[13px] text-subtle">Amount</span>
            <div className="flex h-16 items-center rounded-[14px] bg-[#1b1b1b] px-4 ring-teal/60 focus-within:ring-2">
              <span className="text-[30px] text-[#8a8a8a]">$</span>
              <input
                autoFocus
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                aria-label="Amount in dollars"
                className="ml-1 w-full bg-transparent text-[30px] tabular-nums outline-none placeholder:text-[#555]"
              />
            </div>
          </label>
          <div className="flex gap-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValue(String(p))}
                className={cn(
                  "h-9 flex-1 rounded-[10px] border text-[14px] tabular-nums transition-colors",
                  amount === p ? "border-teal bg-teal/10 text-teal" : "border-white/10 text-[#d6d6d6] hover:bg-white/5"
                )}
              >
                ${p}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="h-12 w-full rounded-[12px] bg-[#1b1b1b] px-4 text-[15px] outline-none placeholder:text-[#777] focus:ring-2 focus:ring-teal/60"
          />
          <button type="submit" disabled={!valid} className={cn(primaryAction, "h-12 w-full text-[16px]")}>
            {text.cta}
            {amount > 0 && ` ${money(amount, { cents: amount % 1 !== 0 })}`}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Small helper so pages can open the dialog from anywhere. */
export function useAmountDialog() {
  const [state, setState] = React.useState<{
    open: boolean
    mode: AmountMode
    personId?: string
    onDone?: (amount: number) => void
  }>({
    open: false,
    mode: "send",
  })
  const open = React.useCallback(
    (mode: AmountMode, personId?: string, onDone?: (amount: number) => void) =>
      setState({ open: true, mode, personId, onDone }),
    []
  )
  const dialog = (
    <AmountDialog
      open={state.open}
      mode={state.mode}
      personId={state.personId}
      onDone={state.onDone}
      onOpenChange={(o) => setState((s) => ({ ...s, open: o }))}
    />
  )
  return { open, dialog }
}
