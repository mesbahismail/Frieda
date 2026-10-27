"use client"

import { X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Right-hand overlay panel (AI chat, notifications, widgets center). */
export function SidePanel({
  open,
  onOpenChange,
  title,
  leading,
  actions,
  blur = false,
  className,
  bodyClassName,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  /** Rendered before the title, e.g. a back button */
  leading?: React.ReactNode
  actions?: React.ReactNode
  /** Heavy frosted backdrop like the AI chat design */
  blur?: boolean
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            blur ? "bg-black/45 backdrop-blur-[14px]" : "bg-black/35"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "frieda-panel fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/[0.08] shadow-[-30px_0_60px_rgb(0_0_0/0.35)] outline-none sm:w-[min(722px,100vw)] lg:w-[50vw] lg:max-w-[880px] lg:min-w-[640px]",
            "duration-300 ease-out data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
            className
          )}
          aria-describedby={undefined}
        >
          <header className="flex shrink-0 items-center gap-4 px-5 pt-[30px] pb-5 sm:px-[37px]">
            {leading}
            <DialogPrimitive.Title asChild>
              <div className="min-w-0 flex-1 truncate text-[26px] leading-tight font-normal text-white sm:text-[30px]">{title}</div>
            </DialogPrimitive.Title>
            {actions}
            <DialogPrimitive.Close
              aria-label="Close panel"
              className="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-[#5a5a5a] text-white transition-colors hover:bg-white/[0.06]"
            >
              <X className="size-5" strokeWidth={1.8} />
            </DialogPrimitive.Close>
          </header>
          <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export const panelButton =
  "inline-flex h-[38px] shrink-0 items-center gap-2 rounded-[10px] border border-[#5a5a5a] px-4 text-[15px] text-white transition-colors hover:bg-white/[0.06] [&_svg]:size-[18px]"
