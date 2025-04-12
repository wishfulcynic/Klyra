"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useConnect } from "wagmi"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isLoading, pendingConnector } = useConnect({
    onSuccess: () => {
      onClose()
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Connect your wallet to access the Thetanuts SubDAO options vaults.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {connectors.map((connector) => {
            const isConnecting = isLoading && pendingConnector?.id === connector.id

            // Skip if connector is not ready (e.g., MetaMask not installed)
            if (!connector.ready && connector.id === "metaMask") {
              return (
                <a
                  key={connector.id}
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-4 py-6 border-gray-200 hover:bg-gray-50"
                  >
                    <img src="/placeholder.svg?height=32&width=32" alt="MetaMask" className="h-8 w-8" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Install MetaMask</span>
                      <span className="text-xs text-gray-500">Click to install MetaMask extension</span>
                    </div>
                  </Button>
                </a>
              )
            }

            return (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-start gap-4 py-6 border-gray-200 hover:bg-gray-50"
                onClick={() => connect({ connector })}
                disabled={isConnecting}
              >
                {connector.id === "metaMask" && (
                  <img src="/placeholder.svg?height=32&width=32" alt="MetaMask" className="h-8 w-8" />
                )}
                {connector.id === "walletConnect" && (
                  <img src="/placeholder.svg?height=32&width=32" alt="WalletConnect" className="h-8 w-8" />
                )}
                {connector.id === "coinbaseWallet" && (
                  <img src="/placeholder.svg?height=32&width=32" alt="Coinbase Wallet" className="h-8 w-8" />
                )}
                {connector.id === "injected" && (
                  <img src="/placeholder.svg?height=32&width=32" alt="Browser Wallet" className="h-8 w-8" />
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {connector.name}
                    {isConnecting && " (connecting...)"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {connector.id === "metaMask" && "Connect using MetaMask"}
                    {connector.id === "walletConnect" && "Connect using mobile wallet"}
                    {connector.id === "coinbaseWallet" && "Connect using Coinbase Wallet"}
                    {connector.id === "injected" && "Connect using browser wallet"}
                  </span>
                </div>
              </Button>
            )
          })}
        </div>
        <div className="flex justify-center text-xs text-gray-500">
          <p>By connecting, you agree to the Terms of Service</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
