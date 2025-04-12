"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { StrategyVaultWrapper } from '@/lib/contract'
import { ethers } from "ethers"

export type PerformanceMetrics = {
  apy: string;
  successRate: string;
  bestReturn: string;
  avgYield: string;
};

export type VaultData = {
  // General data
  sharePrice: string | null; // Allow null for loading/error states
  totalValueLocked: string | null;
  remainingCapacity: string | null;
  isActiveDeposit: boolean | null;
  queuedDeposits: number | null;
  
  // Performance metrics
  metrics: PerformanceMetrics | null;
  
  // Strike data
  strikes: string[] | null;
  currentPrice: string | null;
  nextCycleExpiry: number | null; // Keep as number (seconds since epoch)
};

export function useVaultData() {
  const { address, isConnected, /* chainId */ } = useWallet()
  const [isLoading, setIsLoading] = useState(true) // Start loading initially
  const [error, setError] = useState<string | null>(null)
  
  // Wrapper instance
  const [wrapper, setWrapper] = useState<StrategyVaultWrapper | null>(null)
  
  // Vault data - initialize to null
  const [callVaultData, setCallVaultData] = useState<VaultData | null>(null)
  const [putVaultData, setPutVaultData] = useState<VaultData | null>(null)
  const [condorVaultData, setCondorVaultData] = useState<VaultData | null>(null)
  const [totalValueLocked, setTotalValueLocked] = useState<string | null>(null)
  const [hasQueuedDeposits, setHasQueuedDeposits] = useState<boolean>(false)
  
  // User balances
  const [userSusdsBalance, setUserSusdsBalance] = useState<string>('0')
  const [callVaultShares, setCallVaultShares] = useState<string>('0')
  const [putVaultShares, setPutVaultShares] = useState<string>('0')
  const [condorVaultShares, setCondorVaultShares] = useState<string>('0')

  // Interaction state
  const [needsApproval, setNeedsApproval] = useState(true)
  
  // Initialize wrapper (will attempt read-only init even if not connected)
  useEffect(() => {
    const initWrapper = async () => {
      try {
        // Initialize wrapper, passing address string or undefined
        const newWrapper = new StrategyVaultWrapper()
        // Ensure address is either string or undefined, converting null if necessary
        const userAddressForInit = (isConnected && address) ? address : undefined;
        await newWrapper.init(userAddressForInit)
        setWrapper(newWrapper)
      } catch (error) {
        console.error("Failed to initialize contract wrapper:", error)
        setError("Failed to connect to contracts. Please check console.")
        setIsLoading(false) // Stop loading on init error
      }
    }
    
    initWrapper()
  }, [address, isConnected]) // Re-init if connection status or address changes
  
  // Fetch data when wrapper is available
  useEffect(() => {
    // Don't fetch if wrapper hasn't initialized
    if (!wrapper) {
        // If not connected and wrapper init failed, stop loading.
        // If connected, wrapper init might still be in progress.
        if (!isConnected) setIsLoading(false);
        return;
    }
    
    let mounted = true
    setIsLoading(true)
    setError(null)
    
    const fetchData = async () => {
      try {
        // Create a timeout promise to prevent hanging
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        // Get total TVL with timeout
        try {
          const tvlPromise = wrapper.getTotalValueLocked();
          const tvl = await Promise.race([tvlPromise, timeout]) as bigint;
          if (mounted) {
            setTotalValueLocked(ethers.formatUnits(tvl, 18))
          }
        } catch (err) {
          console.error('Error fetching TVL:', err);
          if (mounted) setTotalValueLocked(null); // Set to null on error
        }
        
        // Only fetch user-specific data if connected
        if (isConnected && address) {
             try {
               const hasApproved = await Promise.race([wrapper.checkAllowance(address), timeout]);
               if (mounted) {
                 setNeedsApproval(!hasApproved)
               }
             } catch (err) {
               console.error('Error checking allowance:', err);
               // Keep previous state or set default?
             }
            
             try {
               // Use the dedicated method which utilizes the read instance
               const balanceResult = await Promise.race([wrapper.getSusdsBalance(address), timeout]);
               // Check if the result is a valid bigint before formatting
               if (mounted && typeof balanceResult === 'bigint') {
                 setUserSusdsBalance(ethers.formatUnits(balanceResult, 18))
               } else if (mounted) {
                  console.warn('Received invalid balance result:', balanceResult);
                  setUserSusdsBalance('0'); // Set to 0 on error/timeout
               }
             } catch (err) {
               console.error('Error fetching balance:', err);
                if (mounted) {
                    setUserSusdsBalance('0'); // Set to 0 on error
                }
             }
             
             // TODO: Fetch user shares (call, put, condor)
             if (mounted) {
                 setCallVaultShares('0'); 
                 setPutVaultShares('0');
                 setCondorVaultShares('0');
             } 
        } else {
            // Reset user-specific data if not connected
            if (mounted) {
                setUserSusdsBalance('0');
                setNeedsApproval(true);
                setCallVaultShares('0'); 
                setPutVaultShares('0');
                setCondorVaultShares('0');
            }
        }
        
        try {
          const directionalQueued = await Promise.race([wrapper.getQueuedDepositsCount(true), timeout]) as bigint;
          const condorQueued = await Promise.race([wrapper.getQueuedDepositsCount(false), timeout]) as bigint;
          if (mounted) {
            setHasQueuedDeposits(directionalQueued > BigInt(0) || condorQueued > BigInt(0))
          }
        } catch (err) {
          console.error('Error fetching queued deposits:', err);
          if (mounted) setHasQueuedDeposits(false);
        }
        
        // Fetch vault-specific data, handle errors by setting data to null
        try {
          const callData = await fetchVaultData(wrapper, true, true); // Removed setters
          if (mounted) setCallVaultData(callData);
        } catch (err) {
          console.error('Error fetching call vault data:', err);
          if (mounted) setCallVaultData(null);
        }
        
        try {
          const putData = await fetchVaultData(wrapper, true, false);
          if (mounted) setPutVaultData(putData);
        } catch (err) {
          console.error('Error fetching put vault data:', err);
           if (mounted) setPutVaultData(null);
        }
        
        try {
           const condorData = await fetchVaultData(wrapper, false, false);
           if (mounted) setCondorVaultData(condorData);
        } catch (err) {
          console.error('Error fetching condor vault data:', err);
          if (mounted) setCondorVaultData(null);
        }
        
      } catch (err) {
        // Catch errors from Promise.race or other general errors
        console.error('Error fetching vault data:', err)
        if (mounted) {
          setError('Failed to load vault data');
          // Set all vault data to null on major fetch error
          setCallVaultData(null);
          setPutVaultData(null);
          setCondorVaultData(null);
          setTotalValueLocked(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    fetchData()
    
    // Set up refresh interval (every 60 seconds)
    const intervalId = setInterval(fetchData, 60000)
    
    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [wrapper, isConnected, address]) // Rerun if wrapper, connection, or address changes
  
  
  /**
   * Helper function to fetch data for a specific vault
   * Now returns the data object or throws an error
   */
  const fetchVaultData = async (
    wrapper: StrategyVaultWrapper,
    isDirectional: boolean,
    isCall: boolean
  ): Promise<VaultData> => {
    let expiryTimestamp: bigint | null = null;

    // Get metrics
    const metrics = await wrapper.getPerformanceMetrics(isDirectional, isCall)
    
    // Get share price
    const sharePrice = await wrapper.getSharePrice(isDirectional, isCall)
    
    // Get strikes
    const strikes = isDirectional 
      ? await wrapper.getDirectionalStrikes(isCall)
      : await wrapper.getCondorStrikes()
    
    // Get current price
    const currentPrice = await wrapper.getCurrentPrice(isCall) // Note: isCall might not be relevant for condor price
    
    // Check if active deposit queue (directional only for now)
    const queuedDepositsCount = isDirectional ? await wrapper.getQueuedDepositsCount(isDirectional) : BigInt(0);

    // Fetch expiry timestamp for directional vaults
    if (isDirectional && wrapper.readWrapper) {
      try {
        const cycleInfo = await wrapper.readWrapper.vaultCycles(isCall);
        // cycleInfo will be a struct-like array: [startTime, endTime, active, nextExpiryTimestamp]
        if (cycleInfo && cycleInfo.length >= 4) {
           expiryTimestamp = BigInt(cycleInfo[3]); // Index 3 is nextExpiryTimestamp
        }
      } catch (err) {
         console.error(`Error fetching vaultCycles for isCall=${isCall}:`, err);
         expiryTimestamp = null; // Set to null on error
      }
    } // Condor expiry remains null for now

    // TODO: Fetch real TVL/Capacity if available per vault
    // const vaultSpecificTVL = ...
    // const vaultRemainingCapacity = ...
    
    // Create vault data object
    const vaultData: VaultData = {
      sharePrice: ethers.formatUnits(sharePrice, 18),
      totalValueLocked: null, // Placeholder - Use overall TVL for now
      remainingCapacity: null, // Placeholder - Needs specific logic
      isActiveDeposit: queuedDepositsCount > BigInt(0),
      queuedDeposits: Number(queuedDepositsCount),
      
      metrics: {
        apy: (Number(metrics.apy) / 100).toFixed(2) + '%',
        successRate: Number(metrics.successRate) + '%',
        bestReturn: (Number(metrics.bestReturn) / 100).toFixed(2) + '%',
        avgYield: (Number(metrics.avgYield) / 100).toFixed(2) + '%/wk',
      },
      
      strikes: strikes.map(s => ethers.formatUnits(s, 8)),
      currentPrice: ethers.formatUnits(currentPrice, 8),
      // Convert bigint timestamp to number (seconds since epoch), or keep null
      nextCycleExpiry: expiryTimestamp !== null ? Number(expiryTimestamp) : null,
    }
    
    return vaultData;
  }
  
  // Helper functions for interacting with the contract
  
  const approveWrapper = async () => {
    if (!isConnected || !wrapper || !address) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = await wrapper.approveSusds(ethers.MaxUint256.toString())
      await tx.wait()
      setNeedsApproval(false)
      return true
    } catch (err) {
      console.error('Error approving wrapper:', err)
      throw err
    }
  }
  
  const depositDirectional = async (amount: string, isCall: boolean) => {
    if (!isConnected || !wrapper || !address) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const parsedAmount = ethers.parseUnits(amount, 18)
      const tx = await wrapper.depositDirectional(parsedAmount.toString(), isCall)
      await tx.wait()
      // Trigger data refresh after successful tx
      setWrapper(wrapper); // Re-setting wrapper triggers useEffect
      return true
    } catch (err) {
      console.error('Error depositing to directional vault:', err)
      throw err
    }
  }
  
  const depositCondor = async (amount: string) => {
    if (!isConnected || !wrapper || !address) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const parsedAmount = ethers.parseUnits(amount, 18)
      const tx = await wrapper.depositCondor(parsedAmount.toString())
      await tx.wait()
      // Trigger data refresh after successful tx
       setWrapper(wrapper);
      return true
    } catch (err) {
      console.error('Error depositing to condor vault:', err)
      throw err
    }
  }
  
  const withdrawDirectional = async (shareAmount: string, isCall: boolean) => {
    if (!isConnected || !wrapper || !address) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const parsedAmount = ethers.parseUnits(shareAmount, 18)
      const tx = await wrapper.withdrawDirectional(parsedAmount.toString(), isCall)
      await tx.wait()
      // Trigger data refresh after successful tx
       setWrapper(wrapper);
      return true
    } catch (err) {
      console.error('Error withdrawing from directional vault:', err)
      throw err
    }
  }
  
  const withdrawCondor = async (shareAmount: string) => {
    if (!isConnected || !wrapper || !address) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const parsedAmount = ethers.parseUnits(shareAmount, 18)
      const tx = await wrapper.withdrawCondor(parsedAmount.toString())
      await tx.wait()
      // Trigger data refresh after successful tx
       setWrapper(wrapper);
      return true
    } catch (err) {
      console.error('Error withdrawing from condor vault:', err)
      throw err
    }
  }
  
  const claimProfits = async (isDirectional: boolean, isCall: boolean) => {
    if (!isConnected || !wrapper || !address) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = await wrapper.claimProfits(isDirectional, isCall)
      await tx.wait()
      // Trigger data refresh after successful tx
       setWrapper(wrapper);
      return true
    } catch (err) {
      console.error('Error claiming profits:', err)
      throw err
    }
  }
  
  return {
    // Data
    callVaultData,
    putVaultData,
    condorVaultData,
    totalValueLocked,
    userSusdsBalance,
    callVaultShares,
    putVaultShares,
    condorVaultShares,
    needsApproval,
    hasQueuedDeposits,
    
    // State
    isLoading,
    error,
    
    // Actions
    approveWrapper,
    depositDirectional,
    depositCondor,
    withdrawDirectional,
    withdrawCondor,
    claimProfits,
  }
}
