"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowUpDown, Clock } from "lucide-react"
import { VaultType } from "@/lib/types"
import { useVaultData } from "@/hooks/use-vault-data"
import { motion } from "framer-motion"

interface VaultListProps {
  onSelectVault: (vault: VaultType) => void
}

export function VaultList({ onSelectVault }: VaultListProps) {
  const { callVaultData, putVaultData, condorVaultData } = useVaultData()

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl font-semibold tracking-tight mb-4 text-gray-900">Options Vaults</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Deposit stablecoins into strategy vaults based on your market outlook. Choose between directional and
          range-bound strategies.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Directional Options Vault */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 w-full"></div>
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Directional Options Vault</h3>
                  <p className="text-gray-600 mt-1">Use yield to purchase options with asymmetric upside.</p>
                </div>
              </div>

              <div className="mb-8 h-32 flex items-center justify-center border-b border-gray-100 pb-4">
                <svg width="240" height="100" viewBox="0 0 240 100" className="text-indigo-600">
                  <defs>
                    <linearGradient id="directionalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(79, 70, 229, 0.2)" />
                      <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20,80 L 120,80 L 120,20 L 220,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path d="M 20,80 L 120,80 L 120,20 L 220,20 L 220,100 L 20,100 Z" fill="url(#directionalGradient)" />
                  <text x="20" y="95" className="text-xs text-gray-500" style={{ fontSize: "10px" }}>
                    Lower
                  </text>
                  <text
                    x="220"
                    y="95"
                    className="text-xs text-gray-500"
                    style={{ fontSize: "10px", textAnchor: "end" }}
                  >
                    Upper
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">APY (base):</div>
                  <div className="text-2xl font-semibold text-indigo-600">{callVaultData?.metrics?.apy || '0%'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">Current Strike:</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    ${parseFloat(callVaultData?.currentPrice || '0').toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">Success Rate:</div>
                  <div className="text-2xl font-semibold text-gray-900">{callVaultData?.metrics?.successRate || '0%'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">Best Return:</div>
                  <div className="text-2xl font-semibold text-green-600">{callVaultData?.metrics?.bestReturn || '+0%'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span>
                  Next Cycle: <span className="font-medium">7d 0h</span>
                </span>
              </div>

              <div className="mt-auto">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => onSelectVault(VaultType.DIRECTIONAL)}
                >
                  View Strategy Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mean Reverting Condor Vault */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 w-full"></div>
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Mean Reverting Condor Vault</h3>
                  <p className="text-gray-600 mt-1">Sell Iron Condors to enhance yield in range-bound markets.</p>
                </div>
              </div>

              <div className="mb-8 h-32 flex items-center justify-center border-b border-gray-100 pb-4">
                <svg width="240" height="100" viewBox="0 0 240 100" className="text-purple-600">
                  <defs>
                    <linearGradient id="condorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(147, 51, 234, 0.2)" />
                      <stop offset="50%" stopColor="rgba(147, 51, 234, 0.1)" />
                      <stop offset="100%" stopColor="rgba(147, 51, 234, 0.2)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20,80 L 60,20 L 180,20 L 220,80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path d="M 20,80 L 60,20 L 180,20 L 220,80 L 220,100 L 20,100 Z" fill="url(#condorGradient)" />
                  <text x="20" y="95" className="text-xs text-gray-500" style={{ fontSize: "10px" }}>
                    Lower
                  </text>
                  <text
                    x="120"
                    y="95"
                    className="text-xs text-gray-500"
                    style={{ fontSize: "10px", textAnchor: "middle" }}
                  >
                    Middle
                  </text>
                  <text
                    x="220"
                    y="95"
                    className="text-xs text-gray-500"
                    style={{ fontSize: "10px", textAnchor: "end" }}
                  >
                    Upper
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">APY (target):</div>
                  <div className="text-2xl font-semibold text-purple-600">{condorVaultData?.metrics?.apy || '0%'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">Current Range:</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    ${condorVaultData?.strikes?.[0] || '0.00'} - ${condorVaultData?.strikes?.[condorVaultData?.strikes.length - 1] || '0.00'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">Success Rate:</div>
                  <div className="text-2xl font-semibold text-gray-900">{condorVaultData?.metrics?.successRate || '0%'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1 font-medium">Avg. Yield:</div>
                  <div className="text-2xl font-semibold text-green-600">{condorVaultData?.metrics?.avgYield || '+0%/wk'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>
                  Next Cycle: <span className="font-medium">7d 0h</span>
                </span>
              </div>

              <div className="mt-auto">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => onSelectVault(VaultType.RANGEBOUND)}
                >
                  View Strategy Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 max-w-6xl mx-auto"
      >
        <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Strategy Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Strategy</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Best For</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Risk Level</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Yield Source</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Est. APY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="bg-indigo-100 p-1 rounded-full">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-gray-900 font-medium">Directional</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">Trending Markets</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">High</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-700">Option Spreads Profit</td>
                    <td className="py-3 px-4 text-indigo-600 font-medium">{callVaultData?.metrics?.apy || '0%'}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="bg-purple-100 p-1 rounded-full">
                        <ArrowUpDown className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-gray-900 font-medium">Mean Reverting</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">Sideways Markets</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200">Moderate</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-700">Iron Condor Premium</td>
                    <td className="py-3 px-4 text-purple-600 font-medium">{condorVaultData?.metrics?.apy || '0%'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
