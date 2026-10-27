"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleCheck, CircleX, MessageCircleMore, MessagesSquare, Minus, Plus, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { faqs, responseRate, ticketStats, type TicketStatus } from "@/registry/frieda/lib/data"
import { MiniBars } from "@/registry/frieda/components/frieda/charts"
import { PageHeader, primaryAction } from "@/registry/frieda/components/frieda/page-header"
import { Panel, SeeAll, TrendBadge } from "@/registry/frieda/components/frieda/panel"
import { NewTicketDialog, TicketRow, TicketTabs, useTickets } from "@/registry/frieda/components/frieda/support"

function StatTile({
  value,
  label,
  icon: Icon,
  href,
  highlight,
}: {
  value: number
  label: string
  icon: LucideIcon
  href: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[88px] flex-col justify-between rounded-[12px] p-[15px] pt-[13px] transition-[transform,filter,background-color]",
        highlight ? "bg-teal text-[#123] hover:brightness-105" : "frieda-tile text-white hover:bg-[#2f2f2f]"
      )}
    >
      <Icon className="absolute top-[13px] right-[15px] size-[22px]" strokeWidth={1.6} />
      <span className="text-[26px] leading-none tabular-nums">{value}</span>
      <span className="mt-3 text-[16px]">{label}</span>
    </Link>
  )
}

export default function HelpCenterPage() {
  const router = useRouter()
  const tickets = useTickets()
  const [tab, setTab] = React.useState<TicketStatus>("open")
  const [openFaq, setOpenFaq] = React.useState<number | null>(1)
  const [creating, setCreating] = React.useState(false)

  const open = tickets.filter((t) => t.status === "open").length
  const closed = tickets.filter((t) => t.status === "closed").length
  const unresolved = Math.min(ticketStats.unresolved, open)
  const list = tickets.filter((t) => t.status === tab)

  return (
    <>
      <PageHeader
        title="Help Center"
        current="Help center"
        actions={
          <button type="button" className={primaryAction} onClick={() => setCreating(true)}>
            <Plus /> New ticket
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 gap-6 lg:grid-rows-[auto_minmax(0,1fr)]">
          <Panel title="My tickets">
            <div className="grid grid-cols-2 gap-[15px]">
              <StatTile value={open} label="Open tickets" icon={MessageCircleMore} href="/help/tickets?tab=open" highlight />
              <StatTile value={tickets.length} label="Total tickets" icon={MessagesSquare} href="/help/tickets" />
              <StatTile value={closed} label="Closed tickets" icon={CircleCheck} href="/help/tickets?tab=closed" />
              <StatTile value={unresolved} label="Unresolved tickets" icon={CircleX} href="/help/tickets?tab=open" />
            </div>
          </Panel>

          <Panel title="My tickets" action={<SeeAll href={`/help/tickets?tab=${tab}`} />} className="lg:h-[420px]">
            <TicketTabs value={tab} onChange={setTab} tickets={tickets} />
            <div className="frieda-scroll relative -mr-3 mt-3 min-h-0 flex-1 overflow-y-auto pr-3 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
              {list.length ? (
                list.map((t) => <TicketRow key={t.id} ticket={t} onClick={() => router.push(`/help/tickets?ticket=${t.id}`)} />)
              ) : (
                <p className="py-10 text-center text-subtle">No tickets here.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-rows-[auto_minmax(0,1fr)]">
          <Panel title="Average response rate">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[30px] leading-none tabular-nums">{responseRate.hours} Hrs</span>
                  <TrendBadge value={responseRate.change} className="h-[30px] px-2.5 text-[14px]" />
                </div>
                <p className="mt-3 text-[14px] text-[#bdbdbd]">Improves drastically</p>
              </div>
              <MiniBars values={responseRate.bars} className="w-full max-w-[272px] flex-1" />
            </div>
          </Panel>

          <Panel title="Frequently asked questions" className="lg:h-[555px]">
            <div className="frieda-scroll -mr-3 min-h-0 flex-1 space-y-[15px] overflow-y-auto pr-3 pb-4 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]">
              {faqs.map((f, i) => {
                const expanded = openFaq === i
                const id = `faq-${i}`
                return (
                  <div key={f.q} className="frieda-tile overflow-hidden">
                    <h3>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={id}
                        onClick={() => setOpenFaq(expanded ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-[19px] py-[14px] text-left text-[15px] font-medium text-[#f2f2f2]"
                      >
                        {f.q}
                        <span className="grid size-[38px] shrink-0 place-items-center rounded-[9px] border border-[#6b6b6b] transition-colors hover:border-white">
                          {expanded ? <Minus className="size-[18px]" /> : <Plus className="size-[18px]" />}
                        </span>
                      </button>
                    </h3>
                    <div
                      id={id}
                      role="region"
                      className={cn("grid transition-[grid-template-rows] duration-300", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                    >
                      <div className="overflow-hidden">
                        <p className="border-t border-white/[0.06] px-[19px] pt-4 pb-4 text-[14px] leading-[1.6] text-[#bdbdbd]">{f.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>

      <NewTicketDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}
