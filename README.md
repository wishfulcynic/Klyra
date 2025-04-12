# Klyra Vault Interface - Frontend

## Overview

This repository contains the frontend web application for the Klyra Vaults, part of the Thesaurus Protocol. This interface provides a user-friendly way for users to discover, understand, and interact with sophisticated DeFi yield strategies, specifically:

1.  **Directional Vaults**: Offering Call Spread (Bullish) and Put Spread (Bearish) strategies on underlying assets (initially ETH).
2.  **Condor Vaults**: Implementing market-neutral Iron Condor strategies.

Built using Next.js, React, TypeScript, and Ethers.js, the frontend connects to the deployed `StrategyVaultWrapper` smart contract, abstracting away the complexities of direct contract interaction and presenting vault performance and deposit actions in a clear, accessible manner.

---

## Core Principles & User Experience

The design philosophy mirrors the simplicity and transparency goals seen in related protocols like Kairos and Odette:

1.  **User-Centric Design**: Focused on making complex DeFi strategies understandable and usable for a broader audience.
2.  **Strategy Clarity**: Clearly explaining the premise behind each vault type (Bullish, Bearish, Market-Neutral) and associated risks.
3.  **Performance Transparency**: Displaying key metrics like APY, TVL, share prices, and historical performance data (where available) to inform user decisions.
4.  **Simplified Interaction**: Streamlining the deposit process, including wallet connection, approvals, and transaction submission.
5.  **Seamless Integration**: Connecting directly to deployed smart contracts for real-time data and actions.

---

## Key Features

-   **Vault Discovery**: Browse available Directional (Call/Put) and Condor strategy vaults.
-   **Performance Metrics**: View real-time APY, TVL, current share price, and other relevant vault statistics.
-   **Strategy Selection**: Easily choose between Bullish (Call) and Bearish (Put) stances within the Directional vault.
-   **Deposit Interface**:
    -   Connect Web3 wallet (e.g., MetaMask).
    -   Input deposit amount in sUSD.
    -   View available sUSD balance.
    -   Use percentage buttons (25%, 50%, 75%, MAX) for convenience.
    -   See estimated vault shares to be received.
    -   (Potentially) View estimated option contract details based on deposit amount.
-   **Transaction Handling**:
    -   Handles ERC20 approvals for sUSD spending by the wrapper contract.
    -   Submits deposit transactions to the `StrategyVaultWrapper`.
-   **Informational Displays**: Provides explanations of how each strategy works and associated risks.

---

## High-Level User Flow

1.  **Connect Wallet**: User connects their Web3 wallet to the application.
2.  **Select Vault Strategy**: User navigates or selects the desired vault type (e.g., Directional - Bullish).
3.  **Review Vault Info**: The interface displays performance metrics (APY, TVL), a description of the strategy, and associated risks.
4.  **Enter Deposit Amount**: User enters the amount of sUSD they wish to deposit into the selected vault using the deposit form. Their sUSD balance is displayed.
5.  **Review Estimates**: The UI shows the estimated vault shares the user will receive.
6.  **Approve (if necessary)**: If the `StrategyVaultWrapper` contract doesn't have sufficient allowance, the user is prompted to approve the sUSD spending.
7.  **Deposit**: User confirms the deposit transaction in their wallet.
8.  **Confirmation**: (Ideally) The UI provides feedback on the successful transaction and potentially updates to show the user's new position or balance.

*(Note: Displaying active user positions and withdrawal functionality might be subsequent features based on the current codebase focus).*

---

## Technical Stack

-   **Framework**: Next.js (React)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Web3 Interaction**: Ethers.js
-   **State Management**: React Hooks (useState, useEffect, useContext)
-   **Contract Interaction**: Connects to deployed `StrategyVaultWrapper` and `sUSDe (ERC20)` contracts via their ABIs and addresses (defined in `src/lib/contract.ts`).

---

## Getting Started

To run this frontend locally:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-name>/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    *   Ensure you have a `.env.local` file if required (e.g., for RPC URLs or specific API keys not hardcoded). Check if any environment variables are expected by the current configuration. *Based on `src/lib/contract.ts`, addresses seem hardcoded, but an RPC URL might be needed.*

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:3000` (or the specified port).

6.  **Connect Wallet:** Ensure you have a browser wallet like MetaMask installed and connected to the appropriate network (e.g., Base Sepolia for testing, Base Mainnet for production, matching the deployed contract addresses in `src/lib/contract.ts`).

---

This README provides a snapshot based on the current understanding of the `frontend` directory. It can be expanded as features like position tracking, withdrawal, and detailed historical charts are added.
