"use client"
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useConnect } from "wagmi"
import type { Connector } from 'wagmi'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect();
  
  const [connectingConnectorId, setConnectingConnectorId] = useState<string | null>(null);

  const handleConnect = (connector: Connector) => {
    setConnectingConnectorId(connector.id);
    connect(
      { connector },
      {
        onSuccess: () => {
          setConnectingConnectorId(null);
          onClose();
        },
        onError: (error) => {
          console.error("Connection Error:", error);
          setConnectingConnectorId(null);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Connect your wallet to access the Klyra options vaults.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {connectors.map((connector) => {
            const isConnecting = isPending && connectingConnectorId === connector.id;

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
                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">?</div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Install MetaMask</span>
                      <span className="text-xs text-gray-500">Click to install browser extension</span>
                    </div>
                  </Button>
                </a>
              )
            }
            
            const connectorNotReady = !connector.ready;

            return (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-start gap-4 py-6 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => handleConnect(connector)}
                disabled={isConnecting || connectorNotReady}
              >
                <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">?</div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {connector.name}
                    {isConnecting && " (connecting...)"}
                    {connectorNotReady && " (Unavailable)"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Connect using {connector.name}
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
