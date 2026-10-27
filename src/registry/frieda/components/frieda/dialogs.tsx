"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { outlineAction, primaryAction } from "./page-header"

export const dialogSurface = "gap-0 rounded-[20px] border border-white/10 bg-[#252525] p-6 sm:max-w-[440px]"

export const fieldClass =
  "h-[50px] w-full rounded-[12px] border border-transparent bg-[#1b1b1b] px-4 text-[15px] text-white transition-colors outline-none placeholder:text-[#7a7a7a] focus:border-teal/60 aria-invalid:border-rose/70"

/** Dialog with Frieda's surface, a title and an optional description. */
export function FriedaDialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, className)}>
        <DialogHeader>
          <DialogTitle className="text-[22px] font-normal">{title}</DialogTitle>
          {description && <DialogDescription className="text-[13px] text-subtle">{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/** "Are you sure?" dialog for destructive actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirm = "Delete",
  destructive = true,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirm?: string
  destructive?: boolean
  onConfirm: () => void
}) {
  return (
    <FriedaDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className={outlineAction} onClick={() => onOpenChange(false)}>
          Cancel
        </button>
        <button
          type="button"
          autoFocus
          className={cn(primaryAction, destructive && "bg-rose text-white")}
          onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}
        >
          {confirm}
        </button>
      </div>
    </FriedaDialog>
  )
}
