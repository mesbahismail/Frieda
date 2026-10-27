import * as React from "react"

import { cn } from "@/lib/utils"
import type { RewardArt as Art } from "@/registry/frieda/lib/data"

/** Original product illustrations for the rewards catalogue (no brand marks). */
export function RewardArt({ art, className }: { art: Art; className?: string }) {
  const id = React.useId().replace(/:/g, "")
  return (
    <svg viewBox="0 0 120 100" className={cn("h-auto w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4f8b" />
          <stop offset="0.45" stopColor="#7b3bff" />
          <stop offset="1" stopColor="#13c8f0" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f1f1" />
          <stop offset="1" stopColor="#a9a9a9" />
        </linearGradient>
        <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2ece4" />
          <stop offset="1" stopColor="#b9ae9f" />
        </linearGradient>
        <linearGradient id={`${id}-lav`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0ff" />
          <stop offset="1" stopColor="#a9b0ef" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9dcc0" />
          <stop offset="0.5" stopColor="#b9a47c" />
          <stop offset="1" stopColor="#7d6a49" />
        </linearGradient>
      </defs>

      {art === "tablet" && (
        <g>
          <rect x="30" y="8" width="16" height="86" rx="3" fill={`url(#${id}-metal)`} transform="skewY(-4)" />
          <rect x="44" y="10" width="50" height="78" rx="5" fill="#1b1b1b" transform="skewY(6)" />
          <rect x="47" y="13" width="44" height="72" rx="3" fill={`url(#${id}-screen)`} transform="skewY(6)" />
          <path d="M50 70c10-20 22-30 38-34M52 50c8 6 20 10 34 8" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" fill="none" transform="skewY(6)" />
        </g>
      )}

      {art === "headphones" && (
        <g>
          <path d="M28 58V46a32 32 0 0 1 64 0v12" fill="none" stroke={`url(#${id}-cream)`} strokeWidth="9" strokeLinecap="round" />
          <rect x="18" y="50" width="24" height="38" rx="12" fill={`url(#${id}-cream)`} />
          <rect x="78" y="50" width="24" height="38" rx="12" fill={`url(#${id}-cream)`} />
          <ellipse cx="30" cy="69" rx="6" ry="11" fill="#cfc5b7" />
          <ellipse cx="90" cy="69" rx="6" ry="11" fill="#cfc5b7" />
        </g>
      )}

      {art === "buds" && (
        <g>
          <rect x="22" y="48" width="76" height="40" rx="18" fill={`url(#${id}-lav)`} />
          <path d="M22 62h76" stroke="#8f97e0" strokeWidth="1.5" />
          <ellipse cx="60" cy="50" rx="34" ry="7" fill="#dfe2ff" />
          <circle cx="46" cy="40" r="10" fill={`url(#${id}-lav)`} />
          <circle cx="46" cy="40" r="4" fill="#7c83d6" />
          <circle cx="76" cy="26" r="10" fill={`url(#${id}-lav)`} />
          <circle cx="76" cy="26" r="4" fill="#7c83d6" />
        </g>
      )}

      {art === "laptop" && (
        <g>
          <rect x="22" y="12" width="76" height="52" rx="4" fill="#202124" stroke="#9a9a9a" strokeWidth="1.5" />
          <rect x="26" y="16" width="68" height="44" rx="2" fill={`url(#${id}-screen)`} />
          <path d="M14 66h92l-6 18H20Z" fill={`url(#${id}-metal)`} />
          <g fill="#3b3b3b">
            {Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 11 }, (_, c) => <rect key={`${r}-${c}`} x={23 + c * 6.8 + r * 0.6} y={68.5 + r * 3.6} width="5.6" height="2.6" rx="0.6" />)
            )}
          </g>
        </g>
      )}

      {art === "surface" && (
        <g>
          <path d="M30 14 86 22 92 70 34 64Z" fill="#c9c9c9" />
          <path d="M33 17 84 24 89 67 37 62Z" fill="#e7e7e7" />
          <rect x="58" y="40" width="6" height="6" fill="#9a9a9a" />
          <path d="M34 64 92 70 112 84 52 80Z" fill="#2f7fe0" />
          <path d="M40 66 90 71 104 81 54 78Z" fill="#1a5fb8" />
          <path d="M30 14 20 76 34 64" fill="#a7a7a7" />
        </g>
      )}

      {art === "speaker" && (
        <g>
          <rect x="10" y="34" width="100" height="36" rx="18" fill={`url(#${id}-gold)`} />
          <ellipse cx="60" cy="52" rx="30" ry="12" fill="none" stroke="#e8dcc2" strokeOpacity="0.5" />
          <ellipse cx="60" cy="52" rx="18" ry="7" fill="none" stroke="#e8dcc2" strokeOpacity="0.4" />
          <rect x="12" y="36" width="96" height="10" rx="5" fill="#fff" fillOpacity="0.18" />
        </g>
      )}

      {art === "phone" && (
        <g>
          <rect x="34" y="8" width="44" height="86" rx="9" fill="#2f3033" stroke="#8a8a8a" strokeWidth="1.5" />
          <rect x="40" y="14" width="20" height="20" rx="6" fill="#1d1d1f" />
          <circle cx="46" cy="20" r="4" fill="#0f0f10" stroke="#555" />
          <circle cx="54" cy="28" r="4" fill="#0f0f10" stroke="#555" />
          <circle cx="54" cy="20" r="1.6" fill="#777" />
          <rect x="62" y="20" width="42" height="72" rx="8" fill="#3a3b3f" transform="rotate(8 83 56)" />
          <rect x="65" y="24" width="36" height="64" rx="6" fill={`url(#${id}-screen)`} transform="rotate(8 83 56)" />
        </g>
      )}

      {art === "watch" && (
        <g>
          <rect x="44" y="4" width="32" height="24" rx="6" fill="#ff7a8f" />
          <rect x="44" y="72" width="32" height="24" rx="6" fill="#ff7a8f" />
          <rect x="36" y="22" width="48" height="56" rx="13" fill="#2b2b2e" stroke="#9a9a9a" strokeWidth="2" />
          <rect x="41" y="27" width="38" height="46" rx="9" fill="#0c0c0d" />
          <circle cx="60" cy="50" r="13" fill="none" stroke="#15e0cc" strokeWidth="3.5" strokeDasharray="60 82" strokeLinecap="round" transform="rotate(-90 60 50)" />
          <circle cx="60" cy="50" r="7.5" fill="none" stroke="#ff4f8b" strokeWidth="3.5" strokeDasharray="30 47" strokeLinecap="round" transform="rotate(-90 60 50)" />
          <rect x="84" y="40" width="4" height="10" rx="2" fill="#9a9a9a" />
        </g>
      )}
    </svg>
  )
}
