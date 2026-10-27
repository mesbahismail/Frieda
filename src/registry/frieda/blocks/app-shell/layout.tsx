import { AppShell } from "@/registry/frieda/components/frieda/app-shell"

export default function FriedaLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
