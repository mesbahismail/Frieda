"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { cardColors, TODAY, user, type BankCard, type CardColor } from "@/registry/frieda/lib/data"
import { actions } from "@/registry/frieda/lib/store"
import { BankCardVisual } from "@/registry/frieda/components/frieda/bank-card"
import { PageHeader, primaryAction } from "@/registry/frieda/components/frieda/page-header"

const inputClass =
  "h-[38px] w-full rounded-[8px] border border-[#3a3a3a] bg-[#1e1e1e] px-[15px] text-[14px] text-white transition-colors outline-none placeholder:text-[#a3a3a3] focus:border-teal/70 aria-invalid:border-rose/80"

type Errors = Partial<Record<"name" | "number" | "expiry" | "cvc", string>>

function formatNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function validate(name: string, number: string, expiry: string, cvc: string): Errors {
  const errors: Errors = {}
  if (name.trim().length < 2) errors.name = "Enter the name shown on the card"
  if (number.replace(/\s/g, "").length !== 16) errors.number = "Card numbers have 16 digits"
  const [mm, yy] = expiry.split("/").map(Number)
  if (!mm || mm > 12 || yy === undefined || Number.isNaN(yy) || expiry.length !== 5) {
    errors.expiry = "Use the MM/YY format"
  } else if (2000 + yy < TODAY.getFullYear() || (2000 + yy === TODAY.getFullYear() && mm < TODAY.getMonth() + 1)) {
    errors.expiry = "This card has expired"
  }
  if (!/^\d{3,4}$/.test(cvc)) errors.cvc = "3 or 4 digits"
  return errors
}

export default function AddCardPage() {
  const router = useRouter()
  const [color, setColor] = React.useState<CardColor>("teal")
  const [name, setName] = React.useState("")
  const [number, setNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [cvc, setCvc] = React.useState("")
  const [save, setSave] = React.useState(true)
  const [submitted, setSubmitted] = React.useState(false)

  const errors = submitted ? validate(name, number, expiry, cvc) : {}
  const digits = number.replace(/\s/g, "")

  const preview: Pick<BankCard, "type" | "holder" | "balance" | "number" | "expiry" | "color"> = {
    type: "Debit card",
    holder: name.trim() || user.fullName,
    balance: 36654,
    number: digits.length >= 4 ? number : "•••• •••• •••• 3465",
    expiry: expiry || "7/27",
    color,
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(name, number, expiry, cvc)).length) return
    if (!save) {
      toast.success("Card verified", { description: "It wasn’t saved to your cards because “Save card details” is off." })
      setName("")
      setNumber("")
      setExpiry("")
      setCvc("")
      setSubmitted(false)
      return
    }
    actions.addCard({
      id: `c-${Date.now()}`,
      type: "Debit card",
      holder: name.trim(),
      balance: 0,
      number,
      expiry: expiry.replace(/^0/, ""),
      color,
    })
    toast.success("Card added", { description: `Debit card ending ${digits.slice(-4)} is ready to use.` })
    router.push("/cards")
  }

  const error = (key: keyof Errors) =>
    errors[key] && <p className="mt-1.5 text-[12px] text-[#ff6b81]">{errors[key]}</p>

  return (
    <>
      <PageHeader title="Add new card" crumbs={[{ label: "My cards", href: "/cards" }]} />

      <section className="frieda-card flex min-h-[calc(100svh-220px)] justify-center px-4 py-12 sm:py-[74px]">
        <div className="w-full max-w-[381px]">
          <div className="mx-auto max-w-[343px]">
            <BankCardVisual card={preview} className="transition-[background] duration-500" />
          </div>

          <div role="radiogroup" aria-label="Card color" className="mt-[30px] flex justify-center gap-[19px]">
            {cardColors.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={color === c.id}
                aria-label={c.id}
                onClick={() => setColor(c.id)}
                className={cn(
                  "size-[23px] rounded-full transition-[box-shadow,transform] hover:scale-110",
                  color === c.id && "shadow-[0_0_0_4px_#262626,0_0_0_6px_#5b5b5b]"
                )}
                style={{ background: c.swatch }}
              />
            ))}
          </div>

          <form onSubmit={submit} noValidate className="mt-[38px]">
            <div className="mb-3 text-[14px] text-[#bdbdbd]">Card details</div>
            <div className="space-y-[15px]">
              <div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  autoComplete="cc-name"
                  aria-label="Full name"
                  aria-invalid={!!errors.name}
                  className={inputClass}
                />
                {error("name")}
              </div>
              <div>
                <input
                  value={number}
                  onChange={(e) => setNumber(formatNumber(e.target.value))}
                  placeholder="Card number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  aria-label="Card number"
                  aria-invalid={!!errors.number}
                  className={cn(inputClass, "tabular-nums")}
                />
                {error("number")}
              </div>
              <div className="grid grid-cols-[1fr_114px] gap-3">
                <div>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="Expiry date"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    aria-label="Expiry date (MM/YY)"
                    aria-invalid={!!errors.expiry}
                    className={cn(inputClass, "tabular-nums")}
                  />
                  {error("expiry")}
                </div>
                <div>
                  <input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    type="password"
                    aria-label="CVC"
                    aria-invalid={!!errors.cvc}
                    className={cn(inputClass, "tabular-nums")}
                  />
                  {error("cvc")}
                </div>
              </div>
            </div>

            <label className="mt-[22px] flex w-fit cursor-pointer items-center gap-2.5 text-[12px] text-[#e6e6e6]">
              <Checkbox
                checked={save}
                onCheckedChange={(v) => setSave(v === true)}
                className="size-[15px] rounded-[3px] border-[#5b5b5b] data-checked:border-teal data-checked:bg-teal data-checked:text-[#123]"
              />
              Save card details
            </label>

            <button type="submit" className={cn(primaryAction, "mt-[30px] w-full")}>
              <Plus /> Add new card
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
