"use client"

import { Card, CardContent } from "@/components/ui/card"
import { VaultType } from "@/lib/types"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface VaultStatsProps {
  vaultType: VaultType
}

export function VaultStats({ vaultType }: VaultStatsProps) {
  const { vaults } = useVaultData()
  const vault = vaultType === VaultType.DIRECTIONAL ? vaults.directional : vaults.rangebound

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Total Value Locked</div>
            <div className="text-2xl font-mono">{formatCurrency(vault.tvl)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Est. APY</div>
            <div className="text-2xl font-mono text-green-400">{formatPercentage(vault.apy)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Share Price</div>
            <div className="text-2xl font-mono">${vault.sharePrice.toFixed(4)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Utilization</div>
            <div className="text-2xl font-mono">100%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
