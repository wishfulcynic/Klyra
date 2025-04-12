"use client"

import { useState, useEffect } from "react"
import { WalletProvider } from "@/components/wallet-provider"
import { VaultList } from "@/components/vault-list"
import { VaultDetail } from "@/components/vault-detail"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoadingScreen } from "@/components/loading-screen"
import { WalletNotification } from "@/components/wallet-notification"
import type { VaultType } from "@/lib/types"
import { AnimatePresence, motion } from "framer-motion"

export default function VaultDashboard() {
  const [selectedVault, setSelectedVault] = useState<VaultType | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 2000)

    // Check if there's a selected vault in localStorage (for navigation from portfolio)
    const savedVault = localStorage.getItem("selectedVault") as VaultType | null
    if (savedVault) {
      setSelectedVault(savedVault)
      localStorage.removeItem("selectedVault")
    }

    return () => clearTimeout(timer)
  }, [])

  return (
    <WalletProvider>
      <AnimatePresence>{!isLoaded && <LoadingScreen />}</AnimatePresence>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 container mx-auto px-4 py-8 max-w-7xl"
        >
          <AnimatePresence mode="wait">
            {!selectedVault ? (
              <motion.div
                key="vault-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VaultList onSelectVault={setSelectedVault} />
              </motion.div>
            ) : (
              <motion.div
                key="vault-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VaultDetail vaultType={selectedVault} onBack={() => setSelectedVault(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <Footer />
        <WalletNotification />
      </div>
    </WalletProvider>
  )
}
