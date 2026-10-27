"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu, MessageSquareText, Settings, Sparkles, UserPlus, UserRound, LifeBuoy } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { user } from "@/registry/frieda/lib/data"
import { actions, useFrieda, type Panel } from "@/registry/frieda/lib/store"
import { FriedaLogo } from "./logo"
import { PersonAvatar } from "./person-avatar"
import { GlobalSearch } from "./search"
import { SidebarNav } from "./sidebar"

function IconAction({
  label,
  panel,
  dot,
  children,
}: {
  label: string
  panel: Exclude<Panel, null>
  dot?: boolean
  children: React.ReactNode
}) {
  const active = useFrieda((s) => s.panel === panel)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={() => actions.openPanel(panel)}
          className={cn(
            "relative grid size-10 place-items-center rounded-xl text-[#e6e6e6] transition-colors hover:bg-white/[0.06] hover:text-white [&_svg]:size-[23px]",
            active && "text-teal"
          )}
        >
          {children}
          {dot && <span className="absolute right-[9px] bottom-[10px] size-[7px] rounded-full bg-teal ring-2 ring-[#2c2c2c]" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function MobileNav() {
  const [open, setOpen] = React.useState(false)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label="Open menu"
        className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-[#151515] text-white md:hidden"
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-[linear-gradient(180deg,#1f1f1f_0%,#2b2b2b_100%)] outline-none data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left"
        >
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <div className="flex h-[88px] items-center px-6">
            <FriedaLogo />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-2">
            <SidebarNav collapsed={false} onNavigate={() => setOpen(false)} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function Topbar() {
  const router = useRouter()
  const cleared = useFrieda((s) => s.notificationsCleared)
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 bg-[#2c2c2c]/80 px-4 backdrop-blur-md sm:px-6 lg:bg-transparent lg:px-[46px] lg:backdrop-blur-none">
      <MobileNav />
      <div className="hidden h-[38px] shrink-0 items-center rounded-[10px] bg-[#151515] px-1 sm:flex">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="grid h-full w-[34px] place-items-center rounded-l-[9px] text-[#e0e0e0] transition-colors hover:text-white"
        >
          <ChevronLeft className="size-[18px]" />
        </button>
        <span className="h-[18px] w-px bg-[#4a4a4a]" />
        <button
          type="button"
          aria-label="Go forward"
          onClick={() => router.forward()}
          className="grid h-full w-[34px] place-items-center rounded-r-[9px] text-[#e0e0e0] transition-colors hover:text-white"
        >
          <ChevronRight className="size-[18px]" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 justify-center px-0 sm:px-4 lg:justify-start lg:pl-[13%]">
        <GlobalSearch className="max-w-[456px]" />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <IconAction label="Notifications" panel="notifications" dot={!cleared}>
          <Bell strokeWidth={1.6} />
        </IconAction>
        <span className="hidden h-6 w-px bg-[#4a4a4a] sm:block" />
        <IconAction label="Ask Frieda AI" panel="assistant" dot>
          <MessageSquareText strokeWidth={1.6} />
        </IconAction>
        <span className="hidden h-6 w-px bg-[#4a4a4a] sm:block" />
        <IconAction label="Widgets center" panel="widgets">
          <Sparkles strokeWidth={1.6} />
        </IconAction>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-2 flex items-center gap-3 rounded-full py-1 pr-1 pl-1 outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-teal/50 sm:ml-6 sm:pr-2">
            <PersonAvatar id={user.avatar} name={user.displayName} className="size-[36px] ring-2 ring-[#0f5d56]" />
            <span className="hidden text-[17px] text-white sm:inline">{user.displayName}</span>
            <ChevronDown className="hidden size-4 text-[#d6d6d6] sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm text-white">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserRound /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">
                <LifeBuoy /> Help center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast("Hook this up to your auth provider to add accounts")}>
              <UserPlus /> Add account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => toast("Signed out (demo)")}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
