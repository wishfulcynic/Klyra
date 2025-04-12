import { ethers } from "ethers"

// Your contract ABI - update with your actual ABI
export const KLYRA_CONTRACT_ABI = [
  // Read functions
  "function getTVL() view returns (uint256)",
  "function getAPY() view returns (uint256)",
  "function getSharePrice() view returns (uint256)",
  "function getNextExpiry() view returns (uint256)",
  "function getUserBalance(address user) view returns (uint256)",

  // New functions from wrapper contract
  "function getDirectionalStrikes(bool isCall) view returns (uint256[])",
  "function getCondorStrikes() view returns (uint256[])",
  "function getCurrentPrice(bool isCall) view returns (uint256)",
  "function calculateDirectionalContracts(uint256 amount, bool isCall) view returns (uint256, uint256[])",
  "function calculateCondorContracts(uint256 amount) view returns (uint256, uint256[])",

  // Write functions
  "function depositDirectional(uint256 amount, bool isCall)",
  "function depositCondor(uint256 amount)",
  "function withdrawDirectional(uint256 shareAmount, bool isCall) returns (uint256)",
  "function withdrawCondor(uint256 shareAmount) returns (uint256)",

  // Add any other methods from your contract
]

// Contract addresses - replace with your actual deployed addresses
export const CONTRACT_ADDRESSES = {
  // Base network addresses
  BASE: {
    WRAPPER: "0x...", // Replace with actual address
    SUSDS: "0x5875eEE11Cf8398102FdAd704C9E96607675467a", // sUSDS on Base
    CALL_VAULT: "0x...", // Replace with actual address
    PUT_VAULT: "0x...", // Replace with actual address
    CONDOR_VAULT: "0x...", // Replace with actual address
  }
};

// Network information
export const SUPPORTED_CHAINS = {
  BASE_MAINNET: 8453,
  // Add more chains as needed
};

// RPC URL for read-only operations when wallet is not connected
const RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/your-api-key" // Replace with your RPC provider

// Helper function to get contract instance
export async function getContract(needSigner = false) {
  try {
    let provider: ethers.Provider;
    let signer = null;

    // Check if we're in a browser environment and have access to window.ethereum
    if (typeof window !== "undefined" && window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);

      // Only try to get a signer if we need one and the user is connected
      if (needSigner && window.ethereum.selectedAddress) {
        signer = await (provider as ethers.BrowserProvider).getSigner();
      }
    } else {
      // Fallback to a read-only provider if no wallet is available
      provider = new ethers.JsonRpcProvider(RPC_URL);
    }

    // Return contract with signer if available, otherwise with provider
    const addresses = CONTRACT_ADDRESSES.BASE;
    return new ethers.Contract(addresses.WRAPPER, KLYRA_CONTRACT_ABI, signer || provider);
  } catch (error) {
    console.error("Failed to get contract instance:", error);
    return null;
  }
}

// Get stable token contract
export async function getStableTokenContract(needSigner = false) {
  try {
    let provider: ethers.Provider;
    let signer = null;

    if (typeof window !== "undefined" && window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      if (needSigner && window.ethereum.selectedAddress) {
        signer = await (provider as ethers.BrowserProvider).getSigner();
      }
    } else {
      provider = new ethers.JsonRpcProvider(RPC_URL);
    }

    // Use a basic ERC20 ABI for the stable token
    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
    ];

    const addresses = CONTRACT_ADDRESSES.BASE;
    return new ethers.Contract(addresses.SUSDS, erc20Abi, signer || provider);
  } catch (error) {
    console.error("Failed to get stable token contract:", error);
    return null;
  }
}

// Check if wallet is connected
export function isWalletConnected(): boolean {
  return typeof window !== "undefined" && !!window.ethereum && !!window.ethereum.selectedAddress;
}

// Contract ABIs - import from JSON files or define inline
const STRATEGY_VAULT_WRAPPER_ABI = [
  // Deposit functions
  "function depositDirectional(uint256 amount, bool isCall) external",
  "function depositCondor(uint256 amount) external",
  
  // Withdraw functions
  "function withdrawDirectional(uint256 shareAmount, bool isCall) external returns (uint256)",
  "function withdrawCondor(uint256 shareAmount) external returns (uint256)",
  
  // Query functions
  "function getDirectionalStrikes(bool isCall) external view returns (uint256[])",
  "function getCondorStrikes() external view returns (uint256[])",
  "function getCurrentPrice(bool isCall) external view returns (uint256)",
  "function calculateDirectionalContracts(uint256 amount, bool isCall) external view returns (uint256, uint256[])",
  "function calculateCondorContracts(uint256 amount) external view returns (uint256, uint256[])",
  
  // New functionality
  "function claimProfits(bool isDirectional, bool isCall) external returns (uint256)",
  "function getPerformanceMetrics(bool isDirectional, bool isCall) external view returns (uint256, uint256, uint256, uint256)",
  "function getSharePrice(bool isDirectional, bool isCall) external view returns (uint256)",
  "function getRemainingCapacity() external view returns (uint256, uint256, uint256, uint256)",
  "function getTotalValueLocked() external view returns (uint256)",
  "function getQueuedDepositsCount(bool isDirectional) external view returns (uint256)",
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

/**
 * Creates contract instances for the Strategy Vault Wrapper
 * @param provider ethers provider
 * @param chainId chain ID to use
 * @returns Object containing contract instances
 */
export async function createContracts(provider: ethers.BrowserProvider, chainId: number) {
  let addresses;
  
  // Select addresses based on chainId
  switch (chainId) {
    case SUPPORTED_CHAINS.BASE_MAINNET:
      addresses = CONTRACT_ADDRESSES.BASE;
      break;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  
  const signer = await provider.getSigner();
  
  // Create contract instances
  const wrapperContract = new ethers.Contract(
    addresses.WRAPPER,
    STRATEGY_VAULT_WRAPPER_ABI,
    signer
  );
  
  const susdsTokenContract = new ethers.Contract(
    addresses.SUSDS,
    ERC20_ABI,
    signer
  );
  
  // Return all contract instances
  return {
    wrapper: wrapperContract,
    susdsToken: susdsTokenContract,
  };
}

// Define type for window.ethereum to avoid typescript errors
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      selectedAddress?: string;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

/**
 * Wrapper class for interacting with the Strategy Vault Wrapper contract
 */
export class StrategyVaultWrapper {
  wrapper: ethers.Contract | null = null;
  susdsToken: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private chainId: number | null = null;
  
  /**
   * Initialize contracts - must be called before using any other methods
   */
  async init(userAddress: string): Promise<void> {
    try {
      // We need to have metamask connected to proceed
      if (!window.ethereum || !userAddress) {
        throw new Error("No ethereum provider or user address available");
      }
      
      // Create provider from window.ethereum
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      
      // Make sure signer address matches expected address
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error("Signer address doesn't match connected wallet");
      }
      
      // Get chain ID
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);
      
      // Create contracts
      const addresses = this.getAddresses();
      
      this.wrapper = new ethers.Contract(
        addresses.WRAPPER,
        STRATEGY_VAULT_WRAPPER_ABI,
        signer
      );
      
      this.susdsToken = new ethers.Contract(
        addresses.SUSDS,
        ERC20_ABI,
        signer
      );
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      throw error;
    }
  }
  
  /**
   * Check if contracts are initialized
   */
  private ensureInitialized(): void {
    if (!this.wrapper || !this.susdsToken) {
      throw new Error("Contracts not initialized. Call init() first.");
    }
  }
  
  /**
   * Approve the wrapper to spend tokens
   */
  async approveSusds(amount: string): Promise<ethers.TransactionResponse> {
    this.ensureInitialized();
    const addresses = this.getAddresses();
    return await this.susdsToken!.approve(addresses.WRAPPER, amount) as ethers.TransactionResponse;
  }
  
  /**
   * Check if the wrapper has sufficient allowance
   */
  async checkAllowance(userAddress: string): Promise<boolean> {
    this.ensureInitialized();
    const addresses = this.getAddresses();
    const allowance = await this.susdsToken!.allowance(userAddress, addresses.WRAPPER);
    const half = BigInt(ethers.MaxUint256) / BigInt(2);
    return allowance >= half;
  }
  
  /**
   * Deposit into directional vault
   */
  async depositDirectional(amount: string, isCall: boolean): Promise<ethers.TransactionResponse> {
    this.ensureInitialized();
    return await this.wrapper!.depositDirectional(amount, isCall) as ethers.TransactionResponse;
  }
  
  /**
   * Deposit into condor vault
   */
  async depositCondor(amount: string): Promise<ethers.TransactionResponse> {
    this.ensureInitialized();
    return await this.wrapper!.depositCondor(amount) as ethers.TransactionResponse;
  }
  
  /**
   * Withdraw from directional vault
   */
  async withdrawDirectional(shareAmount: string, isCall: boolean): Promise<ethers.TransactionResponse> {
    this.ensureInitialized();
    return await this.wrapper!.withdrawDirectional(shareAmount, isCall) as ethers.TransactionResponse;
  }
  
  /**
   * Withdraw from condor vault
   */
  async withdrawCondor(shareAmount: string): Promise<ethers.TransactionResponse> {
    this.ensureInitialized();
    return await this.wrapper!.withdrawCondor(shareAmount) as ethers.TransactionResponse;
  }
  
  /**
   * Claim profits from a vault
   */
  async claimProfits(isDirectional: boolean, isCall: boolean): Promise<ethers.TransactionResponse> {
    this.ensureInitialized();
    return await this.wrapper!.claimProfits(isDirectional, isCall) as ethers.TransactionResponse;
  }
  
  /**
   * Get performance metrics for a vault
   */
  async getPerformanceMetrics(isDirectional: boolean, isCall: boolean): Promise<{ 
    apy: bigint;
    successRate: bigint;
    bestReturn: bigint;
    avgYield: bigint;
  }> {
    this.ensureInitialized();
    const [apy, successRate, bestReturn, avgYield] = await this.wrapper!.getPerformanceMetrics(isDirectional, isCall);
    return { apy, successRate, bestReturn, avgYield };
  }
  
  /**
   * Get share price for a vault
   */
  async getSharePrice(isDirectional: boolean, isCall: boolean): Promise<bigint> {
    this.ensureInitialized();
    return await this.wrapper!.getSharePrice(isDirectional, isCall);
  }
  
  /**
   * Get remaining capacity for vaults
   */
  async getRemainingCapacity(): Promise<{
    overall: bigint;
    call: bigint;
    put: bigint;
    condor: bigint;
  }> {
    this.ensureInitialized();
    const [overall, call, put, condor] = await this.wrapper!.getRemainingCapacity();
    return { overall, call, put, condor };
  }
  
  /**
   * Get total value locked across all vaults
   */
  async getTotalValueLocked(): Promise<bigint> {
    this.ensureInitialized();
    return await this.wrapper!.getTotalValueLocked();
  }
  
  /**
   * Get number of queued deposits
   */
  async getQueuedDepositsCount(isDirectional: boolean): Promise<bigint> {
    this.ensureInitialized();
    return await this.wrapper!.getQueuedDepositsCount(isDirectional);
  }
  
  /**
   * Get strike prices for directional vault
   */
  async getDirectionalStrikes(isCall: boolean): Promise<bigint[]> {
    this.ensureInitialized();
    return await this.wrapper!.getDirectionalStrikes(isCall);
  }
  
  /**
   * Get strike prices for condor vault
   */
  async getCondorStrikes(): Promise<bigint[]> {
    this.ensureInitialized();
    return await this.wrapper!.getCondorStrikes();
  }
  
  /**
   * Get current price from vault's oracle
   */
  async getCurrentPrice(isCall: boolean): Promise<bigint> {
    this.ensureInitialized();
    return await this.wrapper!.getCurrentPrice(isCall);
  }
  
  /**
   * Calculate number of contracts for a directional deposit
   */
  async calculateDirectionalContracts(amount: string, isCall: boolean): Promise<{
    contracts: bigint;
    strikes: bigint[];
  }> {
    this.ensureInitialized();
    const [contracts, strikes] = await this.wrapper!.calculateDirectionalContracts(amount, isCall);
    return { contracts, strikes };
  }
  
  /**
   * Calculate number of contracts for a condor deposit
   */
  async calculateCondorContracts(amount: string): Promise<{
    contracts: bigint;
    strikes: bigint[];
  }> {
    this.ensureInitialized();
    const [contracts, strikes] = await this.wrapper!.calculateCondorContracts(amount);
    return { contracts, strikes };
  }
  
  /**
   * Get addresses for current chain
   */
  private getAddresses() {
    if (!this.chainId) {
      throw new Error("Chain ID not available");
    }
    
    switch (this.chainId) {
      case SUPPORTED_CHAINS.BASE_MAINNET:
        return CONTRACT_ADDRESSES.BASE;
      default:
        throw new Error(`Unsupported chain ID: ${this.chainId}`);
    }
  }
}

// No longer necessary since we're initializing directly in the hook
export { }
