// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Common interface for vault tokens with ERC20 functionality
 */
interface IVault is IERC20 {
    function deposit(uint256 amount) external returns (uint256 shares);
    function withdraw(uint256 shareAmount) external returns (uint256 returnedAssets);
    function getTotalAssets() external view returns (
        uint256[] memory assetValues,
        uint256[] memory pendingDepositValues,
        uint256[] memory optionCollateralValues,
        uint256 totalAssets
    );
}

/**
 * @dev Interface for the directional strategy vault
 */
interface IDirectionalStrategyVault is IVault {
    function calculateStrikes() external view returns (uint256[] memory);
    function calculateNumContracts(uint256 deposit) 
        external view returns (uint256 contracts, uint256[] memory strikes);
    function deposit(uint256 amount, uint256 assetIndex) external;
    function getCurrentPrice(uint256 assetIndex) external view returns (uint256);
    
    // Additional methods needed from BaseVault
    function getNextExpiryTimestamp() external view returns (uint256);
    function isRfqActive() external view returns (bool);
    function lastRFQTimestamp() external view returns (uint256);
    function lastRecordedValuePerShare(uint256 assetIndex) external view returns (uint256);
    function isRfqInLimitMode() external view returns (bool);
}

/**
 * @dev Interface for the mean reverting condor strategy vault
 */
interface IMeanRevertingCondorStrategyVault is IVault {
    function calculateStrikes() external view returns (uint256[] memory);
    function calculateNumContracts(uint256 deposit) 
        external view returns (uint256 contracts, uint256[] memory strikes);
    function deposit(uint256 amount, uint256 assetIndex) external;
    function getCurrentPrice(uint256 assetIndex) external view returns (uint256);
    
    // Additional methods needed from BaseVault
    function getNextExpiryTimestamp() external view returns (uint256);
    function isRfqActive() external view returns (bool);
    function lastRFQTimestamp() external view returns (uint256);
    function lastRecordedValuePerShare(uint256 assetIndex) external view returns (uint256);
    function isRfqInLimitMode() external view returns (bool);
} 