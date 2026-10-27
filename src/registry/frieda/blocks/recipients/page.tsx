"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Gift,
  List,
  Pencil,
  Search,
  Star,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Person } from "@/registry/frieda/lib/data"
import { groupBy } from "@/registry/frieda/lib/format"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { useAmountDialog } from "@/registry/frieda/components/frieda/amount-dialog"
import { ConfirmDialog, FriedaDialog, fieldClass } from "@/registry/frieda/components/frieda/dialogs"
import { outlineAction, PageHeader, primaryAction } from "@/registry/frieda/components/frieda/page-header"
import { Panel } from "@/registry/frieda/components/frieda/panel"
import { PersonAvatar } from "@/registry/frieda/components/frieda/person-avatar"
import { TransactionList } from "@/registry/frieda/components/frieda/transactions"

type SortId = "az" | "za" | "recent"
const sorts: Record<SortId, string> = { az: "A-Z", za: "Z-A", recent: "Recently added" }

function addedLabel(iso: string) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
}

function StarButton({ on, name, onClick, className }: { on: boolean; name: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "grid size-[38px] shrink-0 place-items-center rounded-[9px] border border-[#5b5b5b] transition-colors hover:border-white",
        on ? "text-teal" : "text-white",
        className
      )}
    >
      <Star className={cn("size-[18px] transition-transform active:scale-90", on && "fill-teal/15")} strokeWidth={1.7} />
    </button>
  )
}

function UserAction({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-2.5 text-[14px] text-[#c4c4c4] transition-colors hover:text-white">
      <span
        className={cn(
          "grid size-[46px] place-items-center rounded-[12px] transition-[transform,background-color] group-hover:-translate-y-0.5",
          danger ? "bg-[#7d0f24] text-[#ff4d6d] group-hover:bg-[#93142c]" : "bg-teal-deep text-[#3ad6be] group-hover:bg-[#0b6d63]"
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.7} />
      </span>
      {label}
    </button>
  )
}

function PersonDialog({
  open,
  person,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  person?: Person
  onOpenChange: (open: boolean) => void
  onSaved: (id: string) => void
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setName(person?.name ?? "")
      setEmail("")
    }
  }
  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const valid = name.trim().length >= 2 && emailValid

  return (
    <FriedaDialog
      open={open}
      onOpenChange={onOpenChange}
      title={person ? "Edit recipient" : "New recipient"}
      description={person ? "Change how this recipient appears in Frieda." : "Add someone you send money to often."}
    >
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          if (person) {
            actions.updatePerson(person.id, { name: name.trim() })
            toast.success("Recipient updated")
            onSaved(person.id)
          } else {
            const id = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`
            actions.addPerson({ id, name: name.trim(), addedAt: new Date().toISOString() })
            toast.success(`${name.trim()} added to your recipients`)
            onSaved(id)
          }
          onOpenChange(false)
        }}
      >
        <label className="block">
          <span className="mb-2 block text-[13px] text-subtle">Full name</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        {!person && (
          <label className="block">
            <span className="mb-2 block text-[13px] text-subtle">Email (optional)</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!emailValid} className={fieldClass} />
            {!emailValid && <p className="mt-1.5 text-[12px] text-[#ff6b81]">Enter a valid email address</p>}
          </label>
        )}
        <button type="submit" disabled={!valid} className={cn(primaryAction, "!mt-6 h-12 w-full text-[16px]")}>
          {person ? "Save changes" : "Add recipient"}
        </button>
      </form>
    </FriedaDialog>
  )
}

function RecipientsView() {
  const router = useRouter()
  const params = useSearchParams()
  const people = useFrieda((s) => s.people)
  const favorites = useFrieda((s) => s.favorites)
  const transactions = useFrieda((s) => s.transactions)
  const [query, setQuery] = React.useState("")
  const [onlyFavorites, setOnlyFavorites] = React.useState(false)
  const [sort, setSort] = React.useState<SortId>("az")
  const [dialog, setDialog] = React.useState<"new" | "edit" | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const amount = useAmountDialog()
  const profileRef = React.useRef<HTMLDivElement>(null)

  const fromUrl = params.get("person")
  const [selectedId, setSelectedId] = React.useState(fromUrl ?? "brandon-philips")
  const [prevUrl, setPrevUrl] = React.useState(fromUrl)
  if (fromUrl !== prevUrl) {
    setPrevUrl(fromUrl)
    if (fromUrl) setSelectedId(fromUrl)
  }

  const q = query.trim().toLowerCase()
  const visible = people
    .filter((p) => (!onlyFavorites || favorites.includes(p.id)) && p.name.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === "recent" ? new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime() : (sort === "az" ? 1 : -1) * a.name.localeCompare(b.name)
    )
  const groups = sort === "recent" ? [{ label: "Newest first", items: visible }] : groupBy(visible, (p) => p.name[0].toUpperCase())
  const selected = people.find((p) => p.id === selectedId) ?? visible[0] ?? people[0]
  const history = selected ? transactions.filter((t) => t.personId === selected.id) : []

  function select(id: string) {
    setSelectedId(id)
    router.replace(`/recipients?person=${id}`, { scroll: false })
    if (window.matchMedia("(max-width: 1023px)").matches) {
      profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <>
      <PageHeader
        title="Recipients"
        actions={
          <>
            <div role="group" aria-label="Filter" className="flex h-[38px] items-center rounded-[10px] border border-[#4a4a4a] p-[3px]">
              <button
                type="button"
                aria-label="All recipients"
                aria-pressed={!onlyFavorites}
                onClick={() => setOnlyFavorites(false)}
                className={cn("grid h-full w-[38px] place-items-center rounded-[7px] text-[#9c9c9c] transition-colors hover:text-white", !onlyFavorites && "bg-white/[0.07] text-white")}
              >
                <List className="size-[18px]" strokeWidth={1.7} />
              </button>
              <span className="mx-px h-5 w-px bg-[#4a4a4a]" />
              <button
                type="button"
                aria-label="Favorites only"
                aria-pressed={onlyFavorites}
                onClick={() => setOnlyFavorites(true)}
                className={cn("grid h-full w-[38px] place-items-center rounded-[7px] text-[#9c9c9c] transition-colors hover:text-white", onlyFavorites && "bg-white/[0.07] text-teal")}
              >
                <Star className="size-[18px]" strokeWidth={1.7} />
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className={outlineAction}>
                <ArrowDownUp /> {sort === "recent" ? "Recent" : sorts[sort]} <ChevronDown className="!size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {(Object.keys(sorts) as SortId[]).map((id) => (
                  <DropdownMenuItem key={id} onSelect={() => setSort(id)} className="justify-between">
                    {sorts[id]}
                    {sort === id && <Check className="text-teal" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" className={primaryAction} onClick={() => setDialog("new")}>
              <UserPlus /> New
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.34fr)_minmax(0,1fr)]">
        <section className="frieda-card flex min-w-0 flex-col p-[22px] lg:h-[max(640px,calc(100svh-207px))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-[#bdbdbd]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search recipients"
              className="h-[38px] w-full rounded-[10px] border border-white/[0.06] bg-[#1b1b1b] pr-4 pl-[34px] text-[14px] outline-none placeholder:text-[#bdbdbd] focus:border-teal/50"
            />
          </label>
          <div className="frieda-scroll -mr-3 mt-3 min-h-0 flex-1 overflow-y-auto pr-3">
            {visible.length === 0 ? (
              <p className="py-16 text-center text-subtle">{onlyFavorites ? "No favorites match your search." : "No recipients match your search."}</p>
            ) : (
              groups.map((g) => (
                <div key={g.label} role="group" aria-label={g.label}>
                  <div className="flex items-center gap-4 py-3 text-[16px] text-[#bdbdbd]">
                    {g.label}
                    <span className="h-px flex-1 bg-white/[0.08]" />
                  </div>
                  {g.items.map((p) => {
                    const active = selected?.id === p.id
                    return (
                      <div
                        key={p.id}
                        role="button"
                        tabIndex={0}
                        aria-current={active}
                        onClick={() => select(p.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            select(p.id)
                          }
                        }}
                        className={cn(
                          "my-0.5 flex cursor-pointer items-center gap-3 rounded-[10px] px-[11px] py-[11px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal/50",
                          active ? "bg-[#3a3a3a]" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <PersonAvatar id={p.id} name={p.name} className="size-[46px]" />
                        <span className="min-w-0 flex-1 truncate text-[18px] sm:text-[20px]">{p.name}</span>
                        <StarButton on={favorites.includes(p.id)} name={p.name} onClick={() => actions.toggleFavorite(p.id)} />
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </section>

        <div ref={profileRef} className="grid min-w-0 scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-rows-[auto_minmax(0,1fr)] lg:h-[max(640px,calc(100svh-207px))]">
          {selected ? (
            <>
              <section className="frieda-card p-[22px]">
                <div className="flex items-center gap-5">
                  <PersonAvatar id={selected.id} name={selected.name} className="size-[84px]" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[24px] leading-tight">{selected.name}</h2>
                    <p className="mt-1.5 text-[14px] text-[#bdbdbd] tabular-nums">Added in {addedLabel(selected.addedAt)}</p>
                  </div>
                  <StarButton on={favorites.includes(selected.id)} name={selected.name} onClick={() => actions.toggleFavorite(selected.id)} />
                </div>
                <div className="mt-6 flex items-center gap-4 text-[14px] text-[#bdbdbd]">
                  User actions <span className="h-px flex-1 bg-white/[0.08]" />
                </div>
                <div className="mt-5 flex justify-around gap-2">
                  <UserAction icon={ArrowUpRight} label="Send" onClick={() => amount.open("send", selected.id)} />
                  <UserAction icon={ArrowDownLeft} label="Request" onClick={() => amount.open("request", selected.id)} />
                  <UserAction icon={Gift} label="Gift" onClick={() => amount.open("gift", selected.id)} />
                  <UserAction icon={Pencil} label="Edit" onClick={() => setDialog("edit")} />
                  <UserAction icon={Trash2} label="Delete" danger onClick={() => setDeleting(true)} />
                </div>
              </section>

              <Panel title="Latest transactions" menu={false} className="min-h-[360px]" bodyClassName="-mr-3">
                <TransactionList
                  items={history}
                  group="month"
                  empty={`No transactions with ${selected.name.split(" ")[0]} yet.`}
                  className="frieda-scroll min-h-0 flex-1 overflow-y-auto pr-3"
                />
              </Panel>
            </>
          ) : (
            <section className="frieda-card grid place-items-center p-10 text-center text-subtle">Add a recipient to get started.</section>
          )}
        </div>
      </div>

      <PersonDialog
        open={dialog !== null}
        person={dialog === "edit" ? selected : undefined}
        onOpenChange={(o) => !o && setDialog(null)}
        onSaved={select}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${selected?.name ?? "recipient"}?`}
        description="They’ll be removed from your recipients. Past transactions stay in your history."
        onConfirm={() => {
          if (!selected) return
          const next = visible.find((p) => p.id !== selected.id)
          actions.removePerson(selected.id)
          if (next) select(next.id)
          toast.success(`${selected.name} deleted`)
        }}
      />
      {amount.dialog}
    </>
  )
}

export default function RecipientsPage() {
  return (
    <React.Suspense>
      <RecipientsView />
    </React.Suspense>
  )
}
