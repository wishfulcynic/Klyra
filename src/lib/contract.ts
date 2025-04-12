import { ethers } from "ethers"
import { VaultType } from "./types"

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
    WRAPPER: "0x018d72520F114CFe7528ea5876A42C8B2499127A", // Updated with latest deployment
    SUSDS: "0x820C137fa70C8691f0e44Dc420a5e53c168921Dc", // sUSDS on Base - Updated
    CALL_VAULT: "0x8E7A90F13e3720C5415E621e9Db68B79b1a0cc39", // Updated
    PUT_VAULT: "0xA49b907734aF657c59Bdee11623eE45d3644399e", // Updated
    CONDOR_VAULT: "0x82eD817EDd587b466D7dFAb08A759B7870812fF7", // Updated
  }
};

// Network information
export const SUPPORTED_CHAINS = {
  BASE_MAINNET: 8453,
  // Add more chains as needed
};

// Commenting out unused RPC_URL and helper functions
/*
// Example RPC URL - Replace with your actual provider URL
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key';

// Helper function to get contract instance
export async function getContract(needSigner = false) {
  try {
    let provider: ethers.Provider | ethers.Signer = new ethers.JsonRpcProvider(RPC_URL);
    let signer: ethers.Signer | null = null;

    if (needSigner && typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      signer = await browserProvider.getSigner();
      provider = signer;
    } else if (needSigner) {
      console.warn("Signer requested, but window.ethereum is not available.");
      // Fallback or throw error depending on requirements
      // For now, just return provider without signer
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
    let provider: ethers.Provider | ethers.Signer = new ethers.JsonRpcProvider(RPC_URL);
    let signer: ethers.Signer | null = null;

    if (needSigner && typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      signer = await browserProvider.getSigner();
      provider = signer;
    } else if (needSigner) {
      console.warn("Signer requested, but window.ethereum is not available.");
    }

    // Use a basic ERC20 ABI for the stable token
    const erc20Abi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)"
    ];
    const addresses = CONTRACT_ADDRESSES.BASE;
    return new ethers.Contract(addresses.SUSDS, erc20Abi, signer || provider);
  } catch (error) {
    console.error("Failed to get stable token contract:", error);
    return null;
  }
}
*/

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
  "constructor(address stableTokenAddress, address _directionalCallVault, address _directionalPutVault, address _condorVault)",
  "function stableToken() view returns (address)",
  "function directionalCallVault() view returns (address)",
  "function directionalPutVault() view returns (address)",
  "function condorVault() view returns (address)",
  "function maxCapacity() view returns (uint256)",
  "function callVaultCapacity() view returns (uint256)",
  "function putVaultCapacity() view returns (uint256)",
  "function condorVaultCapacity() view returns (uint256)",
  "function updatePerformanceMetrics() external",
  "function updateCycleInfo() external",
  "function getSharePrice(bool isDirectional, bool isCall) public view returns (uint256)",
  "function getTotalValueLocked() public view returns (uint256)",
  "function getRemainingCapacity() external view returns (uint256 overallRemaining, uint256 callRemaining, uint256 putRemaining, uint256 condorRemaining)",
  "function getPerformanceMetrics(bool isDirectional, bool isCall) external view returns (uint256 apy, uint256 successRate, uint256 bestReturn, uint256 avgYield)",
  "function getQueuedDepositsCount(bool isDirectional) external view returns (uint256)",
  "function processQueuedDeposits(bool isDirectional, uint256 batchSize) external returns (uint256 processed)",
  "function claimProfits(bool isDirectional, bool isCall) external returns (uint256 claimedAmount)",
  "function depositDirectional(uint256 amount, bool isCall) external",
  "function depositCondor(uint256 amount) external",
  "function withdrawDirectional(uint256 shares, bool isCall) external returns (uint256 returnedAssets)",
  "function withdrawCondor(uint256 shares) external returns (uint256 returnedAssets)",
  "function setCapacityLimits(uint256 _maxCapacity, uint256 _callCapacity, uint256 _putCapacity, uint256 _condorCapacity) external",
  "function rescueTokens(address tokenAddress, address recipient) external",
  "event DirectionalDeposit(address indexed user, uint256 amount, bool isCall)",
  "event CondorDeposit(address indexed user, uint256 amount)",
  "event DirectionalWithdrawal(address indexed user, uint256 shares, uint256 returnedAssets, bool isCall)",
  "event CondorWithdrawal(address indexed user, uint256 shares, uint256 returnedAssets)",
  "event CapacityLimitsUpdated(uint256 maxCapacity, uint256 callCapacity, uint256 putCapacity, uint256 condorCapacity)",
  "event CycleUpdated(bool isCall, uint256 startTime, uint256 endTime, uint256 nextExpiry)",
  "event PerformanceUpdated(bool isDirectional, bool isCall, uint256 apy, uint256 successRate)",
  "event ProfitsClaimed(address indexed user, uint256 claimedAmount, bool isDirectional, bool isCall)",
  
  // Added vaultCycles getter signature
  "function vaultCycles(bool) external view returns (uint256 startTime, uint256 endTime, bool active, uint256 nextExpiryTimestamp)",
  
  // Added Condor expiry getter
  "function condorNextExpiryTimestamp() external view returns (uint256)"
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (event: string, handler: (...args: any[]) => void) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

console.log("RPC URL Used:", process.env.NEXT_PUBLIC_BASE_RPC_URL); // DEBUG LINE
const readProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL || '');

/**
 * Wrapper class for interacting with the Strategy Vault Wrapper contract
 */
export class StrategyVaultWrapper {
  // Wrapper Contracts
  wrapper: ethers.Contract | null = null;
  readWrapper: ethers.Contract | null = null; 
  
  // Token Contracts
  susdsToken: ethers.Contract | null = null;
  readSusdsToken: ethers.Contract | null = null; 

  // Vault Contracts (Read/Write & Read-Only)
  callVault: ethers.Contract | null = null;
  putVault: ethers.Contract | null = null;
  condorVault: ethers.Contract | null = null;
  readCallVault: ethers.Contract | null = null;
  readPutVault: ethers.Contract | null = null;
  readCondorVault: ethers.Contract | null = null;

  private provider: ethers.BrowserProvider | null = null;
  private chainId: number | null = null;
  
  /**
   * Initialize contracts - must be called before using any other methods
   */
  async init(userAddress?: string): Promise<void> {
    try {
      // Always initialize read-only contracts using the RPC URL
      const addresses = this.getAddressesForChain(SUPPORTED_CHAINS.BASE_MAINNET); // Assuming Base Mainnet for reads
      
      this.readWrapper = new ethers.Contract(
        addresses.WRAPPER,
        STRATEGY_VAULT_WRAPPER_ABI,
        readProvider
      );
      this.readSusdsToken = new ethers.Contract(
        addresses.SUSDS,
        ERC20_ABI,
        readProvider
      );
      // Init read-only vault instances
      this.readCallVault = new ethers.Contract(addresses.CALL_VAULT, ERC20_ABI, readProvider);
      this.readPutVault = new ethers.Contract(addresses.PUT_VAULT, ERC20_ABI, readProvider);
      this.readCondorVault = new ethers.Contract(addresses.CONDOR_VAULT, ERC20_ABI, readProvider);

      // Initialize write contracts only if wallet is connected
      if (window.ethereum && userAddress) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();

        const signerAddress = await signer.getAddress();
        if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
          console.warn("Signer address doesn't match connected wallet, write operations might fail.");
        }

        const network = await this.provider.getNetwork();
        this.chainId = Number(network.chainId);

        // Use the correct addresses based on connected chain
        const connectedAddresses = this.getAddressesForChain(this.chainId);

        // Init write wrapper & token instances
        this.wrapper = new ethers.Contract(
          connectedAddresses.WRAPPER,
          STRATEGY_VAULT_WRAPPER_ABI,
          signer
        );
        this.susdsToken = new ethers.Contract(
          connectedAddresses.SUSDS,
          ERC20_ABI,
          signer
        );
        // Init write vault instances
        this.callVault = new ethers.Contract(connectedAddresses.CALL_VAULT, ERC20_ABI, signer);
        this.putVault = new ethers.Contract(connectedAddresses.PUT_VAULT, ERC20_ABI, signer);
        this.condorVault = new ethers.Contract(connectedAddresses.CONDOR_VAULT, ERC20_ABI, signer);

      } else {
        // Not connected, clear write instances
        this.provider = null;
        this.wrapper = null;
        this.susdsToken = null;
        this.callVault = null;
        this.putVault = null;
        this.condorVault = null;
        this.chainId = null; 
        console.log("Wallet not connected, initializing read-only contracts only.")
      }
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      // Clear all instances on error
      this.provider = null;
      this.wrapper = null;
      this.susdsToken = null;
      this.readWrapper = null;
      this.readSusdsToken = null;
      this.callVault = null;
      this.putVault = null;
      this.condorVault = null;
      this.readCallVault = null;
      this.readPutVault = null;
      this.readCondorVault = null;
      this.chainId = null;
      throw error;
    }
  }
  
  /**
   * Check if write contracts are initialized (wallet connected)
   */
  private ensureWriteInitialized(): void {
    // Check all write instances
    if (!this.wrapper || !this.susdsToken || !this.provider || !this.callVault || !this.putVault || !this.condorVault) {
      throw new Error("Wallet not connected or contracts not initialized for writing. Call init() with address.");
    }
  }
  
  /**
   * Check if read contracts are initialized
   */
  private ensureReadInitialized(): void {
     // Check all read instances
    if (!this.readWrapper || !this.readSusdsToken || !this.readCallVault || !this.readPutVault || !this.readCondorVault) {
      throw new Error("Read contracts not initialized. Ensure init() has been called.");
    }
  }
  
  /**
   * Approve the wrapper to spend tokens (Requires Wallet Connection)
   */
  async approveSusds(amount: string): Promise<ethers.TransactionResponse> {
    this.ensureWriteInitialized();
    const addresses = this.getAddresses(); // Uses connected chainId
    return await this.susdsToken!.approve(addresses.WRAPPER, amount) as ethers.TransactionResponse;
  }
  
  /**
   * Check if the wrapper has sufficient allowance (Uses Read RPC)
   */
  async checkAllowance(userAddress: string): Promise<boolean> {
    this.ensureReadInitialized();
    const addresses = this.getAddressesForChain(SUPPORTED_CHAINS.BASE_MAINNET); // Use default chain for reads
    const allowance = await this.readSusdsToken!.allowance(userAddress, addresses.WRAPPER);
    const half = BigInt(ethers.MaxUint256) / BigInt(2);
    return allowance >= half;
  }
  
  /**
   * Get user sUSDS balance (Uses Read RPC)
   */
   async getSusdsBalance(userAddress: string): Promise<bigint> {
     this.ensureReadInitialized();
     return await this.readSusdsToken!.balanceOf(userAddress);
   }
  
  /**
   * Deposit into directional vault (Requires Wallet Connection)
   */
  async depositDirectional(amount: string, isCall: boolean): Promise<ethers.TransactionResponse> {
    this.ensureWriteInitialized();
    return await this.wrapper!.depositDirectional(amount, isCall) as ethers.TransactionResponse;
  }
  
  /**
   * Deposit into condor vault (Requires Wallet Connection)
   */
  async depositCondor(amount: string): Promise<ethers.TransactionResponse> {
    this.ensureWriteInitialized();
    return await this.wrapper!.depositCondor(amount) as ethers.TransactionResponse;
  }
  
  /**
   * Withdraw from directional vault (Requires Wallet Connection)
   */
  async withdrawDirectional(shareAmount: string, isCall: boolean): Promise<ethers.TransactionResponse> {
    this.ensureWriteInitialized();
    return await this.wrapper!.withdrawDirectional(shareAmount, isCall) as ethers.TransactionResponse;
  }
  
  /**
   * Withdraw from condor vault (Requires Wallet Connection)
   */
  async withdrawCondor(shareAmount: string): Promise<ethers.TransactionResponse> {
    this.ensureWriteInitialized();
    return await this.wrapper!.withdrawCondor(shareAmount) as ethers.TransactionResponse;
  }
  
  /**
   * Claim profits from a vault (Requires Wallet Connection)
   */
  async claimProfits(isDirectional: boolean, isCall: boolean): Promise<ethers.TransactionResponse> {
    this.ensureWriteInitialized();
    return await this.wrapper!.claimProfits(isDirectional, isCall) as ethers.TransactionResponse;
  }
  
  /**
   * Get performance metrics for a vault (Uses Read RPC)
   */
  async getPerformanceMetrics(isDirectional: boolean, isCall: boolean): Promise<{ 
    apy: bigint;
    successRate: bigint;
    bestReturn: bigint;
    avgYield: bigint;
  }> {
    this.ensureReadInitialized();
    const [apy, successRate, bestReturn, avgYield] = await this.readWrapper!.getPerformanceMetrics(isDirectional, isCall);
    return { apy, successRate, bestReturn, avgYield };
  }
  
  /**
   * Get share price for a vault (Uses Read RPC)
   */
  async getSharePrice(isDirectional: boolean, isCall: boolean): Promise<bigint> {
    this.ensureReadInitialized();
    return await this.readWrapper!.getSharePrice(isDirectional, isCall);
  }
  
  /**
   * Get remaining capacity for vaults (Uses Read RPC)
   */
  async getRemainingCapacity(): Promise<{
    overall: bigint;
    call: bigint;
    put: bigint;
    condor: bigint;
  }> {
    this.ensureReadInitialized();
    const [overall, call, put, condor] = await this.readWrapper!.getRemainingCapacity();
    return { overall, call, put, condor };
  }
  
  /**
   * Get total value locked across all vaults (Uses Read RPC)
   */
  async getTotalValueLocked(): Promise<bigint> {
    this.ensureReadInitialized();
    return await this.readWrapper!.getTotalValueLocked();
  }
  
  /**
   * Get number of queued deposits (Uses Read RPC)
   */
  async getQueuedDepositsCount(isDirectional: boolean): Promise<bigint> {
    this.ensureReadInitialized();
    return await this.readWrapper!.getQueuedDepositsCount(isDirectional);
  }
  
  /**
   * Get strike prices for directional vault (Uses Read RPC)
   */
  async getDirectionalStrikes(isCall: boolean): Promise<bigint[]> {
    this.ensureReadInitialized();
    return await this.readWrapper!.getDirectionalStrikes(isCall);
  }
  
  /**
   * Get strike prices for condor vault (Uses Read RPC)
   */
  async getCondorStrikes(): Promise<bigint[]> {
    this.ensureReadInitialized();
    return await this.readWrapper!.getCondorStrikes();
  }
  
  /**
   * Get current price from vault's oracle (Uses Read RPC)
   */
  async getCurrentPrice(isCall: boolean): Promise<bigint> {
    this.ensureReadInitialized();
    return await this.readWrapper!.getCurrentPrice(isCall);
  }
  
  /**
   * Calculate number of contracts for a directional deposit (Uses Read RPC)
   */
  async calculateDirectionalContracts(amount: string, isCall: boolean): Promise<{
    contracts: bigint;
    strikes: bigint[];
  }> {
    this.ensureReadInitialized();
    const [contracts, strikes] = await this.readWrapper!.calculateDirectionalContracts(amount, isCall);
    return { contracts, strikes };
  }
  
  /**
   * Calculate number of contracts for a condor deposit (Uses Read RPC)
   */
  async calculateCondorContracts(amount: string): Promise<{
    contracts: bigint;
    strikes: bigint[];
  }> {
    this.ensureReadInitialized();
    const [contracts, strikes] = await this.readWrapper!.calculateCondorContracts(amount);
    return { contracts, strikes };
  }
  
  /**
   * Get addresses based on the connected chainId
   */
  private getAddresses() {
    if (!this.chainId) {
      // Attempt to get chain ID if not connected, fallback to default (Base Mainnet)
      console.warn("Wallet not connected, using default addresses for Base Mainnet");
      return this.getAddressesForChain(SUPPORTED_CHAINS.BASE_MAINNET);
    }
    return this.getAddressesForChain(this.chainId);
  }
  
  /**
   * Get addresses for a specific chain ID
   */
  private getAddressesForChain(chainId: number | null) {
     const targetChainId = chainId ?? SUPPORTED_CHAINS.BASE_MAINNET; // Default to Base Mainnet if null
     switch (targetChainId) {
       case SUPPORTED_CHAINS.BASE_MAINNET:
         return CONTRACT_ADDRESSES.BASE;
       // Add other supported chains here if needed
       // case SUPPORTED_CHAINS.BASE_SEPOLIA:
       //   return CONTRACT_ADDRESSES.BASE_SEPOLIA;
       default:
         console.error(`Unsupported chain ID: ${targetChainId}, falling back to Base Mainnet`);
         return CONTRACT_ADDRESSES.BASE; // Fallback
     }
   }

  /**
   * Get user vault share balance (Uses Read RPC)
   */
   async getVaultShares(vaultType: VaultType, isCall: boolean | null, userAddress: string): Promise<bigint> {
     this.ensureReadInitialized();
     if (vaultType === VaultType.DIRECTIONAL) {
        if (isCall === true && this.readCallVault) { 
           return await this.readCallVault.balanceOf(userAddress);
        } else if (isCall === false && this.readPutVault) {
           return await this.readPutVault.balanceOf(userAddress);
        }
     } else if (vaultType === VaultType.RANGEBOUND && this.readCondorVault) {
        return await this.readCondorVault.balanceOf(userAddress);
     }
     console.warn(`Could not get shares for vaultType: ${vaultType}, isCall: ${isCall}`);
     return BigInt(0); // Return 0 if vault instance not found
   }
}

// No longer necessary since we're initializing directly in the hook
export { }
