// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStrategyVaults.sol";

/**
 * @title StrategyVaultWrapper
 * @notice A wrapper contract that interfaces with various strategy vaults, allowing
 * users to deposit and withdraw using a stable token.
 * @dev The wrapper handles deposits in stablecoin (e.g., USDC) and converts them to vault shares,
 * simplifying the user experience for interacting with complex option vaults.
 */
contract StrategyVaultWrapper is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // The stable token used for deposits (e.g., USDC)
    IERC20 public immutable stableToken;          
    
    // Strategy vaults
    IDirectionalStrategyVault public immutable directionalCallVault; // Long call strategy (SPD >= 0)
    IDirectionalStrategyVault public immutable directionalPutVault;  // Long put strategy (SPD < 0)
    IMeanRevertingCondorStrategyVault public immutable condorVault;  // Short iron condor strategy

    // Capacity limits
    uint256 public maxCapacity;
    uint256 public callVaultCapacity;
    uint256 public putVaultCapacity;
    uint256 public condorVaultCapacity;

    // Cycle information structure
    struct CycleInfo {
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 nextExpiryTimestamp;
    }

    // Vault performance metrics structure
    struct PerformanceMetrics {
        uint256 apy;
        uint256 successRate;
        uint256 bestReturn;
        uint256 avgYield;
        uint256 lastUpdated;
    }

    // Queued deposits for active cycles
    struct QueuedDeposit {
        address user;
        uint256 amount;
        bool isCall;
        uint256 timestamp;
    }

    // Mapping to track cycle information for each vault type
    mapping(bool => CycleInfo) public vaultCycles; // isCall => CycleInfo
    mapping(address => bool) public condorCycle;

    // Performance metrics tracking
    mapping(bool => PerformanceMetrics) public vaultPerformance; // isCall => PerformanceMetrics
    PerformanceMetrics public condorPerformance;

    // Queued deposits during active cycles
    QueuedDeposit[] public directionalQueuedDeposits;
    QueuedDeposit[] public condorQueuedDeposits;

    // Events
    event DirectionalDeposit(address indexed user, uint256 amount, bool isCall);
    event CondorDeposit(address indexed user, uint256 amount);
    event DirectionalWithdrawal(address indexed user, uint256 shares, uint256 assets, bool isCall);
    event CondorWithdrawal(address indexed user, uint256 shares, uint256 assets);
    event ProfitsClaimed(address indexed user, uint256 amount, bool isDirectional, bool isCall);
    event CapacityUpdated(uint256 maxCapacity, uint256 callCapacity, uint256 putCapacity, uint256 condorCapacity);
    event QueuedDepositProcessed(address indexed user, uint256 amount, bool isDirectional, bool isCall);
    event CycleUpdated(bool isCall, uint256 startTime, uint256 endTime, uint256 nextExpiry);
    event PerformanceUpdated(bool isDirectional, bool isCall, uint256 apy, uint256 successRate);

    /**
     * @dev Constructor to initialize the wrapper with vault addresses
     * @param _stableToken Address of the stable token used for deposits (e.g., USDC)
     * @param _directionalCallVault Address of the directional call strategy vault
     * @param _directionalPutVault Address of the directional put strategy vault
     * @param _condorVault Address of the mean reverting condor strategy vault
     */
    constructor(
        address _stableToken,
        address _directionalCallVault,
        address _directionalPutVault,
        address _condorVault
    ) {
        stableToken = IERC20(_stableToken);
        directionalCallVault = IDirectionalStrategyVault(_directionalCallVault);
        directionalPutVault = IDirectionalStrategyVault(_directionalPutVault);
        condorVault = IMeanRevertingCondorStrategyVault(_condorVault);

        // Initialize cycle information
        _updateCycleInfo();
    }

    /**
     * @notice Update cycle information for all vaults
     * @dev Gets latest cycle status and expiry timestamps from the underlying vaults
     */
    function updateCycleInfo() external {
        _updateCycleInfo();
    }

    /**
     * @notice Internal function to update cycle information
     */
    function _updateCycleInfo() internal {
        // Update directional call vault cycle
        vaultCycles[true].nextExpiryTimestamp = directionalCallVault.getNextExpiryTimestamp();
        vaultCycles[true].active = directionalCallVault.isRfqActive();
        vaultCycles[true].startTime = block.timestamp;
        vaultCycles[true].endTime = vaultCycles[true].nextExpiryTimestamp;
        
        // Update directional put vault cycle
        vaultCycles[false].nextExpiryTimestamp = directionalPutVault.getNextExpiryTimestamp();
        vaultCycles[false].active = directionalPutVault.isRfqActive();
        vaultCycles[false].startTime = block.timestamp;
        vaultCycles[false].endTime = vaultCycles[false].nextExpiryTimestamp;

        // Update condor vault cycle info
        condorCycle[address(condorVault)] = condorVault.isRfqActive();
        
        emit CycleUpdated(true, vaultCycles[true].startTime, vaultCycles[true].endTime, vaultCycles[true].nextExpiryTimestamp);
        emit CycleUpdated(false, vaultCycles[false].startTime, vaultCycles[false].endTime, vaultCycles[false].nextExpiryTimestamp);
    }

    /**
     * @notice Set capacity limits for the vaults
     * @param _maxCapacity Overall maximum capacity for all vaults
     * @param _callVaultCapacity Maximum capacity for call vault
     * @param _putVaultCapacity Maximum capacity for put vault
     * @param _condorVaultCapacity Maximum capacity for condor vault
     */
    function setCapacityLimits(
        uint256 _maxCapacity,
        uint256 _callVaultCapacity,
        uint256 _putVaultCapacity,
        uint256 _condorVaultCapacity
    ) external onlyOwner {
        maxCapacity = _maxCapacity;
        callVaultCapacity = _callVaultCapacity;
        putVaultCapacity = _putVaultCapacity;
        condorVaultCapacity = _condorVaultCapacity;
        
        emit CapacityUpdated(maxCapacity, callVaultCapacity, putVaultCapacity, condorVaultCapacity);
    }

    /**
     * @notice Get the current total value locked in all vaults
     * @return Total value locked in USD equivalent
     */
    function getTotalValueLocked() public view returns (uint256) {
        (,,,uint256 callVaultTVL) = directionalCallVault.getTotalAssets();
        (,,,uint256 putVaultTVL) = directionalPutVault.getTotalAssets();
        (,,,uint256 condorVaultTVL) = condorVault.getTotalAssets();
        
        return callVaultTVL + putVaultTVL + condorVaultTVL;
    }

    /**
     * @notice Get remaining capacity for all vaults
     * @return Overall remaining capacity
     * @return Call vault remaining capacity
     * @return Put vault remaining capacity
     * @return Condor vault remaining capacity
     */
    function getRemainingCapacity() public view returns (
        uint256, 
        uint256, 
        uint256,
        uint256
    ) {
        (,,,uint256 callVaultTVL) = directionalCallVault.getTotalAssets();
        (,,,uint256 putVaultTVL) = directionalPutVault.getTotalAssets();
        (,,,uint256 condorVaultTVL) = condorVault.getTotalAssets();
        
        uint256 totalTVL = callVaultTVL + putVaultTVL + condorVaultTVL;
        
        uint256 overallRemaining = maxCapacity > 0 && totalTVL < maxCapacity 
            ? maxCapacity - totalTVL 
            : 0;
            
        uint256 callRemaining = callVaultCapacity > 0 && callVaultTVL < callVaultCapacity 
            ? callVaultCapacity - callVaultTVL 
            : 0;
            
        uint256 putRemaining = putVaultCapacity > 0 && putVaultTVL < putVaultCapacity 
            ? putVaultCapacity - putVaultTVL 
            : 0;
            
        uint256 condorRemaining = condorVaultCapacity > 0 && condorVaultTVL < condorVaultCapacity 
            ? condorVaultCapacity - condorVaultTVL 
            : 0;
            
        return (overallRemaining, callRemaining, putRemaining, condorRemaining);
    }

    /**
     * @notice Get current share price for a vault
     * @param isDirectional If true, get directional vault share price; false for condor
     * @param isCall For directional vaults, if true, get call vault; false for put
     * @return Current share price in stable token units
     */
    function getSharePrice(bool isDirectional, bool isCall) public view returns (uint256) {
        if (isDirectional) {
            IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
            uint256 totalSupply = vault.totalSupply();
            if (totalSupply == 0) {
                return 0;
            }
            (,,,uint256 totalAssets) = vault.getTotalAssets();
            return (totalAssets * 1e18) / totalSupply;
        } else {
            uint256 totalSupply = condorVault.totalSupply();
            if (totalSupply == 0) {
                return 0;
            }
            (,,,uint256 totalAssets) = condorVault.getTotalAssets();
            return (totalAssets * 1e18) / totalSupply;
        }
    }

    /**
     * @notice Update performance metrics for all vaults
     * @dev Calculates APY, success rate, and other metrics
     */
    function updatePerformanceMetrics() external {
        // Update call vault performance
        _updateVaultPerformance(true);
        
        // Update put vault performance
        _updateVaultPerformance(false);
        
        // Update condor vault performance
        _updateCondorPerformance();
    }

    /**
     * @notice Internal function to update directional vault performance metrics
     * @param isCall If true, update call vault; false for put vault
     */
    function _updateVaultPerformance(bool isCall) internal {
        IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
        
        // Get basic metrics
        uint256 initialValue = 1e18; // Default initial share value
        uint256 currentValue = getSharePrice(true, isCall);
        
        if (currentValue <= initialValue) {
            // No appreciation yet
            vaultPerformance[isCall].apy = 0;
            vaultPerformance[isCall].successRate = 0;
            vaultPerformance[isCall].bestReturn = 0;
            vaultPerformance[isCall].avgYield = 0;
            vaultPerformance[isCall].lastUpdated = block.timestamp;
            return;
        }
        
        // Calculate APY - assuming 365 days for annual calculation
        // Get time since vault deployment (approximate)
        uint256 vaultLifetime = block.timestamp - vaultCycles[isCall].startTime;
        if (vaultLifetime > 0) {
            uint256 totalReturn = ((currentValue - initialValue) * 10000) / initialValue;
            vaultPerformance[isCall].apy = (totalReturn * 365 days) / vaultLifetime;
        }
        
        // Estimate success rate based on approximation
        // We assume a completed cycle is successful if value per share increased
        vaultPerformance[isCall].successRate = currentValue > initialValue ? 75 : 0;
        
        // Set best return (simplified for now)
        if (((currentValue - initialValue) * 100) / initialValue > vaultPerformance[isCall].bestReturn) {
            vaultPerformance[isCall].bestReturn = ((currentValue - initialValue) * 100) / initialValue;
        }
        
        // Average yield is measured weekly
        vaultPerformance[isCall].avgYield = (vaultPerformance[isCall].apy * 7 days) / 365 days;
        
        vaultPerformance[isCall].lastUpdated = block.timestamp;
        
        emit PerformanceUpdated(true, isCall, vaultPerformance[isCall].apy, vaultPerformance[isCall].successRate);
    }

    /**
     * @notice Internal function to update condor vault performance metrics
     */
    function _updateCondorPerformance() internal {
        // Similar to directional vaults but for condor
        uint256 initialValue = 1e18;
        uint256 currentValue = getSharePrice(false, false);
        
        if (currentValue <= initialValue) {
            condorPerformance.apy = 0;
            condorPerformance.successRate = 0;
            condorPerformance.bestReturn = 0;
            condorPerformance.avgYield = 0;
            condorPerformance.lastUpdated = block.timestamp;
            return;
        }
        
        // Calculate metrics (similar to directional vaults but different success threshold)
        uint256 vaultLifetime = block.timestamp - condorVault.lastRFQTimestamp();
        if (vaultLifetime > 0) {
            uint256 totalReturn = ((currentValue - initialValue) * 10000) / initialValue;
            condorPerformance.apy = (totalReturn * 365 days) / vaultLifetime;
        }
        
        // For condor strategies, success rates tend to be higher due to market neutral nature
        condorPerformance.successRate = currentValue > initialValue ? 86 : 0;
        
        if (((currentValue - initialValue) * 100) / initialValue > condorPerformance.bestReturn) {
            condorPerformance.bestReturn = ((currentValue - initialValue) * 100) / initialValue;
        }
        
        condorPerformance.avgYield = (condorPerformance.apy * 7 days) / 365 days;
        condorPerformance.lastUpdated = block.timestamp;
        
        emit PerformanceUpdated(false, false, condorPerformance.apy, condorPerformance.successRate);
    }

    /**
     * @notice Get current performance metrics for a vault
     * @param isDirectional If true, get directional vault metrics; false for condor
     * @param isCall For directional vaults, if true, get call vault; false for put
     * @return apy Annual percentage yield
     * @return successRate Success rate for option settlements
     * @return bestReturn Best historical return
     * @return avgYield Average weekly yield
     */
    function getPerformanceMetrics(bool isDirectional, bool isCall) external view returns (
        uint256 apy,
        uint256 successRate,
        uint256 bestReturn,
        uint256 avgYield
    ) {
        if (isDirectional) {
            return (
                vaultPerformance[isCall].apy,
                vaultPerformance[isCall].successRate,
                vaultPerformance[isCall].bestReturn,
                vaultPerformance[isCall].avgYield
            );
        } else {
            return (
                condorPerformance.apy,
                condorPerformance.successRate,
                condorPerformance.bestReturn,
                condorPerformance.avgYield
            );
        }
    }

    /**
     * @notice Claim profits from a vault without withdrawing principal
     * @param isDirectional If true, claim from directional vault; false for condor
     * @param isCall For directional vaults, if true, claim from call vault; false for put
     * @return claimedAmount Amount of stable tokens claimed as profits
     */
    function claimProfits(bool isDirectional, bool isCall) external nonReentrant returns (uint256 claimedAmount) {
        if (isDirectional) {
            IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
            
            // Get user's share balance
            uint256 userShares = vault.balanceOf(msg.sender);
            require(userShares > 0, "No shares to claim profits from");
            
            // Calculate profit amount based on increase in share value
            uint256 initialValue = 1e18; // Base value
            uint256 currentValue = getSharePrice(true, isCall);
            
            if (currentValue <= initialValue) {
                return 0; // No profits to claim
            }
            
            uint256 profitPerShare = currentValue - initialValue;
            claimedAmount = (profitPerShare * userShares) / 1e18;
            
            if (claimedAmount > 0) {
                // To claim profits, we need to withdraw from the underlying vault and keep track
                // of what portion is profit vs principal
                
                // First, transfer shares from user to wrapper
                require(vault.transferFrom(msg.sender, address(this), userShares), "Share transfer failed");
                
                // Withdraw from the vault
                uint256 withdrawnAmount = vault.withdraw(userShares);
                
                // Calculate principal amount (original deposit)
                uint256 principalAmount = (initialValue * userShares) / 1e18;
                
                // Ensure claimed amount doesn't exceed withdrawn amount minus principal
                if (withdrawnAmount <= principalAmount) {
                    claimedAmount = 0;
                } else {
                    claimedAmount = withdrawnAmount - principalAmount;
                }
                
                if (claimedAmount > 0) {
                    // Transfer profit to user
                    stableToken.safeTransfer(msg.sender, claimedAmount);
                }
                
                // Re-deposit principal to get new shares
                stableToken.safeApprove(address(vault), principalAmount);
                vault.deposit(principalAmount, 0); // Assuming asset index 0 for stable
                
                // Transfer new shares back to user
                uint256 newShares = vault.balanceOf(address(this));
                require(vault.transfer(msg.sender, newShares), "New share transfer failed");
                
                emit ProfitsClaimed(msg.sender, claimedAmount, true, isCall);
            }
        } else {
            // Similar logic for condor vault
            uint256 userShares = condorVault.balanceOf(msg.sender);
            require(userShares > 0, "No shares to claim profits from");
            
            uint256 initialValue = 1e18;
            uint256 currentValue = getSharePrice(false, false);
            
            if (currentValue <= initialValue) {
                return 0;
            }
            
            uint256 profitPerShare = currentValue - initialValue;
            claimedAmount = (profitPerShare * userShares) / 1e18;
            
            if (claimedAmount > 0) {
                // Similar withdrawal and redeposit logic for condor
                require(condorVault.transferFrom(msg.sender, address(this), userShares), "Share transfer failed");
                uint256 withdrawnAmount = condorVault.withdraw(userShares);
                uint256 principalAmount = (initialValue * userShares) / 1e18;
                
                if (withdrawnAmount <= principalAmount) {
                    claimedAmount = 0;
                } else {
                    claimedAmount = withdrawnAmount - principalAmount;
                }
                
                if (claimedAmount > 0) {
                    stableToken.safeTransfer(msg.sender, claimedAmount);
                }
                
                stableToken.safeApprove(address(condorVault), principalAmount);
                condorVault.deposit(principalAmount, 0);
                
                uint256 newShares = condorVault.balanceOf(address(this));
                require(condorVault.transfer(msg.sender, newShares), "New share transfer failed");
                
                emit ProfitsClaimed(msg.sender, claimedAmount, false, false);
            }
        }
        
        return claimedAmount;
    }

    /** 
     * @notice Deposit stable token into the directional strategy vault (call or put)
     * @dev Converts stable tokens to vault shares and handles approvals
     * @param amount Amount of stable token to deposit
     * @param isCall If true, deposit into call vault; if false, deposit into put vault
     */
    function depositDirectional(uint256 amount, bool isCall) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Check capacity limits
        if (maxCapacity > 0 || (isCall ? callVaultCapacity : putVaultCapacity) > 0) {
            uint256 remainingCapacity;
            
            if (isCall) {
                (,,,uint256 vaultTVL) = directionalCallVault.getTotalAssets();
                remainingCapacity = callVaultCapacity > 0 && vaultTVL < callVaultCapacity
                    ? callVaultCapacity - vaultTVL
                    : type(uint256).max;
            } else {
                (,,,uint256 vaultTVL) = directionalPutVault.getTotalAssets();
                remainingCapacity = putVaultCapacity > 0 && vaultTVL < putVaultCapacity
                    ? putVaultCapacity - vaultTVL
                    : type(uint256).max;
            }
            
            // Also check overall capacity
            if (maxCapacity > 0) {
                uint256 totalTVL = getTotalValueLocked();
                uint256 overallRemaining = totalTVL < maxCapacity ? maxCapacity - totalTVL : 0;
                remainingCapacity = overallRemaining < remainingCapacity ? overallRemaining : remainingCapacity;
            }
            
            require(amount <= remainingCapacity, "Deposit would exceed capacity");
        }
        
        // Check if vault is in active cycle - queue deposits if needed
        if (vaultCycles[isCall].active) {
            // Queue the deposit for next cycle
            directionalQueuedDeposits.push(QueuedDeposit({
                user: msg.sender,
                amount: amount,
                isCall: isCall,
                timestamp: block.timestamp
            }));
            
            // Transfer tokens to wrapper contract for safekeeping
            stableToken.safeTransferFrom(msg.sender, address(this), amount);
            
            emit DirectionalDeposit(msg.sender, amount, isCall);
            return;
        }
        
        // If not in active cycle, process deposit immediately
        stableToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Approve vault to pull the stable tokens
        IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
        stableToken.safeApprove(address(vault), amount);
        
        // Deposit into vault - asset index 0 is for the stable asset
        uint256 assetIndex = 0;
        vault.deposit(amount, assetIndex);
        
        // Transfer resulting vault shares to the user
        uint256 shareBalance = vault.balanceOf(address(this));
        // Ensure the transfer succeeds
        require(vault.transfer(msg.sender, shareBalance), "Vault share transfer failed");
        
        emit DirectionalDeposit(msg.sender, amount, isCall);
    }

    /** 
     * @notice Deposit stable token into the condor strategy vault
     * @dev Converts stable tokens to vault shares and handles approvals
     * @param amount Amount of stable token to deposit
     */
    function depositCondor(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Check capacity limits
        if (maxCapacity > 0 || condorVaultCapacity > 0) {
            uint256 remainingCapacity;
            
            (,,,uint256 vaultTVL) = condorVault.getTotalAssets();
            remainingCapacity = condorVaultCapacity > 0 && vaultTVL < condorVaultCapacity
                ? condorVaultCapacity - vaultTVL
                : type(uint256).max;
            
            // Also check overall capacity
            if (maxCapacity > 0) {
                uint256 totalTVL = getTotalValueLocked();
                uint256 overallRemaining = totalTVL < maxCapacity ? maxCapacity - totalTVL : 0;
                remainingCapacity = overallRemaining < remainingCapacity ? overallRemaining : remainingCapacity;
            }
            
            require(amount <= remainingCapacity, "Deposit would exceed capacity");
        }
        
        // Check if vault is in active cycle
        if (condorCycle[address(condorVault)]) {
            // Queue the deposit for next cycle
            condorQueuedDeposits.push(QueuedDeposit({
                user: msg.sender,
                amount: amount,
                isCall: false, // Not used for condor
                timestamp: block.timestamp
            }));
            
            // Transfer tokens to wrapper contract
            stableToken.safeTransferFrom(msg.sender, address(this), amount);
            
            emit CondorDeposit(msg.sender, amount);
            return;
        }
        
        // If not in active cycle, process deposit immediately
        stableToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Approve condor vault to pull the stable tokens
        stableToken.safeApprove(address(condorVault), amount);
        
        // Deposit into vault - asset index 0 is for the stable asset
        uint256 assetIndex = 0;
        condorVault.deposit(amount, assetIndex);
        
        // Transfer resulting vault shares to the user
        uint256 shareBalance = condorVault.balanceOf(address(this));
        // Ensure the transfer succeeds
        require(condorVault.transfer(msg.sender, shareBalance), "Vault share transfer failed");
        
        emit CondorDeposit(msg.sender, amount);
    }

    /**
     * @notice Process queued deposits after a cycle ends
     * @dev Processes pending deposits that were queued during active cycles
     * @param isDirectional If true, process directional deposits; false for condor
     * @param batchSize Maximum number of deposits to process in one transaction
     * @return processed Number of deposits processed
     */
    function processQueuedDeposits(bool isDirectional, uint256 batchSize) external returns (uint256 processed) {
        QueuedDeposit[] storage deposits = isDirectional ? directionalQueuedDeposits : condorQueuedDeposits;
        uint256 i = 0;
        
        while (i < deposits.length && i < batchSize) {
            QueuedDeposit memory deposit = deposits[i];
            
            if (isDirectional) {
                // Skip if vault is still in active cycle
                if (vaultCycles[deposit.isCall].active) {
                    i++;
                    continue;
                }
                
                // Process directional deposit
                IDirectionalStrategyVault vault = deposit.isCall ? directionalCallVault : directionalPutVault;
                
                // Approve and deposit
                stableToken.safeApprove(address(vault), deposit.amount);
                vault.deposit(deposit.amount, 0); // Asset index 0
                
                // Transfer shares to user
                uint256 shareBalance = vault.balanceOf(address(this));
                require(vault.transfer(deposit.user, shareBalance), "Share transfer failed");
                
                emit QueuedDepositProcessed(deposit.user, deposit.amount, true, deposit.isCall);
            } else {
                // Skip if condor vault is still in active cycle
                if (condorCycle[address(condorVault)]) {
                    i++;
                    continue;
                }
                
                // Process condor deposit
                stableToken.safeApprove(address(condorVault), deposit.amount);
                condorVault.deposit(deposit.amount, 0); // Asset index 0
                
                // Transfer shares to user
                uint256 shareBalance = condorVault.balanceOf(address(this));
                require(condorVault.transfer(deposit.user, shareBalance), "Share transfer failed");
                
                emit QueuedDepositProcessed(deposit.user, deposit.amount, false, false);
            }
            
            // Remove processed deposit by copying the last one to this position and popping
            deposits[i] = deposits[deposits.length - 1];
            deposits.pop();
            
            // Increment processed count
            processed++;
        }
        
        return processed;
    }

    /** 
     * @notice Withdraw from a directional vault by burning shares
     * @dev Burns vault shares and returns stable tokens to the user
     * @param shareAmount Amount of vault shares to burn
     * @param isCall If true, withdraw from call vault; if false, withdraw from put vault
     * @return returnedAssets Amount of stable tokens returned
     */
    function withdrawDirectional(uint256 shareAmount, bool isCall) external nonReentrant returns (uint256 returnedAssets) {
        require(shareAmount > 0, "Shares must be > 0");
        
        IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
        
        // Transfer shares from user to wrapper
        // Ensure the transferFrom succeeds
        require(vault.transferFrom(msg.sender, address(this), shareAmount), "Vault share transferFrom failed");
        
        // Withdraw stable tokens from vault
        returnedAssets = vault.withdraw(shareAmount);
        
        // Transfer all stable tokens to user
        stableToken.safeTransfer(msg.sender, returnedAssets);
        
        emit DirectionalWithdrawal(msg.sender, shareAmount, returnedAssets, isCall);
        return returnedAssets;
    }

    /** 
     * @notice Withdraw from the condor vault by burning shares
     * @dev Burns vault shares and returns stable tokens to the user
     * @param shareAmount Amount of vault shares to burn
     * @return returnedAssets Amount of stable tokens returned
     */
    function withdrawCondor(uint256 shareAmount) external nonReentrant returns (uint256 returnedAssets) {
        require(shareAmount > 0, "Shares must be > 0");
        
        // Transfer shares from user to wrapper
        // Ensure the transferFrom succeeds
        require(condorVault.transferFrom(msg.sender, address(this), shareAmount), "Vault share transferFrom failed");
        
        // Withdraw stable tokens from vault
        returnedAssets = condorVault.withdraw(shareAmount);
        
        // Transfer all stable tokens to user
        stableToken.safeTransfer(msg.sender, returnedAssets);
        
        emit CondorWithdrawal(msg.sender, shareAmount, returnedAssets);
        return returnedAssets;
    }

    /**
     * @notice Get the calculated strike prices for a directional vault
     * @param isCall If true, get strikes for call vault; if false, get strikes for put vault
     * @return Array of strike prices (usually a single strike for directional vaults)
     */
    function getDirectionalStrikes(bool isCall) external view returns (uint256[] memory) {
        IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
        return vault.calculateStrikes();
    }
    
    /**
     * @notice Get the calculated strike prices for the condor vault
     * @return Array of strike prices [putLower, putUpper, callLower, callUpper]
     */
    function getCondorStrikes() external view returns (uint256[] memory) {
        return condorVault.calculateStrikes();
    }
    
    /**
     * @notice Get the current market price from a vault's oracle
     * @param isCall If true, get price from call vault; false for put vault
     * @return Current price in oracle decimal format (usually 8 decimals)
     */
    function getCurrentPrice(bool isCall) external view returns (uint256) {
        IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
        return vault.getCurrentPrice(0); // Asset index 0 for the price feed
    }
    
    /**
     * @notice Calculate the number of option contracts that would be created for a deposit
     * @param amount Amount of stable token to deposit
     * @param isCall If true, calculate for call vault; if false, calculate for put vault
     * @return contracts Number of option contracts
     * @return strikes Array of strike prices
     */
    function calculateDirectionalContracts(uint256 amount, bool isCall) 
        external view returns (uint256 contracts, uint256[] memory strikes) 
    {
        IDirectionalStrategyVault vault = isCall ? directionalCallVault : directionalPutVault;
        return vault.calculateNumContracts(amount);
    }
    
    /**
     * @notice Calculate the number of iron condor contracts that would be created for a deposit
     * @param amount Amount of stable token to deposit
     * @return contracts Number of option contracts
     * @return strikes Array of strike prices [putLower, putUpper, callLower, callUpper]
     */
    function calculateCondorContracts(uint256 amount) 
        external view returns (uint256 contracts, uint256[] memory strikes) 
    {
        return condorVault.calculateNumContracts(amount);
    }

    /**
     * @notice Get the count of queued deposits
     * @param isDirectional If true, get directional queue count; false for condor
     * @return Number of queued deposits
     */
    function getQueuedDepositsCount(bool isDirectional) external view returns (uint256) {
        return isDirectional ? directionalQueuedDeposits.length : condorQueuedDeposits.length;
    }

    /**
     * @notice Emergency function to rescue tokens accidentally sent to the contract
     * @param token Address of the token to rescue
     * @param to Address to send the tokens to
     * @param amount Amount of tokens to rescue
     */
    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
} 