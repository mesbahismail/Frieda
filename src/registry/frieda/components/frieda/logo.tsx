import { cn } from "@/lib/utils"

function Sprout({ className, strokeWidth = 1.9 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 6.2V19M7.4 8.6 12 11.7M12 15.6l4.7-3.1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The Frieda sprout mark. `ring` puts the sprout on a dark disc inside the teal circle. */
export function FriedaMark({
  className,
  variant = "solid",
}: {
  className?: string
  variant?: "solid" | "ring"
}) {
  if (variant === "ring") {
    return (
      <span className={cn("grid aspect-square place-items-center rounded-full bg-teal", className)}>
        <span className="grid size-[52%] place-items-center rounded-full bg-[#0f1414] text-teal">
          <Sprout className="size-[70%]" strokeWidth={2.2} />
        </span>
      </span>
    )
  }
  return (
    <span className={cn("grid aspect-square place-items-center rounded-full bg-teal text-[#0b2b28]", className)}>
      <Sprout className="size-[72%]" />
    </span>
  )
}

export function FriedaLogo({ className, collapsed = false }: { className?: string; collapsed?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <FriedaMark className="size-[34px] shrink-0" />
      {!collapsed && (
        <span className="text-[24px] leading-none font-semibold tracking-[0.02em] text-white">FRIEDA</span>
      )}
    </span>
  )
}
