"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Plus } from "lucide-react"

import { personById, user, wallet } from "@/registry/frieda/lib/data"
import { money } from "@/registry/frieda/lib/format"
import { useAmountDialog } from "@/registry/frieda/components/frieda/amount-dialog"
import { AreaChart, RingProgress, ValueBars } from "@/registry/frieda/components/frieda/charts"
import { DateRangeButton, PageHeader, primaryAction, useRange, vary } from "@/registry/frieda/components/frieda/page-header"
import { Money, Panel, TrendBadge } from "@/registry/frieda/components/frieda/panel"
import { PersonAvatar } from "@/registry/frieda/components/frieda/person-avatar"

const recipientFills = ["#b9f6ef", "#a2f3ea", "#7eeee2", "#4fe8d9", "#15e0cc"]

export default function WalletPage() {
  const [range, setRange] = useRange("today")
  const dialog = useAmountDialog()

  const history = vary(wallet.history.map((h) => h.value), range)
  const earners = vary(wallet.earners.map((e) => e.value), range)
  const top = Math.max(...wallet.recipients.map((r) => r.value))

  return (
    <>
      <PageHeader
        title={`Hi, ${user.firstName}`}
        current="Wallet"
        actions={
          <>
            <DateRangeButton value={range} onChange={setRange} />
            <button type="button" className={primaryAction} onClick={() => dialog.open("add")}>
              <Plus /> Add money
            </button>
            <button type="button" className={primaryAction} onClick={() => dialog.open("send")}>
              <ArrowUpRight /> Send money
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Total Balance" bodyClassName="min-h-[260px]">
          <div className="flex items-center gap-4">
            <Money value={wallet.total} className="text-[44px] leading-none sm:text-[56px]" />
            <TrendBadge value={wallet.change} plus className="h-[30px] px-2.5 text-[14px]" />
          </div>
          <div className="mt-6 flex min-h-[170px] flex-1">
            <AreaChart
              data={history}
              labels={wallet.history.map((h) => h.month)}
              max={360000}
              variant="solid"
              showAxis={false}
            />
          </div>
        </Panel>

        <Panel title="Top spenders">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            {wallet.spenders.map((s) => (
              <div key={s.label} className="frieda-tile flex items-center gap-5 px-5 py-4">
                <RingProgress value={s.share} color={s.color} size={80} stroke={6} className="[&>div]:text-[18px]" />
                <div className="min-w-0">
                  <div className="text-[14px] text-[#d6d6d6]">{s.label}</div>
                  <Money value={s.value} className="mt-1 block text-[24px] leading-tight" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Top earners" bodyClassName="min-h-[290px]">
          <ValueBars data={wallet.earners.map((e, i) => ({ ...e, value: earners[i] }))} className="pt-6" />
        </Panel>

        <Panel title="Top recipients">
          <ul className="flex flex-1 flex-col justify-between gap-3.5">
            {wallet.recipients.map((r, i) => {
              const person = personById(r.personId)
              const name = person?.name ?? user.fullName
              const width = 34 + (r.value / top) * 48
              return (
                <li key={r.personId}>
                  <Link
                    href={person ? `/recipients?person=${r.personId}` : "/recipients"}
                    className="group flex items-center gap-3"
                    title={`${name} · ${money(r.value)}`}
                  >
                    <PersonAvatar id={r.personId} name={name} className="size-[46px]" />
                    <div className="relative h-[46px] flex-1 overflow-hidden rounded-full bg-[#333]">
                      <div
                        className="frieda-grow-x flex h-full items-center rounded-full px-4 text-[22px] text-[#13302c] tabular-nums transition-[width,filter] duration-500 group-hover:brightness-105 sm:text-[24px]"
                        style={{ width: `${width}%`, background: recipientFills[i], animationDelay: `${i * 70}ms` }}
                      >
                        <span className="mr-0.5 opacity-60">$</span>
                        {r.value.toLocaleString("en-US")}
                      </div>
                      <span className="absolute inset-y-0 right-4 flex items-center text-[13px] text-subtle opacity-0 transition-opacity group-hover:opacity-100">
                        {name}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
      {dialog.dialog}
    </>
  )
}
