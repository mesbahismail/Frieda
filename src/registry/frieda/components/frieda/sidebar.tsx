"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, ListIndentDecrease } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isActive, mainNav, secondaryNav, type NavItem } from "@/registry/frieda/lib/nav"
import { actions, useFrieda } from "@/registry/frieda/lib/store"
import { FriedaLogo, FriedaMark } from "./logo"

function NavLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group/nav relative flex items-center text-[16px] text-[#a6a6a6] transition-colors outline-none hover:text-white focus-visible:text-white",
        collapsed ? "h-[42px] justify-center" : "h-[50px] gap-[13px] pl-8",
        active && "text-white"
      )}
    >
      {active && (
        <>
          <span
            className={cn(
              "absolute inset-y-0 left-0 right-0",
              collapsed
                ? "bg-[#3d3d3d]"
                : "bg-[linear-gradient(90deg,#3a3a3a_0%,#323232_55%,rgb(50_50_50/0)_100%)]"
            )}
          />
          <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-teal" />
        </>
      )}
      {!active && (
        <span className="absolute inset-y-0 left-0 right-0 bg-white/[0.03] opacity-0 transition-opacity group-hover/nav:opacity-100" />
      )}
      <Icon className={cn("relative size-[21px] shrink-0", active && "text-white")} strokeWidth={1.6} />
      {!collapsed && <span className="relative truncate">{item.label}</span>}
    </Link>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col justify-between pb-[46px]">
      <div className={cn("flex flex-col", collapsed ? "gap-[15px]" : "gap-[11px]")}>
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
      <div className={cn("mt-8 flex flex-col", collapsed ? "gap-[15px]" : "gap-[11px]")}>
        {secondaryNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </nav>
  )
}

export function Sidebar() {
  const collapsed = useFrieda((s) => s.sidebarCollapsed)
  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-svh shrink-0 flex-col border-r border-white/[0.04] bg-[linear-gradient(180deg,#1f1f1f_0%,#232323_45%,#2b2b2b_100%)] transition-[width] duration-300 ease-out md:flex",
        collapsed ? "w-[76px]" : "w-[266px]"
      )}
    >
      {collapsed ? (
        <div className="relative flex h-[100px] shrink-0 items-start justify-center pt-[31px]">
          <Link href="/" aria-label="Frieda home">
            <FriedaMark className="size-[35px]" />
          </Link>
          <button
            type="button"
            onClick={actions.toggleSidebar}
            aria-label="Expand sidebar"
            className="absolute top-[19px] -right-[11px] grid size-[22px] place-items-center rounded-full border border-white/10 bg-[#353535] text-[#d0d0d0] transition-colors hover:bg-[#444] hover:text-white"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-[100px] shrink-0 items-start justify-between pt-[27px] pr-[26px] pl-[23px]">
          <Link href="/" aria-label="Frieda home">
            <FriedaLogo />
          </Link>
          <button
            type="button"
            onClick={actions.toggleSidebar}
            aria-label="Collapse sidebar"
            className="mt-1 grid size-7 place-items-center rounded-md text-[#bdbdbd] transition-colors hover:bg-white/5 hover:text-white"
          >
            <ListIndentDecrease className="size-[22px]" strokeWidth={1.6} />
          </button>
        </div>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col", collapsed ? "pt-[21px]" : "pt-[12px]")}>
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  )
}
