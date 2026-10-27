# Frieda — free finance dashboard template for shadcn/ui

Frieda is a dark finance SaaS dashboard built with [shadcn/ui](https://ui.shadcn.com)
and [chatcn](https://github.com/leonickson1/chatcn). It ships as a free
[shadcn registry](https://ui.shadcn.com/docs/registry). It has 13 screens plus an
app shell with ⌘K search, notifications, a widgets center and the Frieda AI
assistant. Every button works and the demo runs on mock data.

Stack: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (Radix,
Nova preset) · chatcn · lucide-react · sonner.

## Screens

| Route | Block | What it shows |
| --- | --- | --- |
| `/` | `dashboard` | Balance, money flow rings, activity, goals gauge, cards, quick links, recent transactions, quick transfer |
| `/wallet` | `wallet` | Total balance chart, top spenders, top earners, top recipients |
| `/cards` | `cards` | Card carousel (top up, details, freeze, edit, delete), top earners, card budget, recent transactions |
| `/cards/new` | `add-card` | Live card preview, color picker, validated card form |
| `/transactions` | `transactions` | Grouped transactions with filters, spending donut, budget, CSV report |
| `/analytics` | `analytics` | Income management, income graph, spending, goal rings, savings |
| `/documents` | `documents` | Grid and list views, sorting, drag-and-drop upload, preview, rename, share, delete |
| `/budget` | `budget` | Monthly budget, latest transactions, spending pie, budget history, edit budget |
| `/recipients` | `recipients` | A–Z list with search, favorites and sorting, profile with send, request, gift, edit, delete |
| `/rewards` | `rewards` | Points, add points, order again, award shelves, redeem |
| `/help` | `help` | Ticket stats, ticket tabs, response rate, FAQ, new ticket |
| `/help/tickets` | `tickets` | Support chat on chatcn: replies, reactions, edit, pin, attachments, voice input, typing indicator, close and reopen |
| `/settings` | `settings` | Profile, preferences, notifications, security, demo data reset |

Every date range menu changes the numbers on its page. Cards, recipients,
favorites, pinned widgets, points, orders, your budget, tickets and chats are
saved in this browser (`localStorage`, key `frieda:v1`). Settings → Demo data
resets them.

The data lives in `lib/data.ts` and the state in `lib/store.ts`. Swap them for
your API. Support replies come from a keyword matcher in the tickets block, and
the assistant answers from `components/frieda/assistant/engine.ts`. Replace them
with your support tool and your model calls.

## Install into your project

1. Point the `@frieda` namespace at the deployed registry in `components.json`:

   ```json
   {
     "registries": {
       "@frieda": "https://YOUR-DOMAIN/r/{name}.json"
     }
   }
   ```

2. Install the theme first (so its colors replace the defaults), then the app:

   ```bash
   npx shadcn@latest add @frieda/theme @frieda/app
   ```

   Or pick single blocks, for example `npx shadcn@latest add @frieda/theme @frieda/wallet`.

3. Set up your root layout:

   ```tsx
   import { Poppins } from "next/font/google"
   import { Toaster } from "@/components/ui/sonner"
   import { TooltipProvider } from "@/components/ui/tooltip"

   const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600"] })

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en" className={`dark ${poppins.variable}`}>
         <body className="min-h-svh antialiased">
           <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
           <Toaster theme="dark" position="bottom-center" />
         </body>
       </html>
     )
   }
   ```

The pages install into `app/(frieda)/`, which shares the app shell layout. Delete the
starter `app/page.tsx` so the dashboard serves `/`. The blocks build with the
`cacheComponents` and `partialPrefetching` defaults of new Next.js apps.

## Registry items

All items are in [`registry.json`](registry.json). The sources are in
[`src/registry/frieda`](src/registry/frieda) and
[`src/components/ui/chat`](src/components/ui/chat).

- **Foundation:** `theme`, `font-poppins`, `lib`, `avatars`
- **Chat:** `chat` (chatcn)
- **Components:** `ui-kit` (panels, page header, charts, bank cards,
  transactions, dialogs, avatars, product art, document thumbnails)
- **Blocks:** `app-shell`, `dashboard`, `wallet`, `cards`, `add-card`,
  `transactions`, `analytics`, `documents`, `budget`, `recipients`, `rewards`,
  `help`, `tickets`, `settings`
- **Everything:** `app` (tagged `freebie`, `price: "free"`)

### About the `chat` item

The chats use [chatcn](https://github.com/leonickson1/chatcn) (MIT, see
`components/ui/chat/LICENSE`). Upstream chatcn ships its CSS as one string,
which the current shadcn CLI rejects (`css: expected record`). Frieda vendors
the components and publishes the CSS as a record, so the `@frieda/chat` item
installs cleanly. `scripts/registry-css.mjs` generates it.

## Develop

```bash
npm install
npm run dev
```

`npm run registry:build` copies the CSS from `globals.css` and `chatcn.css` into
`registry.json`, then writes the installable JSON to `public/r`
(`npm run build` does both). The demo routes in `src/app` re-export the blocks
from `src/registry/frieda/blocks`, so what you see is exactly what gets installed.

## Publish

1. Update `homepage` in `registry.json` if you host the docs somewhere other than GitHub.
2. Deploy (for example on Vercel). The registry is served from `/r/{name}.json`.
3. To make `@frieda/...` work without any config, submit the namespace to the
   [shadcn registry directory](https://ui.shadcn.com/docs/directory).

## Credits

- Chat components: [chatcn](https://github.com/leonickson1/chatcn) (MIT)
- Avatars: [DiceBear](https://www.dicebear.com) Avataaars by Pablo Stanley (free for personal and commercial use)
- Icons: [lucide](https://lucide.dev)

## License

MIT. Free for personal and commercial use. See [LICENSE](LICENSE).
