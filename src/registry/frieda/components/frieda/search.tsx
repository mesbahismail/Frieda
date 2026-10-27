"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, FileText, Search, X, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { recentSearches } from "@/registry/frieda/lib/data"
import { money } from "@/registry/frieda/lib/format"
import { mainNav, secondaryNav } from "@/registry/frieda/lib/nav"
import { useFrieda } from "@/registry/frieda/lib/store"
import { PersonAvatar } from "./person-avatar"
import { kindMeta } from "./transactions"

type Result = {
  id: string
  group: string
  label: string
  hint?: string
  href: string
  icon?: LucideIcon
  personId?: string
}

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState(0)
  const [recent, setRecent] = React.useState(recentSearches)
  const transactions = useFrieda((s) => s.transactions)
  const documents = useFrieda((s) => s.documents)
  const people = useFrieda((s) => s.people)

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("mousedown", onClick)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("mousedown", onClick)
    }
  }, [])

  const q = query.trim().toLowerCase()
  const results: Result[] = React.useMemo(() => {
    if (!q) {
      return recent.map((r, i) => ({ id: `recent-${i}`, group: "Recent history", label: r, href: hrefForRecent(r) }))
    }
    const pages = [...mainNav, ...secondaryNav]
      .filter((n) => `${n.label} ${n.keywords}`.toLowerCase().includes(q))
      .map((n) => ({ id: n.href, group: "Pages", label: n.label, href: n.href, icon: n.icon }))
    const ppl = people
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ id: p.id, group: "Recipients", label: p.name, href: `/recipients?person=${p.id}`, personId: p.id }))
    const txs = transactions
      .filter((t) => t.title.toLowerCase().includes(q) || kindMeta[t.kind].label.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        group: "Transactions",
        label: t.title,
        hint: money(t.amount, { cents: true, signed: true }),
        href: "/transactions",
        icon: kindMeta[t.kind].icon,
      }))
    const docs = documents
      .filter((d) => d.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d) => ({ id: d.id, group: "Documents", label: d.name, hint: `${d.size} MB`, href: `/documents?q=${encodeURIComponent(d.name)}`, icon: FileText }))
    return [...pages, ...ppl, ...txs, ...docs]
  }, [q, recent, transactions, documents, people])

  function go(result: Result) {
    if (q) setRecent((r) => [query.trim(), ...r.filter((x) => x !== query.trim())].slice(0, 5))
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    router.push(result.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setCursor((c) => Math.min(results.length - 1, c + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setCursor((c) => Math.max(0, c - 1))
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault()
      go(results[cursor])
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }


  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative z-40 flex h-[38px] items-center gap-2.5 border border-[#3b3b3b] bg-[#181818] px-3.5 transition-[border-radius,background-color]",
          open ? "rounded-t-[10px] border-b-transparent bg-[#1c1c1c]" : "rounded-[10px]"
        )}
      >
        <Search className="size-[18px] shrink-0 text-[#cfcfcf]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setCursor(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search"
          role="combobox"
          aria-expanded={open}
          aria-controls="frieda-search-results"
          aria-autocomplete="list"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#a8a8a8]"
        />
        {open ? (
          <button
            type="button"
            aria-label="Close search"
            onClick={() => {
              setQuery("")
              setOpen(false)
            }}
            className="grid size-6 place-items-center rounded-md text-[#cfcfcf] hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="hidden rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-[#8a8a8a] lg:block">⌘K</kbd>
        )}
      </div>
      {open && (
        <div
          id="frieda-search-results"
          role="listbox"
          className="absolute inset-x-0 top-[37px] z-40 max-h-[60vh] overflow-y-auto rounded-b-[10px] border border-t-0 border-[#3b3b3b] bg-[#1c1c1c] px-3 pt-2 pb-3 shadow-[0_24px_50px_rgb(0_0_0/0.5)] frieda-scroll"
        >
          {results.length === 0 && <p className="px-2 py-6 text-center text-sm text-subtle">No results for “{query}”</p>}
          {results.map((r, i) => {
            const header = r.group !== results[i - 1]?.group ? r.group : null
            const Icon = r.icon ?? Search
            return (
              <React.Fragment key={r.id}>
                {header && <div className="px-1 pt-2 pb-2.5 text-[14px] text-[#b5b5b5]">{header}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={cursor === i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(r)}
                  className={cn(
                    "mb-[7px] flex h-[39px] w-full items-center gap-3 rounded-[8px] px-3 text-left text-[15px] text-[#ededed] transition-colors",
                    cursor === i ? "bg-[#3a3a3a]" : "bg-[#2e2e2e]"
                  )}
                >
                  {r.personId ? (
                    <PersonAvatar id={r.personId} className="size-6" />
                  ) : (
                    <Icon className="size-[18px] shrink-0 text-[#d0d0d0]" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{r.label}</span>
                  {r.hint && <span className="text-[13px] text-subtle tabular-nums">{r.hint}</span>}
                  <ChevronRight className="size-4 shrink-0 text-[#bdbdbd]" />
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

function hrefForRecent(text: string) {
  const t = text.toLowerCase()
  if (t.includes("transaction")) return "/transactions"
  if (t.includes("card")) return "/cards"
  if (t.includes("payment") || t.includes("send")) return "/wallet"
  return "/recipients"
}
