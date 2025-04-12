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
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  // Connect to MetaMask
  const connect = async () => {
    if (!hasEthereum()) {
      alert("Please install a wallet extension like MetaMask.")
      return
    }
    setIsConnecting(true)
    try {
      // Use non-null assertion assuming hasEthereum check is sufficient
      const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" }) as string[]; 
      if (accounts && accounts.length > 0) {
        // Directly set state here
        setAddress(accounts[0]);
        setIsConnected(true);
        // Also fetch chain ID upon successful connection
        const chainIdResult = await window.ethereum!.request({ method: "eth_chainId" }) as string;
        setChainId(Number.parseInt(chainIdResult, 16));
      } else {
         console.warn("Wallet connection attempt failed or no accounts found.");
         setIsConnected(false);
         setAddress(null);
         setChainId(null);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setIsConnected(false);
      setAddress(null);
      setChainId(null);
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    // Optional: Add specific disconnect logic if provider supports it
    // For MetaMask, usually just clearing state is enough
    setAddress(null)
    setIsConnected(false)
    setChainId(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (hasEthereum()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has disconnected accounts
          disconnect()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      }

      // Add listeners
      window.ethereum!.on("accountsChanged", handleAccountsChanged)
      window.ethereum!.on("chainChanged", handleChainChanged)

      // Check initial connection status and accounts
      window.ethereum!.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleAccountsChanged(accounts)
          }
        })
        .catch((err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
             console.error("Error checking accounts:", err)
        })
        
      // Get initial chain ID
       window.ethereum!.request({ method: "eth_chainId" }).then((chainId: string) => {
         setChainId(Number.parseInt(chainId, 16))
       })

      // Cleanup
      return () => {
        // Ensure removeListener exists before calling
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [address]) // Rerun effect if address changes (e.g., on disconnect)

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: (request: { method: string; params?: any[] }) => Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (event: string, handler: (...args: any[]) => void) => void
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}
