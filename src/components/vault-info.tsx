"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VaultType } from "@/lib/types"
import { useVaultData } from "@/hooks/use-vault-data"
import { formatCurrency } from "@/lib/utils"
import { FileText, AlertTriangle, HelpCircle } from "lucide-react"
// import { VaultStats } from "./vault-stats" // Unused
// import { DepositForm } from "./deposit-form" // Unused
// import { WithdrawForm } from "./withdraw-form" // Unused

interface VaultInfoProps {
  vaultType: VaultType
}

export function VaultInfo({ vaultType }: VaultInfoProps) {
  const { callVaultData, /* putVaultData, */ condorVaultData } = useVaultData()
  
  // Get the appropriate vault data
  const _data = vaultType === VaultType.DIRECTIONAL ? callVaultData : condorVaultData

  // Define default values to prevent undefined errors
  const currentPrice = parseFloat(_data?.currentPrice || '2100.00');
  const strikes = _data?.strikes || ['1800.00', '2000.00', '2200.00', '2400.00'];
  const lowerStrike = parseFloat(strikes[0] || '1800.00');
  const upperStrike = parseFloat(strikes[strikes.length - 1] || '2400.00');
  // Default to "bullish" for directional strategy
  const currentDirection = "bullish";

  // Simplified example using hardcoded or props data - Removed unused vars
  // const /* avgYield */ _avgYield = "1.5% / wk"; 
  // const successRate = "85%"; 

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono tracking-tight flex items-center gap-2">
          <FileText className="h-5 w-5" />
          STRATEGY INFORMATION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 bg-zinc-800">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="risks" className="text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Risks
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 text-zinc-300">
            {vaultType === VaultType.DIRECTIONAL ? (
              <>
                <p>
                  The Directional Strategy Vault uses call/put spreads to profit from market trends. This strategy is
                  designed for users who have a view on market direction.
                </p>
                <p>
                  When you deposit into this vault, your funds are used to create option spreads that profit when the
                  market moves in the anticipated direction. The vault automatically manages these positions for you.
                </p>
                <p>
                  This is a non-compounding vault, meaning profits are accumulated separately and can be claimed
                  manually.
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <h4 className="font-medium mb-2">Key Benefits</h4>
                    <ul className="space-y-1 text-sm text-zinc-400">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Potential for higher returns in trending markets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Professionally managed options positions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Weekly settlement of positions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <h4 className="font-medium mb-2">Ideal For</h4>
                    <ul className="space-y-1 text-sm text-zinc-400">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Users with a directional market view</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Higher risk tolerance investors</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Those seeking exposure to market movements</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p>
                  Mean Reverting Condor Vault uses iron condor options strategies to profit from sideways or
                  range-bound markets. This strategy is designed for users who expect limited price movement.
                </p>
                <p>
                  When you deposit into this vault, your funds are used to create iron condor positions that profit when
                  the market stays within a specific price range. The vault automatically manages these positions for
                  you.
                </p>
                <p>
                  This is an auto-compounding vault, meaning profits are automatically reinvested to grow your position
                  over time.
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <h4 className="font-medium mb-2">Key Benefits</h4>
                    <ul className="space-y-1 text-sm text-zinc-400">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>More consistent returns in sideways markets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Lower volatility in portfolio value</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Auto-compounding of yields</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <h4 className="font-medium mb-2">Ideal For</h4>
                    <ul className="space-y-1 text-sm text-zinc-400">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Users expecting sideways market conditions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Moderate risk tolerance investors</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Those seeking more predictable returns</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 text-zinc-300">
            <div className="space-y-2">
              <h3 className="font-medium text-white">Current Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <div className="text-xs text-zinc-400">Asset</div>
                  <div className="font-mono text-white">sUSDS</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <div className="text-xs text-zinc-400">Cycle Duration</div>
                  <div className="font-mono text-white">7 days</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <div className="text-xs text-zinc-400">Min Deposit</div>
                  <div className="font-mono text-white">{formatCurrency(100)}</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <div className="text-xs text-zinc-400">Current Price</div>
                  <div className="font-mono text-white">${currentPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {vaultType === VaultType.DIRECTIONAL ? (
              <div className="space-y-2">
                <h3 className="font-medium text-white">Option Strategy</h3>
                <p className="text-sm text-zinc-300">
                  This vault uses call or put spreads based on market outlook. The current position is a
                  {currentDirection === "bullish" ? " bullish call spread " : " bearish put spread "}
                  with strikes at ${lowerStrike.toFixed(2)} and ${upperStrike.toFixed(2)}.
                </p>

                <div className="mt-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                  <h4 className="font-medium mb-2 text-white">How It Works</h4>
                  <ol className="space-y-2 text-sm text-zinc-300 list-decimal pl-4">
                    <li>The vault analyzes market conditions to determine a directional bias (bullish or bearish).</li>
                    <li>
                      Based on this analysis, it creates option spread positions that profit if the market moves in the
                      expected direction.
                    </li>
                    <li>
                      At the end of each weekly cycle, positions are settled and profits are distributed to the earnings
                      pool.
                    </li>
                    <li>Users can claim their proportional share of earnings at any time.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-medium text-white">Option Strategy</h3>
                <p className="text-sm text-zinc-300">
                  This vault uses an iron condor strategy with the following strikes:
                </p>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <div className="grid grid-cols-2 gap-2 text-sm text-white">
                    <div>
                      Lower Breakeven: <span className="font-mono">${lowerStrike.toFixed(2)}</span>
                    </div>
                    <div>
                      Upper Breakeven: <span className="font-mono">${upperStrike.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-300">
                  Maximum profit is achieved if the price stays between these levels at expiry.
                </p>

                <div className="mt-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                  <h4 className="font-medium mb-2 text-white">How It Works</h4>
                  <ol className="space-y-2 text-sm text-zinc-300 list-decimal pl-4">
                    <li>The vault analyzes market conditions to determine an appropriate price range.</li>
                    <li>It creates iron condor positions that profit if the market stays within this range.</li>
                    <li>
                      At the end of each weekly cycle, positions are settled and profits are automatically reinvested.
                    </li>
                    <li>This compounding effect increases the value of your vault shares over time.</li>
                  </ol>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium">Risk Considerations</h3>
            </div>

            <p className="text-zinc-300">
              All investment strategies involve risk. Please consider the following risks before depositing:
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-white">Market Risk:</strong>{" "}
                  {vaultType === VaultType.DIRECTIONAL
                    ? "If the market moves against the position, the vault may incur losses."
                    : "If the market moves outside the target range, the vault may incur losses."}
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-white">Smart Contract Risk:</strong> While the contracts have been audited,
                  there is always inherent risk in smart contract interactions.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-white">Liquidity Risk:</strong> During periods of extreme market volatility,
                  withdrawals may be temporarily restricted.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-white">Options Risk:</strong> Options strategies involve complex financial
                  instruments that can amplify both gains and losses.
                </span>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-zinc-300">
                <strong>Important:</strong> Past performance is not indicative of future results. The projected APY is
                based on historical data and market conditions, which may change. Always invest only what you can afford
                to lose.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-zinc-400" />
              <h3 className="font-medium text-white">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-white">When can I deposit or withdraw?</h4>
                <p className="text-sm text-zinc-400">
                  You can deposit at any time, but deposits made during an active cycle will be queued for the next
                  cycle. Withdrawals are generally available at any time, except during active option auctions.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">How are returns generated?</h4>
                <p className="text-sm text-zinc-400">
                  {vaultType === VaultType.DIRECTIONAL
                    ? "Returns are generated from profits on option spread positions when the market moves in the anticipated direction."
                    : "Returns are generated from option premiums collected when selling iron condor positions."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">What happens at the end of each cycle?</h4>
                <p className="text-sm text-zinc-400">
                  At the end of each weekly cycle, options positions are settled, and new positions are created for the
                  next cycle.
                  {vaultType === VaultType.DIRECTIONAL
                    ? " Profits are added to the claimable earnings pool."
                    : " Profits are automatically reinvested to increase the value of your shares."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">Are there any fees?</h4>
                <p className="text-sm text-zinc-400">
                  Yes, the vault charges a 2% management fee on deposits and a 10% performance fee on profits. These
                  fees are used to maintain the protocol and reward the developers.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
