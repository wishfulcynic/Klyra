"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WalletNotification() {
  const [showNotification, setShowNotification] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if MetaMask is installed
    const hasMetaMask = typeof window !== "undefined" && window.ethereum?.isMetaMask
    setShowNotification(!hasMetaMask)
  }, [])

  if (!mounted || !showNotification) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">MetaMask Not Detected</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowNotification(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">To connect your wallet, please install the MetaMask extension.</p>
          <div className="mt-3">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-4 py-2"
            >
              Install MetaMask
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
