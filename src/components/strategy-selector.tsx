"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  ArrowUpWideNarrowIcon as ArrowsHorizontal,
  Users,
  Shield,
  BarChart3,
  DollarSign,
} from "lucide-react"
import { VaultType } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useVaultData } from "@/hooks/use-vault-data"
import { Badge } from "@/components/ui/badge"

interface StrategySelectorProps {
  onSelectVault: (vault: VaultType) => void
}

export function StrategySelector({ onSelectVault }: StrategySelectorProps) {
  const { callVaultData, condorVaultData } = useVaultData()

  const directionalAPY = callVaultData?.metrics?.apy ?? "0%";
  const directionalTVL = callVaultData?.totalValueLocked 
    ? formatCurrency(Number(callVaultData.totalValueLocked))
    : formatCurrency(0);

  const condorAPY = condorVaultData?.metrics?.apy ?? "0%";
  const condorTVL = condorVaultData?.totalValueLocked 
    ? formatCurrency(Number(condorVaultData.totalValueLocked))
    : formatCurrency(0);

  return (
    <div className="py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Choose Your Strategy</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Select a strategy based on your market outlook. Deposit stablecoins and let the vault handle the options
          strategy for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Directional Strategy Card */}
        <Card className="overflow-hidden border-2 hover:border-blue-500/50 transition-all bg-gradient-to-b from-zinc-900 to-zinc-950">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Directional Strategy</CardTitle>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    High Risk
                  </Badge>
                </div>
                <CardDescription>Profit from market trends</CardDescription>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>Est. APY</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-400">{directionalAPY}</div>
                </div>
                <div className="bg-blue-500/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span>TVL</span>
                  </div>
                  <div className="text-lg font-semibold">{directionalTVL}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Strategy Overview:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Uses call/put spreads to profit from market direction</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Higher risk, higher potential returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ideal for trending markets</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              onClick={() => onSelectVault(VaultType.DIRECTIONAL)}
            >
              Select Directional Strategy
            </Button>
          </CardFooter>
        </Card>

        {/* Rangebound Strategy Card */}
        <Card className="overflow-hidden border-2 hover:border-purple-500/50 transition-all bg-gradient-to-b from-zinc-900 to-zinc-950">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Rangebound Strategy</CardTitle>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                    Moderate Risk
                  </Badge>
                </div>
                <CardDescription>Profit from sideways markets</CardDescription>
              </div>
              <div className="bg-purple-500/10 p-2 rounded-full">
                <ArrowsHorizontal className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-500/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>Est. APY</span>
                  </div>
                  <div className="text-lg font-semibold text-purple-400">{condorAPY}</div>
                </div>
                <div className="bg-purple-500/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span>TVL</span>
                  </div>
                  <div className="text-lg font-semibold">{condorTVL}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Strategy Overview:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Uses iron condor strategy to profit from range-bound markets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>More consistent returns with moderate risk</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ideal for sideways or low-volatility markets</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              onClick={() => onSelectVault(VaultType.RANGEBOUND)}
            >
              Select Rangebound Strategy
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 max-w-6xl mx-auto">
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Why Choose Thetanuts SubDAO Options Vault?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                Simplified Options
              </h4>
              <p className="text-sm text-muted-foreground">
                Access complex options strategies without needing to manage positions yourself.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                Professional Management
              </h4>
              <p className="text-sm text-muted-foreground">
                Strategies are executed by Thetanuts V4 contracts with proven track records.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                Capital Efficiency
              </h4>
              <p className="text-sm text-muted-foreground">
                Optimize your stablecoin holdings with strategies designed for different market conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Table */}
      <div className="mt-12 max-w-6xl mx-auto overflow-hidden">
        <h3 className="text-lg font-medium mb-4">Strategy Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-400 font-normal">Strategy</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-normal">Best For</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-normal">Risk Level</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-normal">Yield Source</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-normal">Est. APY</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 px-4 flex items-center gap-2">
                  <div className="bg-blue-500/10 p-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Directional</span>
                </td>
                <td className="py-3 px-4 text-zinc-300">Trending Markets</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    High
                  </Badge>
                </td>
                <td className="py-3 px-4 text-zinc-300">Option Spreads Profit</td>
                <td className="py-3 px-4 text-blue-400">{directionalAPY}</td>
              </tr>
              <tr className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 px-4 flex items-center gap-2">
                  <div className="bg-purple-500/10 p-1 rounded-full">
                    <ArrowsHorizontal className="h-4 w-4 text-purple-400" />
                  </div>
                  <span>Rangebound</span>
                </td>
                <td className="py-3 px-4 text-zinc-300">Sideways Markets</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                    Moderate
                  </Badge>
                </td>
                <td className="py-3 px-4 text-zinc-300">Option Premium</td>
                <td className="py-3 px-4 text-purple-400">{condorAPY}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
