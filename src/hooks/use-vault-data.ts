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
  sharePrice: string;
  totalValueLocked: string;
  remainingCapacity: string;
  isActiveDeposit: boolean;
  queuedDeposits: number;
  
  // Performance metrics
  metrics: PerformanceMetrics;
  
  // Strike data
  strikes: string[];
  currentPrice: string;
  nextCycleExpiry: number;
};

export function useVaultData() {
  const { address, isConnected, chainId } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Wrapper instance
  const [wrapper, setWrapper] = useState<StrategyVaultWrapper | null>(null)
  
  // Vault data
  const [callVaultData, setCallVaultData] = useState<VaultData | null>(null)
  const [putVaultData, setPutVaultData] = useState<VaultData | null>(null)
  const [condorVaultData, setCondorVaultData] = useState<VaultData | null>(null)
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0')
  const [hasQueuedDeposits, setHasQueuedDeposits] = useState(false)
  
  // User balances
  const [userSusdsBalance, setUserSusdsBalance] = useState<string>('0')
  const [callVaultShares, setCallVaultShares] = useState<string>('0')
  const [putVaultShares, setPutVaultShares] = useState<string>('0')
  const [condorVaultShares, setCondorVaultShares] = useState<string>('0')

  // Interaction state
  const [needsApproval, setNeedsApproval] = useState(true)
  
  // Initialize with demo data immediately
  useEffect(() => {
    // Always set demo data right away, even if wallet is connected
    // This ensures we always have something to show
    const mockMetrics = {
      apy: '18.4%',
      successRate: '82%',
      bestReturn: '+12.4%',
      avgYield: '+1.8%/wk',
    };
    
    const mockVaultData: VaultData = {
      sharePrice: '1.0456',
      totalValueLocked: '2450000',
      remainingCapacity: '2550000',
      isActiveDeposit: false,
      queuedDeposits: 0,
      metrics: mockMetrics,
      strikes: ['1800.00', '2000.00', '2200.00', '2400.00'],
      currentPrice: '2100.00',
      nextCycleExpiry: Math.floor(Date.now() / 1000) + 4 * 24 * 60 * 60,
    };
    
    // Apply demo data immediately
    setCallVaultData({...mockVaultData});
    setPutVaultData({...mockVaultData, 
      metrics: {...mockMetrics, apy: '15.2%'},
      strikes: ['1850.00', '1950.00', '2050.00', '2150.00']
    });
    setCondorVaultData({...mockVaultData, 
      metrics: {...mockMetrics, apy: '12.6%', successRate: '92%'},
      strikes: ['1900.00', '2000.00', '2200.00', '2300.00']
    });
    
    setTotalValueLocked('5200000');
    
    // If not connected, we're done - just show the mock data
    if (!isConnected) {
      setIsLoading(false);
    }
  }, []);  // Empty dependency array means this runs once on mount
  
  // Initialize wrapper when wallet is connected
  useEffect(() => {
    if (!isConnected || !address) {
      setWrapper(null)
      return
    }
    
    const initWrapper = async () => {
      try {
        const newWrapper = new StrategyVaultWrapper()
        await newWrapper.init(address)
        setWrapper(newWrapper)
      } catch (error) {
        console.error("Failed to initialize contract wrapper:", error)
        setError("Failed to connect to contracts. Please make sure your wallet is connected properly.")
      }
    }
    
    initWrapper()
  }, [address, isConnected])
  
  // Fetch data when wrapper is available
  useEffect(() => {
    if (!wrapper || !isConnected || !address) {
      setIsLoading(false)
      return
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
        let tvl;
        try {
          const tvlPromise = wrapper.getTotalValueLocked();
          tvl = await Promise.race([tvlPromise, timeout]) as bigint;
        } catch (err) {
          console.error('Error fetching TVL, using default:', err);
          tvl = BigInt('5000000000000000000000'); // Default 5000 tokens
        }
        
        if (mounted) {
          setTotalValueLocked(ethers.formatUnits(tvl, 18))
        }
        
        // Other data fetching with error handling
        try {
          const capacity = await Promise.race([wrapper.getRemainingCapacity(), timeout]);
          // Use capacity data (not shown in current code)
        } catch (err) {
          console.error('Error fetching capacity:', err);
        }
        
        try {
          const hasApproved = await Promise.race([wrapper.checkAllowance(address), timeout]);
          if (mounted) {
            setNeedsApproval(!hasApproved)
          }
        } catch (err) {
          console.error('Error checking allowance:', err);
        }
        
        try {
          const balance = await Promise.race([wrapper.susdsToken?.balanceOf(address), timeout]);
          if (mounted && balance) {
            setUserSusdsBalance(ethers.formatUnits(balance, 18))
          }
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
        
        try {
          const directionalQueued = await Promise.race([wrapper.getQueuedDepositsCount(true), timeout]) as bigint;
          const condorQueued = await Promise.race([wrapper.getQueuedDepositsCount(false), timeout]) as bigint;
          if (mounted) {
            setHasQueuedDeposits(directionalQueued > BigInt(0) || condorQueued > BigInt(0))
          }
        } catch (err) {
          console.error('Error fetching queued deposits:', err);
        }
        
        // Fetch vault data with error handling
        try {
          await fetchVaultData(wrapper, true, true, setCallVaultData, setCallVaultShares)
        } catch (err) {
          console.error('Error fetching call vault data:', err);
          // Set default data if fetching fails
          setDefaultVaultData(setCallVaultData, 'call');
        }
        
        try {
          await fetchVaultData(wrapper, true, false, setPutVaultData, setPutVaultShares)
        } catch (err) {
          console.error('Error fetching put vault data:', err);
          setDefaultVaultData(setPutVaultData, 'put');
        }
        
        try {
          await fetchVaultData(wrapper, false, false, setCondorVaultData, setCondorVaultShares)
        } catch (err) {
          console.error('Error fetching condor vault data:', err);
          setDefaultVaultData(setCondorVaultData, 'condor');
        }
        
      } catch (err) {
        console.error('Error fetching vault data:', err)
        if (mounted) {
          setError('Failed to load vault data')
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
  }, [wrapper, isConnected, address])
  
  // Helper function to set default vault data if fetching fails
  const setDefaultVaultData = (setVaultData: (data: VaultData) => void, vaultType: string) => {
    const apy = vaultType === 'call' ? '18.4%' : vaultType === 'put' ? '15.2%' : '12.6%';
    const successRate = vaultType === 'condor' ? '92%' : '82%';
    
    setVaultData({
      sharePrice: '1.0456',
      totalValueLocked: '2450000',
      remainingCapacity: '2550000',
      isActiveDeposit: false,
      queuedDeposits: 0,
      metrics: {
        apy,
        successRate,
        bestReturn: '+12.4%',
        avgYield: '+1.8%/wk',
      },
      strikes: ['1800.00', '2000.00', '2200.00', '2400.00'],
      currentPrice: '2100.00',
      nextCycleExpiry: Math.floor(Date.now() / 1000) + 4 * 24 * 60 * 60,
    });
  };
  
  /**
   * Helper function to fetch data for a specific vault
   */
  const fetchVaultData = async (
    wrapper: StrategyVaultWrapper,
    isDirectional: boolean,
    isCall: boolean,
    setVaultData: (data: VaultData) => void,
    setUserShares: (shares: string) => void
  ) => {
    // Get metrics
    const metrics = await wrapper.getPerformanceMetrics(isDirectional, isCall)
    
    // Get share price
    const sharePrice = await wrapper.getSharePrice(isDirectional, isCall)
    
    // Get strikes
    const strikes = isDirectional 
      ? await wrapper.getDirectionalStrikes(isCall)
      : await wrapper.getCondorStrikes()
    
    // Get current price
    const currentPrice = await wrapper.getCurrentPrice(isCall)
    
    // Check if active deposit
    const dirQueuedDeposits = await wrapper.getQueuedDepositsCount(isDirectional)
    
    // Create vault data object
    const vaultData: VaultData = {
      sharePrice: ethers.formatUnits(sharePrice, 18),
      totalValueLocked: '0', // Will be calculated from TVL
      remainingCapacity: '0', // Will be calculated from capacity
      isActiveDeposit: dirQueuedDeposits > BigInt(0),
      queuedDeposits: Number(dirQueuedDeposits),
      
      metrics: {
        apy: (Number(metrics.apy) / 100).toFixed(2) + '%',
        successRate: Number(metrics.successRate) + '%',
        bestReturn: (Number(metrics.bestReturn) / 100).toFixed(2) + '%',
        avgYield: (Number(metrics.avgYield) / 100).toFixed(2) + '%/wk',
      },
      
      strikes: strikes.map(s => ethers.formatUnits(s, 8)),
      currentPrice: ethers.formatUnits(currentPrice, 8),
      nextCycleExpiry: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // Placeholder 7d
    }
    
    setVaultData(vaultData)
    
    // TODO: Add user shares once we connect to vault contracts
    setUserShares('0')
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
