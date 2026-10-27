import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: {
    default: "Frieda — Finance dashboard",
    template: "%s · Frieda",
  },
  description:
    "Frieda is a free dark finance dashboard template for shadcn/ui with an AI assistant and support chat built on chatcn.",
}

export const viewport: Viewport = {
  themeColor: "#2b2b2b",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`}>
      <body className="min-h-svh antialiased">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  )
}
