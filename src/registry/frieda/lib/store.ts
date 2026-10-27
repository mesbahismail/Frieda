"use client"

import { useSyncExternalStore } from "react"

import type { ChatMessageData } from "@/components/ui/chat/types"

import {
  cards as initialCards,
  documents as initialDocuments,
  monthlyBudget,
  people as initialPeople,
  rewards,
  tickets as initialTickets,
  transactions as initialTransactions,
  type BankCard,
  type DocumentItem,
  type Person,
  type Ticket,
  type Transaction,
} from "./data"

export type Panel = "assistant" | "notifications" | "widgets" | null

export type FriedaState = {
  sidebarCollapsed: boolean
  panel: Panel
  cards: BankCard[]
  people: Person[]
  favorites: string[]
  pinnedWidgets: string[]
  points: number
  orders: string[]
  budgetLimit: number
  transactions: Transaction[]
  documents: DocumentItem[]
  tickets: Ticket[]
  /** Support chat history per ticket id */
  threads: Record<string, ChatMessageData[]>
  /** Ticket id the support agent is typing in */
  supportTyping: string | null
  notificationsCleared: boolean
  claimed: string[]
}

const defaults: FriedaState = {
  sidebarCollapsed: true,
  panel: null,
  cards: initialCards,
  people: initialPeople,
  favorites: initialPeople.filter((p) => p.favorite).map((p) => p.id),
  pinnedWidgets: [],
  points: rewards.points,
  orders: rewards.orderAgain,
  budgetLimit: monthlyBudget.limit,
  transactions: initialTransactions,
  documents: initialDocuments,
  tickets: initialTickets,
  threads: {},
  supportTyping: null,
  notificationsCleared: false,
  claimed: [],
}

/** Keys kept in localStorage between visits. */
const persisted = ["sidebarCollapsed", "cards", "people", "favorites", "pinnedWidgets", "points", "orders", "budgetLimit"] as const

const STORAGE_KEY = "frieda:v1"

let state = defaults
let hydrated = false
const listeners = new Set<() => void>()

function hydrate() {
  if (hydrated || typeof window === "undefined") return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Partial<FriedaState>
    const next = { ...state }
    for (const key of persisted) {
      if (saved[key] !== undefined) (next as Record<string, unknown>)[key] = saved[key]
    }
    state = next
  } catch {
    // Storage can be unavailable (private mode). The template still works.
  }
}

function persist() {
  try {
    const snapshot: Partial<FriedaState> = {}
    for (const key of persisted) (snapshot as Record<string, unknown>)[key] = state[key]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // ignore
  }
}

function getState() {
  hydrate()
  return state
}

/** Current state outside React (timers, callbacks). */
export function getFriedaState() {
  return getState()
}

export function setState(update: Partial<FriedaState> | ((s: FriedaState) => Partial<FriedaState>)) {
  const patch = typeof update === "function" ? update(getState()) : update
  state = { ...getState(), ...patch }
  persist()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Read one slice of the Frieda store. Select a field, not a new object. */
export function useFrieda<T>(selector: (s: FriedaState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(defaults)
  )
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export const actions = {
  toggleSidebar: () => setState((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openPanel: (panel: Panel) => setState({ panel }),
  closePanel: () => setState({ panel: null }),

  addCard: (card: BankCard) => setState((s) => ({ cards: [card, ...s.cards] })),
  updateCard: (id: string, patch: Partial<BankCard>) =>
    setState((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  removeCard: (id: string) => setState((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

  addPerson: (person: Person) => setState((s) => ({ people: [...s.people, person] })),
  updatePerson: (id: string, patch: Partial<Person>) =>
    setState((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removePerson: (id: string) =>
    setState((s) => ({ people: s.people.filter((p) => p.id !== id), favorites: s.favorites.filter((f) => f !== id) })),

  toggleFavorite: (id: string) =>
    setState((s) => ({
      favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
    })),

  toggleWidget: (id: string) =>
    setState((s) => ({
      pinnedWidgets: s.pinnedWidgets.includes(id)
        ? s.pinnedWidgets.filter((w) => w !== id)
        : [...s.pinnedWidgets, id],
    })),

  redeem: (id: string, cost: number) => {
    if (getState().points < cost) return false
    setState((s) => ({ points: s.points - cost, orders: [id, ...s.orders.filter((o) => o !== id)] }))
    return true
  },
  addPoints: (points: number) => setState((s) => ({ points: s.points + points })),

  setBudgetLimit: (budgetLimit: number) => setState({ budgetLimit }),

  addTransaction: (tx: Transaction) => setState((s) => ({ transactions: [tx, ...s.transactions] })),

  addDocument: (doc: DocumentItem) => setState((s) => ({ documents: [doc, ...s.documents] })),
  updateDocument: (id: string, patch: Partial<DocumentItem>) =>
    setState((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
  removeDocument: (id: string) => setState((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

  addTicket: (ticket: Ticket) => setState((s) => ({ tickets: [ticket, ...s.tickets] })),
  setTicketStatus: (id: string, status: Ticket["status"]) =>
    setState((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) })),
  setThread: (id: string, messages: ChatMessageData[]) => setState((s) => ({ threads: { ...s.threads, [id]: messages } })),
  setSupportTyping: (supportTyping: string | null) => setState({ supportTyping }),
  addMessage: (id: string, message: ChatMessageData) =>
    setState((s) => ({ threads: { ...s.threads, [id]: [...(s.threads[id] ?? []), message] } })),

  /** Restore the template's sample data (and forget what was saved in this browser). */
  reset: () => setState({ ...defaults }),

  clearNotifications: () => setState({ notificationsCleared: true }),
  claim: (id: string) => setState((s) => ({ claimed: [...s.claimed, id] })),
}
