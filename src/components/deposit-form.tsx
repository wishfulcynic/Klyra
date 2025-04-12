"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VaultType } from "@/lib/types"
import { useWallet } from "@/hooks/use-wallet"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, Info, CreditCard, Wallet, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"

interface DepositFormProps {
  vaultType: VaultType
}

export function DepositForm({ vaultType }: DepositFormProps) {
  const { address } = useWallet()
  const { 
    userSusdsBalance,
    needsApproval,
    depositDirectional,
    depositCondor,
    approveWrapper,
    isLoading,
    callVaultData,
    putVaultData,
    condorVaultData
  } = useVaultData()
  const [amount, setAmount] = useState("")
  const [directionalStrategy, setDirectionalStrategy] = useState<"bullish" | "bearish">("bullish")
  const [contractInfo, setContractInfo] = useState<{ numContracts: number; strikes: number[] }>({
    numContracts: 0,
    strikes: [],
  })

  // Get the appropriate vault data based on vault type
  const vault = vaultType === VaultType.DIRECTIONAL ? 
    (directionalStrategy === "bullish" ? callVaultData : putVaultData) : 
    condorVaultData
  const vaultColor = vaultType === VaultType.DIRECTIONAL ? "indigo" : "purple"

  // Update contract info when amount changes
  useEffect(() => {
    const updateContractInfo = async () => {
      if (amount && !isNaN(Number.parseFloat(amount)) && Number.parseFloat(amount) > 0) {
        const isCall = directionalStrategy === "bullish"
        // Mock calculation since calculateContracts is not available
        setContractInfo({
          numContracts: Math.floor(Number.parseFloat(amount) / 100),
          strikes: [1800, 2000, 2200]
        })
      } else {
        setContractInfo({ numContracts: 0, strikes: [] })
      }
    }

    updateContractInfo()
  }, [amount, vaultType, directionalStrategy])

  const handleMaxClick = () => {
    setAmount(userSusdsBalance)
  }

  const handlePercentageClick = (percentage: number) => {
    const amount = (Number(userSusdsBalance) * percentage).toString()
    setAmount(amount)
  }

  const handleDeposit = async () => {
    if (!address || !amount) return

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return

    const isCall = directionalStrategy === "bullish"
    
    if (vaultType === VaultType.DIRECTIONAL) {
      await depositDirectional(amount, isCall)
    } else {
      await depositCondor(amount)
    }
    
    setAmount("")
  }

  const userAllowance = 0 // Default value since actual allowance is not available
  const needsApprovalForAmount = Number.parseFloat(amount || "0") > userAllowance
  const insufficientBalance = Number.parseFloat(amount || "0") > Number(userSusdsBalance)
  const isDepositing = isLoading
  const isApproving = isLoading
  const isDisabled =
    !address ||
    !amount ||
    isNaN(Number.parseFloat(amount)) ||
    Number.parseFloat(amount) <= 0 ||
    insufficientBalance ||
    isApproving ||
    isDepositing

  // Calculate estimated shares
  const estimatedShares = amount && !isNaN(Number.parseFloat(amount)) && vault ? 
    Number.parseFloat(amount) / Number.parseFloat(vault.sharePrice) : 0

  return (
    <div className="space-y-6">
      {vaultType === VaultType.DIRECTIONAL && (
        <div className="mb-6">
          <label className="text-sm text-gray-500 mb-2 block">Select Market Direction:</label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className={`rounded-md transition-all duration-200 ${
                directionalStrategy === "bullish"
                  ? "bg-indigo-600 text-white shadow-md hover:shadow-lg hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setDirectionalStrategy("bullish")}
            >
              <TrendingUp
                className={`h-4 w-4 mr-2 ${directionalStrategy === "bullish" ? "text-indigo-300" : "text-gray-400"}`}
              />
              Bullish (Call)
            </Button>
            <Button
              className={`rounded-md transition-all duration-200 ${
                directionalStrategy === "bearish"
                  ? "bg-indigo-600 text-white shadow-md hover:shadow-lg hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setDirectionalStrategy("bearish")}
            >
              <TrendingDown
                className={`h-4 w-4 mr-2 ${directionalStrategy === "bearish" ? "text-indigo-300" : "text-gray-400"}`}
              />
              Bearish (Put)
            </Button>
          </div>

          <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                {directionalStrategy === "bullish"
                  ? "Bullish strategy profits when the market moves upward. The vault will purchase call spreads."
                  : "Bearish strategy profits when the market moves downward. The vault will purchase put spreads."}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label htmlFor="deposit-amount" className="text-gray-500 flex items-center gap-1 font-medium">
            <CreditCard className="h-3 w-3" />
            Amount (sUSD)
          </label>
          <div className="text-gray-500 flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            Balance: <span className="text-gray-900 font-medium">{formatCurrency(Number(userSusdsBalance))}</span>
          </div>
        </div>

        <div className="relative">
          <Input
            id="deposit-amount"
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`pr-16 border-gray-300 rounded-md focus:ring-${vaultColor}-500 focus:border-${vaultColor}-500 text-lg font-medium`}
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

        {insufficientBalance && amount && (
          <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
            <AlertCircle className="h-3 w-3" />
            <span>Insufficient balance</span>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-${vaultColor}-300 transition-all duration-200`}
            onClick={() => handlePercentageClick(0.25)}
          >
            25%
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-${vaultColor}-300 transition-all duration-200`}
            onClick={() => handlePercentageClick(0.5)}
          >
            50%
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-${vaultColor}-300 transition-all duration-200`}
            onClick={() => handlePercentageClick(0.75)}
          >
            75%
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-${vaultColor}-300 transition-all duration-200`}
            onClick={handleMaxClick}
          >
            MAX
          </Button>
        </div>

        {amount && !isNaN(Number.parseFloat(amount)) && !insufficientBalance && (
          <div className="text-xs text-gray-500 mt-2">
            <p>
              You will receive approximately{" "}
              <span className="text-gray-900 font-medium">{estimatedShares.toFixed(6)}</span> vault shares
            </p>
            {contractInfo.numContracts > 0 && (
              <p className="mt-1">
                Creating <span className="text-gray-900 font-medium">{contractInfo.numContracts}</span> option contracts
                {contractInfo.strikes.length > 0 && (
                  <span> with strikes at {contractInfo.strikes.map((s) => `$${s.toFixed(2)}`).join(", ")}</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {needsApprovalForAmount ? (
        <Button
          className={`w-full bg-gradient-to-r from-${vaultColor}-600 to-${vaultColor}-700 hover:from-${vaultColor}-700 hover:to-${vaultColor}-800 text-white font-medium py-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200`}
          onClick={() => approveWrapper()}
          disabled={isDisabled || isApproving}
        >
          {isApproving ? (
            "Approving..."
          ) : (
            <span className="flex items-center gap-2">
              Approve sUSD <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      ) : (
        <Button
          className={`w-full bg-gradient-to-r from-${vaultColor}-600 to-${vaultColor}-700 hover:from-${vaultColor}-700 hover:to-${vaultColor}-800 text-white font-medium py-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200`}
          onClick={handleDeposit}
          disabled={isDisabled || isDepositing}
        >
          {isDepositing ? "Depositing..." : "Deposit"}
        </Button>
      )}

      <div className={`p-4 bg-${vaultColor}-50 rounded-lg border border-${vaultColor}-100`}>
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>• You will receive vault tokens representing your share of the vault.</p>
            {vaultType === VaultType.DIRECTIONAL ? (
              <p>• Any profits from options will accrue separately and can be claimed manually.</p>
            ) : (
              <p>• Yields are auto-compounded back into the strategy.</p>
            )}
            <p>• Deposits during an active cycle will be queued for the next cycle.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
