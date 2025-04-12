"use client"

import { type ReactNode, createContext, useEffect, useState } from "react"

interface WalletContextType {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  isConnected: boolean
  chainId: number | null
}

// Export the context so it can be imported elsewhere
export const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  isConnected: false,
  chainId: null,
})

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Check if window.ethereum is available
  const hasEthereum = () => {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // Connect to MetaMask
  const connect = async () => {
    if (!hasEthereum()) {
      alert("Please install MetaMask to connect")
      return
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)

        // Get chain ID
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(Number.parseInt(chainId, 16))
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setChainId(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (hasEthereum()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnect()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      }

      // Subscribe to events
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Check if already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)

            // Get chain ID
            window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
              setChainId(Number.parseInt(chainId, 16))
            })
          }
        })
        .catch((err: any) => console.error("Error checking accounts:", err))

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [address])

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
        isConnecting,
        isConnected,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      selectedAddress?: string
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}
