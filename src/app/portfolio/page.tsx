"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ArrowUpDown, ExternalLink, DollarSign, Wallet, Clock } from "lucide-react"
import { VaultType } from "@/lib/types"
import Link from "next/link"

export default function PortfolioPage() {
  const { address, connect } = useWallet()
  const { vaults, userBalances } = useVaultData()
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    if (address) {
      // Calculate total portfolio value
      const directionalValue = userBalances.directionalShares * vaults.directional.sharePrice
      const rangeboundValue = userBalances.rangeboundShares * vaults.rangebound.sharePrice
      const pendingValue = vaults.directional.pendingDeposit + vaults.rangebound.pendingDeposit
      const claimableValue = vaults.directional.claimableEarnings

      setTotalValue(directionalValue + rangeboundValue + pendingValue + claimableValue)
    }
  }, [address, userBalances, vaults])

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <div className="text-3xl font-mono">{formatCurrency(userBalances.stablecoin)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-zinc-400">Claimable Earnings</div>
              <div className="text-3xl font-mono text-green-400">
                {formatCurrency(vaults.directional.claimableEarnings)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Your Positions</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Directional Vault Position */}
        <Card
          className={`bg-gradient-to-b from-zinc-900 to-zinc-950 border-blue-500/20 ${userBalances.directionalShares <= 0 && vaults.directional.pendingDeposit <= 0 ? "opacity-50" : ""}`}
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

            {userBalances.directionalShares > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Your Shares</div>
                    <div className="text-lg font-mono">{userBalances.directionalShares.toFixed(6)}</div>
                  </div>
                  <div className="bg-blue-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Value</div>
                    <div className="text-lg font-mono">
                      {formatCurrency(userBalances.directionalShares * vaults.directional.sharePrice)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link href="/" onClick={() => localStorage.setItem("selectedVault", VaultType.DIRECTIONAL)}>
                    <Button variant="outline" size="sm" className="border-blue-500/20 hover:bg-blue-500/10">
                      Manage Position
                    </Button>
                  </Link>

                  {vaults.directional.claimableEarnings > 0 && (
                    <Button className="bg-green-500 hover:bg-green-600 text-white" size="sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Claim {formatCurrency(vaults.directional.claimableEarnings)}
                    </Button>
                  )}
                </div>
              </div>
            ) : vaults.directional.pendingDeposit > 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-500/5 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Pending Deposit</div>
                  <div className="text-lg font-mono">{formatCurrency(vaults.directional.pendingDeposit)}</div>
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Will be processed at next cycle: {new Date(vaults.directional.nextExpiry).toLocaleDateString()}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="border-blue-500/20 hover:bg-blue-500/10">
                  Cancel Pending Deposit
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-400 mb-4">You don't have any position in this vault</p>
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
          className={`bg-gradient-to-b from-zinc-900 to-zinc-950 border-purple-500/20 ${userBalances.rangeboundShares <= 0 && vaults.rangebound.pendingDeposit <= 0 ? "opacity-50" : ""}`}
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

            {userBalances.rangeboundShares > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Your Shares</div>
                    <div className="text-lg font-mono">{userBalances.rangeboundShares.toFixed(6)}</div>
                  </div>
                  <div className="bg-purple-500/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Value</div>
                    <div className="text-lg font-mono">
                      {formatCurrency(userBalances.rangeboundShares * vaults.rangebound.sharePrice)}
                    </div>
                  </div>
                </div>

                <Link href="/" onClick={() => localStorage.setItem("selectedVault", VaultType.RANGEBOUND)}>
                  <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10">
                    Manage Position
                  </Button>
                </Link>
              </div>
            ) : vaults.rangebound.pendingDeposit > 0 ? (
              <div className="space-y-4">
                <div className="bg-purple-500/5 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Pending Deposit</div>
                  <div className="text-lg font-mono">{formatCurrency(vaults.rangebound.pendingDeposit)}</div>
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Will be processed at next cycle: {new Date(vaults.rangebound.nextExpiry).toLocaleDateString()}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                  Cancel Pending Deposit
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-400 mb-4">You don't have any position in this vault</p>
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
