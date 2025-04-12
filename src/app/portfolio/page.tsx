"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ArrowUpDown, ExternalLink, Wallet, Clock } from "lucide-react"
import { VaultType } from "@/lib/types"
import Link from "next/link"

export default function PortfolioPage() {
  const { address, connect } = useWallet()
  const { 
    callVaultData, 
    condorVaultData, 
    userSusdsBalance, 
    callVaultShares, 
    condorVaultShares, 
    // TODO: Add Put vault shares if directional vault has separate put shares
    // putVaultShares, 
    // TODO: Add claimable earnings fetching if needed
    // claimProfits 
  } = useVaultData()
  const [totalValue, setTotalValue] = useState(0)

  // TODO: Re-evaluate total value calculation based on available data
  useEffect(() => {
    if (address && callVaultData && condorVaultData && callVaultData.sharePrice && condorVaultData.sharePrice) {
      // Calculate total portfolio value
      const callValue = Number(callVaultShares) * parseFloat(callVaultData.sharePrice);
      const condorValue = Number(condorVaultShares) * parseFloat(condorVaultData.sharePrice);
      // const pendingValue = (callVaultData.queuedDeposits || 0) + (condorVaultData.queuedDeposits || 0); // Need amounts not counts
      // const claimableValue = 0; // Placeholder - needs fetching
      
      // Rough estimate using shares and share price
      setTotalValue(callValue + condorValue + Number(userSusdsBalance)); 
    }
  }, [address, userSusdsBalance, callVaultShares, condorVaultShares, callVaultData, condorVaultData])

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>
          <p className="text-zinc-400 mb-8">
            Connect your wallet to view your portfolio and manage your vault positions.
          </p>
          <Button
            onClick={connect}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Portfolio</h1>
        <p className="text-zinc-400">Manage your vault positions and track your performance</p>
      </div>

      <Card className="mb-8 bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-zinc-400" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-zinc-400">Total Value</div>
              <div className="text-3xl font-mono">{formatCurrency(totalValue)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-zinc-400">Wallet Balance</div>
              <div className="text-3xl font-mono">{formatCurrency(Number(userSusdsBalance))}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-zinc-400">Claimable Earnings</div>
              <div className="text-3xl font-mono text-green-400">
                {/* TODO: Display actual claimable earnings */}
                {formatCurrency(0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Your Positions</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Directional Vault Position */}
        <Card
          className={`bg-gradient-to-b from-zinc-900 to-zinc-950 border-blue-500/20 ${Number(callVaultShares) <= 0 /* && vaults.directional.pendingDeposit <= 0 */ ? "opacity-50" : ""}`}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/10 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Directional Vault</h3>
                  <p className="text-sm text-zinc-400">Call/Put Spreads Strategy</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {Number(callVaultShares) > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Your Shares</div>
                    <div className="text-lg font-mono">{Number(callVaultShares).toFixed(6)}</div>
                  </div>
                  <div className="bg-blue-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Value</div>
                    <div className="text-lg font-mono">
                      {callVaultData?.sharePrice ? 
                         formatCurrency(Number(callVaultShares) * parseFloat(callVaultData.sharePrice)) 
                         : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link href="/" onClick={() => localStorage.setItem("selectedVault", VaultType.DIRECTIONAL)}>
                    <Button variant="outline" size="sm" className="border-blue-500/20 hover:bg-blue-500/10">
                      Manage Position
                    </Button>
                  </Link>

                  {/* TODO: Check actual claimable > 0 */}
                  {/* {vaults.directional.claimableEarnings > 0 && (
                    <Button className="bg-green-500 hover:bg-green-600 text-white" size="sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Claim {formatCurrency(vaults.directional.claimableEarnings)}
                    </Button>
                  )} */}
                </div>
              </div>
            ) : (callVaultData?.queuedDeposits ?? 0) > 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-500/5 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Pending Deposit</div>
                   {/* TODO: Display actual pending amount */}
                  <div className="text-lg font-mono">{formatCurrency(0)}</div>
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Will be processed at next cycle: {callVaultData?.nextCycleExpiry ? new Date(callVaultData.nextCycleExpiry * 1000).toLocaleDateString() : "N/A"}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="border-blue-500/20 hover:bg-blue-500/10">
                  Cancel Pending Deposit
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-400 mb-4">You don&apos;t have any position in this vault</p>
                <Link href="/" onClick={() => localStorage.setItem("selectedVault", VaultType.DIRECTIONAL)}>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    Deposit Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rangebound Vault Position */}
        <Card
          className={`bg-gradient-to-b from-zinc-900 to-zinc-950 border-purple-500/20 ${Number(condorVaultShares) <= 0 /* && vaults.rangebound.pendingDeposit <= 0 */ ? "opacity-50" : ""}`}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/10 p-2 rounded-full">
                  <ArrowUpDown className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">Rangebound Vault</h3>
                  <p className="text-sm text-zinc-400">Iron Condor Strategy</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {Number(condorVaultShares) > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Your Shares</div>
                    <div className="text-lg font-mono">{Number(condorVaultShares).toFixed(6)}</div>
                  </div>
                  <div className="bg-purple-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Value</div>
                    <div className="text-lg font-mono">
                      {condorVaultData?.sharePrice ? 
                         formatCurrency(Number(condorVaultShares) * parseFloat(condorVaultData.sharePrice)) 
                         : "N/A"}
                    </div>
                  </div>
                </div>

                <Link href="/" onClick={() => localStorage.setItem("selectedVault", VaultType.RANGEBOUND)}>
                  <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10">
                    Manage Position
                  </Button>
                </Link>
              </div>
            ) : (condorVaultData?.queuedDeposits ?? 0) > 0 ? (
              <div className="space-y-4">
                <div className="bg-purple-500/5 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Pending Deposit</div>
                   {/* TODO: Display actual pending amount */}
                  <div className="text-lg font-mono">{formatCurrency(0)}</div>
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Will be processed at next cycle: {condorVaultData?.nextCycleExpiry ? new Date(condorVaultData.nextCycleExpiry * 1000).toLocaleDateString() : "N/A"}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                  Cancel Pending Deposit
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-400 mb-4">You don&apos;t have any position in this vault</p>
                <Link href="/" onClick={() => localStorage.setItem("selectedVault", VaultType.RANGEBOUND)}>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    Deposit Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
