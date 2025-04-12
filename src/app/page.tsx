import type { Metadata } from "next"
import VaultDashboard from "@/components/vault-dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Klyra | Options Vaults",
  description: "Deposit stablecoins into strategy vaults based on your market outlook",
}

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light" forcedTheme="light">
      <main className="min-h-screen bg-gray-50">
        <VaultDashboard />
      </main>
    </ThemeProvider>
  )
}
