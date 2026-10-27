"use client"

import { AssistantPanel } from "./assistant/assistant-panel"
import { NotificationsPanel } from "./notifications-panel"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { WidgetsPanel } from "./widgets"

/** Sidebar + top bar + the three right-hand panels. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pt-[18px] pb-10 sm:px-6 lg:px-[46px] lg:pb-[38px]">{children}</main>
      </div>
      <AssistantPanel />
      <NotificationsPanel />
      <WidgetsPanel />
    </div>
  )
}
