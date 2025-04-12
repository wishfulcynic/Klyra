"use client"

import { Card, CardContent } from "@/components/ui/card"
import { VaultType } from "@/lib/types"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"

interface VaultStatsProps {
  vaultType: VaultType
}

export function VaultStats({ vaultType }: VaultStatsProps) {
  // Use specific vault data
  const { callVaultData, condorVaultData, totalValueLocked } = useVaultData()
  
  // Select the data for the current vault type
  const vault = vaultType === VaultType.DIRECTIONAL ? callVaultData : condorVaultData

  // Provide defaults for display if data is null
  const displayTVL = totalValueLocked ? formatCurrency(Number(totalValueLocked)) : "$0.00"; // Use overall TVL for now
  const displayAPY = vault?.metrics?.apy ? parseFloat(vault.metrics.apy).toFixed(2) + "%" : "0.00%";
  const displaySharePrice = vault?.sharePrice ? parseFloat(vault.sharePrice).toFixed(4) : "0.0000";
  const displayUtilization = "100%"; // Placeholder

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Total Value Locked</div>
            <div className="text-2xl font-mono">{displayTVL}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Est. APY</div>
            <div className="text-2xl font-mono text-green-400">{displayAPY}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Share Price</div>
            <div className="text-2xl font-mono">${displaySharePrice}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-zinc-400">Utilization</div>
            <div className="text-2xl font-mono">{displayUtilization}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
