import { cn } from "@/lib/utils"

/** Original vector mark supplied with the Frieda brand assets. */
export function FriedaMark({ className, variant = "solid" }: { className?: string; variant?: "solid" | "ring" }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden className={cn("aspect-square shrink-0", className)}>
      {variant === "ring" && <circle cx="160" cy="160" r="160" fill="#0f1414" />}
      <path d="M152.736 319.93V183.8L90.6283 144.365C87.2101 142.182 86.2647 137.743 88.3737 134.324C90.5555 130.904 94.9918 129.958 98.4096 132.068L152.735 166.556V123.701C152.735 119.699 156.008 116.425 160.007 116.425C164.007 116.425 167.28 119.699 167.28 123.701V245.349L221.096 205.186C224.296 202.785 228.878 203.44 231.278 206.641C233.678 209.843 233.024 214.426 229.824 216.828L167.279 263.539V320C252.15 316.144 320 245.932 320 160.074C320 71.8175 248.221 0 160 0C71.7794 0 0 71.8128 0 160.074C0 245.931 67.8529 316.144 152.721 319.925L152.736 319.93Z" fill="#03DAC5" />
    </svg>
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
