"use client"

import { Button } from "@/components/ui/button"
import { VaultType } from "@/lib/types"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Info, DollarSign } from "lucide-react"

interface ClaimFormProps {
  vaultType: VaultType
}

export function ClaimForm({ vaultType }: ClaimFormProps) {
  const { 
    claimProfits,
    isClaiming
  } = useVaultData()

  if (vaultType !== VaultType.DIRECTIONAL) return null

  const displayClaimableEarnings = 0;

  const handleClaim = () => {
    claimProfits(true, true).catch(err => console.error("Claim failed:", err));
  }

  if (displayClaimableEarnings <= 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          Claimable Earnings
        </h3>
        <span className="font-mono text-green-400">{formatCurrency(displayClaimableEarnings)}</span>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
        onClick={handleClaim}
        disabled={isClaiming || displayClaimableEarnings <= 0}
      >
        {isClaiming ? (
          "Processing..."
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <DollarSign className="h-4 w-4" />
            Claim Earnings
          </span>
        )}
      </Button>

      <div className="flex items-start gap-2 text-sm text-zinc-400">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          These are your earnings from option profits that can be claimed to your wallet. Claiming does not affect your
          vault position.
        </p>
      </div>
    </div>
  )
}
