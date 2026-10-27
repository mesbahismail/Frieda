"use client"

import * as React from "react"
import { Camera, KeyRound, Laptop, RotateCcw, Smartphone } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { user } from "@/registry/frieda/lib/data"
import { actions } from "@/registry/frieda/lib/store"
import { ConfirmDialog, fieldClass } from "@/registry/frieda/components/frieda/dialogs"
import { outlineAction, PageHeader, primaryAction } from "@/registry/frieda/components/frieda/page-header"
import { Panel } from "@/registry/frieda/components/frieda/panel"
import { PersonAvatar } from "@/registry/frieda/components/frieda/person-avatar"

function Choice<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void }) {
  return (
    <div>
      <div className="mb-2 text-[13px] text-subtle">{label}</div>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "h-9 rounded-[10px] border px-3.5 text-[14px] transition-colors",
              value === o ? "border-teal bg-teal/10 text-teal" : "border-white/10 text-[#d6d6d6] hover:bg-white/5"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, hint, defaultChecked = true }: { label: string; hint: string; defaultChecked?: boolean }) {
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <label htmlFor={id} className="cursor-pointer">
        <div className="text-[15px]">{label}</div>
        <div className="mt-0.5 text-[13px] text-subtle">{hint}</div>
      </label>
      <Switch
        id={id}
        defaultChecked={defaultChecked}
        onCheckedChange={(on) => toast(`${label} ${on ? "on" : "off"}`)}
        className="data-checked:bg-teal data-unchecked:bg-[#3a3a3a]"
      />
    </div>
  )
}

export default function SettingsPage() {
  const [name, setName] = React.useState(user.fullName)
  const [display, setDisplay] = React.useState(user.displayName)
  const [email, setEmail] = React.useState(user.email)
  const [currency, setCurrency] = React.useState<"USD" | "EUR" | "GBP" | "MAD">("USD")
  const [week, setWeek] = React.useState<"Monday" | "Sunday">("Monday")
  const [resetting, setResetting] = React.useState(false)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <>
      <PageHeader title="Settings" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 content-start gap-6">
          <Panel title="Profile" menu={false}>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!name.trim() || !emailValid) return
                toast.success("Profile saved")
              }}
            >
              <div className="flex items-center gap-5">
                <PersonAvatar id={user.avatar} name={user.fullName} className="size-[84px] ring-2 ring-[#0f5d56]" />
                <button type="button" className={outlineAction} onClick={() => toast("Connect your storage to upload photos")}>
                  <Camera /> Change photo
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] text-subtle">Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] text-subtle">Display name</span>
                  <input value={display} onChange={(e) => setDisplay(e.target.value)} className={fieldClass} />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[13px] text-subtle">Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!emailValid} className={fieldClass} />
                {!emailValid && <p className="mt-1.5 text-[12px] text-[#ff6b81]">Enter a valid email address</p>}
              </label>
              <button type="submit" disabled={!name.trim() || !emailValid} className={cn(primaryAction, "mt-2")}>
                Save changes
              </button>
            </form>
          </Panel>

          <Panel title="Preferences" menu={false}>
            <div className="space-y-5">
              <Choice label="Currency" options={["USD", "EUR", "GBP", "MAD"] as const} value={currency} onChange={setCurrency} />
              <Choice label="Week starts on" options={["Monday", "Sunday"] as const} value={week} onChange={setWeek} />
            </div>
          </Panel>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <Panel title="Notifications" menu={false}>
            <div className="divide-y divide-white/[0.06]">
              <Toggle label="Payments" hint="Money received, sent and requested" />
              <Toggle label="Budget alerts" hint="When you reach 80% of a budget" />
              <Toggle label="Rewards" hint="New awards and points you earn" />
              <Toggle label="Product news" hint="Tips and new features" defaultChecked={false} />
            </div>
          </Panel>

          <Panel title="Security" menu={false}>
            <div className="divide-y divide-white/[0.06]">
              <Toggle label="Two-factor authentication" hint="Ask for a code when signing in on a new device" />
              <div className="flex items-center justify-between gap-6 py-3.5">
                <div>
                  <div className="text-[15px]">Password</div>
                  <div className="mt-0.5 text-[13px] text-subtle">Last changed 3 months ago</div>
                </div>
                <button type="button" className={outlineAction} onClick={() => toast("Hook this up to your auth provider")}>
                  <KeyRound /> Change
                </button>
              </div>
              <div className="py-3.5">
                <div className="text-[15px]">Active sessions</div>
                <ul className="mt-3 space-y-3 text-[14px]">
                  {[
                    { icon: Laptop, name: "MacBook Pro · Casablanca", hint: "This device" },
                    { icon: Smartphone, name: "iPhone · Casablanca", hint: "2 hours ago" },
                  ].map(({ icon: Icon, name, hint }) => (
                    <li key={name} className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-[10px] bg-[#2b2b2b] text-[#d6d6d6]">
                        <Icon className="size-[18px]" strokeWidth={1.7} />
                      </span>
                      <span className="flex-1">{name}</span>
                      <span className="text-[13px] text-subtle">{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel title="Demo data" menu={false}>
            <p className="text-[14px] leading-relaxed text-subtle">
              Cards, recipients, favorites, pinned widgets, points and your budget are saved in this browser. Reset them to the template’s sample data.
            </p>
            <button type="button" className={cn(outlineAction, "mt-4 w-fit border-rose/50 text-[#ff6b81] hover:border-rose")} onClick={() => setResetting(true)}>
              <RotateCcw /> Reset demo data
            </button>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={resetting}
        onOpenChange={setResetting}
        title="Reset demo data?"
        description="Everything you changed in this browser goes back to the template’s sample data."
        confirm="Reset"
        onConfirm={() => {
          actions.reset()
          toast.success("Demo data reset")
        }}
      />
    </>
  )
}
