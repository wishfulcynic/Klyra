export enum VaultType {
  DIRECTIONAL = "directional",
  RANGEBOUND = "rangebound",
}

export interface VaultData {
  tvl: number
  apy: number
  sharePrice: number
  nextExpiry: number
  pendingDeposit: number
  isRfqActive: boolean
}

export interface DirectionalVaultData extends VaultData {
  claimableEarnings: number
  currentPrice: number
  lowerStrike: number
  upperStrike: number
  currentDirection: "bullish" | "bearish"
}

export interface RangeboundVaultData extends VaultData {
  currentPrice: number
  lowerStrike: number
  upperStrike: number
}
