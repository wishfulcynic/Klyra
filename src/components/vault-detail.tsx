"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  TrendingUp,
  ArrowUpDown,
  Clock,
  Info,
  AlertCircle,
  BarChart3,
  HelpCircle,
  CreditCard,
  TrendingDown,
} from "lucide-react"
import { VaultType } from "@/lib/types"
import { DepositForm } from "@/components/deposit-form"
import { WithdrawForm } from "@/components/withdraw-form"
import { ClaimForm } from "@/components/claim-form"
import { VaultInfo } from "@/components/vault-info"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency, formatTimeLeft } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface VaultDetailProps {
  vaultType: VaultType
  onBack: () => void
}

export function VaultDetail({ vaultType, onBack }: VaultDetailProps) {
  const { callVaultData, condorVaultData, totalValueLocked } = useVaultData()
  
  // Add debugging to see what data we actually have
  console.log("VaultDetail data:", { callVaultData, condorVaultData });
  
  // Get the appropriate vault data based on vault type
  const vaultData = vaultType === VaultType.DIRECTIONAL 
    ? callVaultData
    : condorVaultData
    
  console.log("Selected vault data:", vaultData);
  
  const [activeTab, setActiveTab] = useState("deposit")
  const [directionalStrategy, setDirectionalStrategy] = useState<"bullish" | "bearish">(
    vaultType === VaultType.DIRECTIONAL ? "bullish" : "bullish", // Default to bullish
  )

  // Update directional strategy when vault data changes
  useEffect(() => {
    if (vaultType === VaultType.DIRECTIONAL && vaultData) {
      // Determine strategy based on available data, default to bullish
      setDirectionalStrategy("bullish")
    }
  }, [vaultData, vaultType])

  const vaultIcon =
    vaultType === VaultType.DIRECTIONAL ? (
      directionalStrategy === "bullish" ? (
        <TrendingUp className="h-5 w-5 text-indigo-500" />
      ) : (
        <TrendingDown className="h-5 w-5 text-indigo-500" />
      )
    ) : (
      <ArrowUpDown className="h-5 w-5 text-purple-500" />
    )

  const vaultColor = vaultType === VaultType.DIRECTIONAL ? "indigo" : "purple"
  const gradientColors = vaultType === VaultType.DIRECTIONAL ? "from-indigo-50 to-white" : "from-purple-50 to-white"

  // Use overall TVL from hook
  const displayTVL = totalValueLocked ? formatCurrency(Number(totalValueLocked)) : "$0.00";

  // Use fetched capacity for the specific vault
  const displayTotalCapacity = vaultData?.totalCapacity 
     ? formatCurrency(Number(vaultData.totalCapacity))
     : "N/A"; // Default if capacity not fetched
  
  // Calculate percentage based on fetched values if available
  const capacityUsed = totalValueLocked ? Number(totalValueLocked) : 0;
  const capacityTotal = vaultData?.totalCapacity ? Number(vaultData.totalCapacity) : 0;
  const capacityPercentage = capacityTotal > 0 ? Math.min(100, (capacityUsed / capacityTotal) * 100) : 0;

  // Define default values outside conditionals
  let sharePrice = 1.0456;
  let currentPrice = 2100.00;
  let apy = '18.4%';
  let nextExpiry = Math.floor(Date.now() / 1000) + 4 * 24 * 60 * 60;
  let strikes = ['1800.00']; // Expecting potentially only one strike
  let mainStrike = 0.00; // Define mainStrike outside the if block
  let isRfqActive = false;
  let pendingDeposit = 0;
  const claimableEarnings = 0; // Marked as unused

  // If no data and not loading and no error, use fallback data
  if (!vaultData) {
    console.log("Using fallback data");
    // Fallback data variables are already defined above
  } 
  // If we have real data, use it
  else if (vaultData) {
    // Override defaults with real data
    sharePrice = parseFloat(vaultData.sharePrice || '1.0456');
    currentPrice = parseFloat(vaultData.currentPrice || '2100.00');
    apy = vaultData.metrics?.apy || '18.4%';
    nextExpiry = vaultData.nextCycleExpiry || (Date.now() / 1000 + 4 * 24 * 60 * 60);
    strikes = vaultData.strikes || ['1800.00']; 
    console.log("Fetched Strikes:", strikes); // DEBUG LOG for strikes array
    mainStrike = parseFloat(strikes[0] || '0.00'); // Assign value inside if block
    isRfqActive = vaultData.isActiveDeposit || false;
    pendingDeposit = (vaultData.queuedDeposits || 0) > 0 ? 1000 : 0;
  }

  // If vault data is not available yet, show a loading state - but only for a brief moment
  if (!vaultData) {
    return (
      <div className="py-6">
        <Button
          variant="ghost"
          className="mb-6 pl-0 text-gray-500 hover:text-gray-900 hover:bg-transparent group transition-all duration-200"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Vaults
        </Button>
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500">Loading vault data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <Button
        variant="ghost"
        className="mb-6 pl-0 text-gray-500 hover:text-gray-900 hover:bg-transparent group transition-all duration-200"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
        Back to Vaults
      </Button>

      {/* Vault Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`mb-8 bg-gradient-to-b ${gradientColors} border border-${vaultColor}-100 rounded-xl p-6 shadow-sm`}
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`bg-${vaultColor}-100 p-2 rounded-full`}>{vaultIcon}</div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {vaultType === VaultType.DIRECTIONAL ? "Directional Options" : "Mean Reverting Condor"} Vault
              </h1>
              <Badge
                variant="outline"
                className={`ml-2 bg-${vaultColor}-50 text-${vaultColor}-700 border-${vaultColor}-200`}
              >
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 mr-1" />
                  sUSD
                </div>
              </Badge>
            </div>
            <p className="text-gray-600 max-w-xl">
              {vaultType === VaultType.DIRECTIONAL
                ? "Profit from market trends with call/put spreads. This strategy is designed for users who have a directional view on the market."
                : "Earn yield in sideways markets with iron condors. This strategy is designed for users who expect limited price movement."}
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-500 mb-1 font-medium">Est. APY</div>
            <div className={`text-3xl font-semibold text-${vaultColor}-600`}>{apy}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1 font-medium">Total Value Locked</div>
            <div className="text-xl font-semibold text-gray-900">{displayTVL}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1 font-medium">Share Price</div>
            <div className="text-xl font-semibold text-gray-900">${sharePrice.toFixed(4)}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1 font-medium">Next Expiry</div>
            <div className="text-xl font-semibold text-gray-900">{formatTimeLeft(nextExpiry)}</div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1 font-medium">
              <span>Capacity</span>
              <span className="text-xs">
                {displayTVL} / {displayTotalCapacity}
              </span>
            </div>
            <Progress
              value={capacityPercentage}
              className={`h-2 bg-gray-100 [&>div]:bg-${vaultColor}-500`}
            />
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Strategy Visualization */}
          <Card className={`bg-white border border-${vaultColor}-100 rounded-xl shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className={`h-5 w-5 text-${vaultColor}-500`} />
                  <h3 className="text-lg font-semibold text-gray-900">STRATEGY OVERVIEW</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm bg-white border-gray-200 text-gray-900 shadow-lg">
                      <p>
                        {vaultType === VaultType.DIRECTIONAL
                          ? "This strategy uses call/put spreads to profit from market direction. Higher risk, higher potential returns."
                          : "This strategy uses iron condors to profit from range-bound markets. More consistent returns with moderate risk."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`bg-${vaultColor}-50 rounded-lg p-4 border border-${vaultColor}-100`}>
                  <h4 className="font-medium mb-3 text-gray-900">How It Works</h4>
                  {vaultType === VaultType.DIRECTIONAL ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                          <span className="text-xs font-bold text-indigo-600">1</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          The vault analyzes market conditions to determine a directional bias.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                          <span className="text-xs font-bold text-indigo-600">2</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          It creates option spread positions that profit if the market moves in the expected direction.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                          <span className="text-xs font-bold text-indigo-600">3</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          At the end of each weekly cycle, positions are settled and profits are distributed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                          <span className="text-xs font-bold text-purple-600">1</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          The vault analyzes market conditions to determine an appropriate price range.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                          <span className="text-xs font-bold text-purple-600">2</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          It creates iron condor positions that profit if the market stays within this range.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                          <span className="text-xs font-bold text-purple-600">3</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Profits are automatically reinvested to increase the value of your shares.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`bg-${vaultColor}-50 rounded-lg p-4 border border-${vaultColor}-100`}>
                  <h4 className="font-medium mb-3 text-gray-900">Current Position</h4>
                  {vaultType === VaultType.DIRECTIONAL ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`bg-${directionalStrategy === "bullish" ? "green" : "red"}-50 text-${directionalStrategy === "bullish" ? "green" : "red"}-600 border-${directionalStrategy === "bullish" ? "green" : "red"}-200`}
                        >
                          {directionalStrategy === "bullish" ? "Bullish" : "Bearish"}
                        </Badge>
                        <span className="text-gray-700">
                          {directionalStrategy === "bullish" ? "Call Option" : "Put Option"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                        <span className="text-gray-500">Strike Price</span>
                        <span className="font-medium text-gray-900">${mainStrike.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-gray-500">Current Price</span>
                        <span className="font-medium text-gray-900">${currentPrice.toFixed(2)}</span>
                      </div>

                      <div className="mt-2 relative h-8 bg-gray-100 rounded-md overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                          Price vs Strike
                        </div>
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-indigo-600"
                          style={{ 
                            left: `${Math.min(99, Math.max(1, (currentPrice / mainStrike) * 50))}%`
                          }}
                        ></div>
                        <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-gray-400"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-50 text-purple-600 border-purple-200">Iron Condor</Badge>
                      </div>

                      <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                        <span className="text-gray-500">Lower Breakeven</span>
                        <span className="font-medium text-gray-900">${mainStrike.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-gray-500">Current Price</span>
                        <span className="font-medium text-gray-900">${currentPrice.toFixed(2)}</span>
                      </div>

                      <div className="mt-2 relative h-8 bg-gray-100 rounded-md overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                          Profit Zone
                        </div>
                        <div
                          className="absolute top-0 bottom-0 bg-purple-200"
                          style={{
                            left: `${Math.max(0, ((mainStrike - 0.8 * currentPrice) / (0.4 * currentPrice)) * 100)}%`,
                            right: `${Math.max(0, 100 - ((mainStrike - 0.8 * currentPrice) / (0.4 * currentPrice)) * 100)}%`,
                          }}
                        ></div>
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-purple-600"
                          style={{ left: `50%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Next option expiry in{" "}
                  <span className="font-medium text-gray-900">{formatTimeLeft(nextExpiry)}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <VaultInfo vaultType={vaultType} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className={`bg-white border border-${vaultColor}-100 rounded-xl shadow-sm sticky top-20`}>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-md">
                  <TabsTrigger
                    value="deposit"
                    className={`rounded-md data-[state=inactive]:text-gray-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200`}
                  >
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdraw"
                    className={`rounded-md data-[state=inactive]:text-gray-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200`}
                  >
                    Withdraw
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit">
                  <DepositForm vaultType={vaultType} />
                </TabsContent>

                <TabsContent value="withdraw">
                  <WithdrawForm vaultType={vaultType} />
                </TabsContent>
              </Tabs>

              {vaultType === VaultType.DIRECTIONAL && claimableEarnings > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ClaimForm vaultType={vaultType} />
                </div>
              )}

              {pendingDeposit > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                    <Info className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Pending Deposit</p>
                      <p className="text-gray-600">
                        You have {formatCurrency(pendingDeposit)} pending deposit that will be processed in the
                        next cycle.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className={`w-full border-${vaultColor}-200 hover:bg-${vaultColor}-50 text-${vaultColor}-700`}
                  >
                    Cancel Pending Deposit
                  </Button>
                </div>
              )}

              {isRfqActive && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Option Auction Active</p>
                      <p className="text-gray-600">
                        The vault is currently in an active options auction. Withdrawals may be temporarily restricted.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
