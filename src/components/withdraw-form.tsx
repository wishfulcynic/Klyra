"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VaultType } from "@/lib/types"
import { useWallet } from "@/hooks/use-wallet"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, Info, CreditCard, Coins } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WithdrawFormProps {
  vaultType: VaultType
}

export function WithdrawForm({ vaultType }: WithdrawFormProps) {
  const { address } = useWallet()
  const { 
    callVaultData, 
    putVaultData, 
    condorVaultData, 
    callVaultShares, 
    putVaultShares, 
    condorVaultShares, 
    withdrawDirectional, 
    withdrawCondor, 
    isLoading 
  } = useVaultData()
  
  const [amount, setAmount] = useState("")
  const [withdrawType, setWithdrawType] = useState<"shares" | "susd">("susd")
  const [directionalStrategy, setDirectionalStrategy] = useState<"bullish" | "bearish">("bullish")

  const vault = vaultType === VaultType.DIRECTIONAL
    ? (directionalStrategy === "bullish" ? callVaultData : putVaultData)
    : condorVaultData
    
  const vaultShareBalance = vaultType === VaultType.DIRECTIONAL
    ? (directionalStrategy === "bullish" ? Number(callVaultShares) : Number(putVaultShares))
    : Number(condorVaultShares)

  const vaultColor = vaultType === VaultType.DIRECTIONAL ? "indigo" : "purple"

  const handleMaxClick = () => {
    if (!vault) return;
    if (withdrawType === "shares") {
      setAmount(vaultShareBalance.toString())
    } else {
      const sharePrice = Number.parseFloat(vault.sharePrice || '0')
      const maxValue = vaultShareBalance * sharePrice
      setAmount(maxValue.toString())
    }
  }

  const handleWithdraw = async () => {
    if (!address || !amount || !vault) return

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return

    const sharePrice = Number.parseFloat(vault.sharePrice || '1')
    let sharesToWithdraw = amountValue
    if (withdrawType === "susd") {
      sharesToWithdraw = amountValue / sharePrice
    }

    try {
      if (vaultType === VaultType.DIRECTIONAL) {
        const isCall = directionalStrategy === "bullish"
        await withdrawDirectional(sharesToWithdraw.toString(), isCall)
      } else {
        await withdrawCondor(sharesToWithdraw.toString())
      }
      setAmount("")
    } catch (error) {
      console.error("Withdrawal failed:", error)
    }
  }

  let insufficientShares = false
  let estimatedValue = 0
  let estimatedShares = 0
  const currentSharePrice = Number.parseFloat(vault?.sharePrice || '1')

  if (amount && !isNaN(Number.parseFloat(amount)) && vault) {
    if (withdrawType === "shares") {
      estimatedShares = Number.parseFloat(amount)
      estimatedValue = estimatedShares * currentSharePrice
      insufficientShares = estimatedShares > vaultShareBalance
    } else {
      estimatedValue = Number.parseFloat(amount)
      estimatedShares = estimatedValue / currentSharePrice
      insufficientShares = estimatedShares > vaultShareBalance
    }
  }

  const isWithdrawing = isLoading
  const isDisabled =
    !address ||
    !amount ||
    !vault ||
    isNaN(Number.parseFloat(amount)) ||
    Number.parseFloat(amount) <= 0 ||
    insufficientShares ||
    isWithdrawing ||
    vault.isActiveDeposit

  if (isLoading && !vault) {
     return <div className="text-center p-4 text-gray-500">Loading vault data...</div>;
  }
  
  if (!vault) {
    return <div className="text-center p-4 text-red-500">Could not load vault data.</div>;
  }

  return (
    <div className="space-y-6">
      {vaultType === VaultType.DIRECTIONAL && (
         <div className="mb-4">
           <label className="text-sm text-gray-500 mb-2 block">Withdraw from:</label>
           <Tabs value={directionalStrategy} onValueChange={(v) => setDirectionalStrategy(v as "bullish" | "bearish")} className="w-full">
             <TabsList className={`grid grid-cols-2 mb-4 bg-gray-100`}>
               <TabsTrigger value="bullish">Bullish (Call)</TabsTrigger>
               <TabsTrigger value="bearish">Bearish (Put)</TabsTrigger>
             </TabsList>
           </Tabs>
         </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <div className="text-gray-500 flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Your Balance
          </div>
          <div className="text-right">
            <div className="text-gray-900 font-medium">{vaultShareBalance.toFixed(6)} shares</div>
            <div className="text-xs text-gray-500">≈ {formatCurrency(vaultShareBalance * currentSharePrice)}</div>
          </div>
        </div>
      </div>

      <Tabs value={withdrawType} onValueChange={(v) => setWithdrawType(v as "shares" | "susd")} className="w-full">
        <TabsList className={`grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-md`}>
          <TabsTrigger
            value="susd"
            className={`rounded-md data-[state=inactive]:text-gray-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center gap-1 text-sm">
              <CreditCard className="h-3 w-3" />
              Withdraw in sUSD
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="shares"
            className={`rounded-md data-[state=inactive]:text-gray-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center gap-1 text-sm">
              <Coins className="h-3 w-3" />
              Withdraw in Shares
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="susd" className="space-y-2 mt-0">
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor="withdraw-amount-susd" className="text-gray-500 flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Amount (sUSD)
            </label>
          </div>

          <div className="relative flex-1">
            <Input
              id="withdraw-amount-susd"
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`border-gray-300 focus:border-${vaultColor}-500/50 text-gray-900 font-medium pr-16 rounded-md`}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-xs font-medium text-gray-500 hover:text-gray-900"
              onClick={handleMaxClick}
            >
              MAX
            </Button>
          </div>

          {insufficientShares && amount && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>Insufficient balance</span>
            </div>
          )}

          {amount && !isNaN(Number.parseFloat(amount)) && !insufficientShares && (
            <div className="text-xs text-gray-500">
              You will withdraw approximately <span className="text-gray-900 font-medium">{estimatedShares.toFixed(6)}</span>{" "}
              vault shares
            </div>
          )}
        </TabsContent>

        <TabsContent value="shares" className="space-y-2 mt-0">
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor="withdraw-amount-shares" className="text-gray-500 flex items-center gap-1">
              <Coins className="h-3 w-3" />
              Amount (Vault Shares)
            </label>
          </div>

          <div className="relative flex-1">
            <Input
              id="withdraw-amount-shares"
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`border-gray-300 focus:border-${vaultColor}-500/50 text-gray-900 font-medium pr-16 rounded-md`}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-xs font-medium text-gray-500 hover:text-gray-900"
              onClick={handleMaxClick}
            >
              MAX
            </Button>
          </div>

          {insufficientShares && amount && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>Insufficient vault shares</span>
            </div>
          )}

          {amount && !isNaN(Number.parseFloat(amount)) && !insufficientShares && (
            <div className="text-xs text-gray-500">
              ≈ <span className="text-gray-900 font-medium">{formatCurrency(estimatedValue)}</span> sUSD
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Button
        className={`w-full bg-gradient-to-r from-${vaultColor}-600 to-${vaultColor}-700 hover:from-${vaultColor}-600 hover:to-${vaultColor}-700 text-white font-medium py-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200`}
        onClick={handleWithdraw}
        disabled={isDisabled}
      >
        {isWithdrawing ? "Withdrawing..." : "Withdraw"}
      </Button>

      <div className={`p-3 bg-${vaultColor}-50 rounded-lg border border-${vaultColor}-100`}>
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Withdrawing will burn your vault shares and return the corresponding amount of sUSD.</p>
            {vault.isActiveDeposit && (
              <p className="text-yellow-600">• Withdrawals are temporarily locked during the active options auction.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
