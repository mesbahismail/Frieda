"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { avatarSrc } from "@/registry/frieda/lib/data"
import { initials } from "@/registry/frieda/lib/format"

const tones = {
  teal: "bg-[#0f5d56]",
  purple: "bg-[#5a3fb0]",
  dark: "bg-[#2f2f2f]",
}

/** Round avatar on a coloured backdrop. Falls back to initials when there is no picture. */
export function PersonAvatar({
  id,
  name,
  className,
  tone = "teal",
  ring = false,
}: {
  id: string
  name?: string
  className?: string
  tone?: keyof typeof tones
  ring?: boolean
}) {
  const [failedId, setFailedId] = React.useState<string | null>(null)
  const failed = failedId === id
  return (
    <span
      className={cn(
        "@container relative inline-grid aspect-square size-10 shrink-0 place-items-center overflow-hidden rounded-full",
        tones[tone],
        ring && "ring-2 ring-[#0f5d56] ring-offset-2 ring-offset-[#2a2a2a]",
        className
      )}
    >
      {failed ? (
        <span aria-label={name} className="text-[38cqw] font-medium text-teal">
          {initials(name ?? id)}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG avatars
        <img
          src={avatarSrc(id)}
          alt={name ?? ""}
          onError={() => setFailedId(id)}
          className="absolute inset-x-0 bottom-0 h-[112%] w-full object-cover object-top"
          draggable={false}
        />
      )}
    </span>
  )
}
