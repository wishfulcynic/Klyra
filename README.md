Klyra – DeFi Options Vault Frontend

## Key Information

*   **Live Application:** [klyra-production.up.railway.app](https://klyra-production.up.railway.app)
*   **Network:** Base Mainnet (Chain ID 8453)
*   **Key Contract Addresses (Base Mainnet):**
    *   sUSDS Stablecoin (Collateral): `0x5875eEE11Cf8398102FdAd704C9E96607675467a`
    *   StrategyVaultWrapper: `0x018d72520F114CFe7528ea5876A42C8B2499127A`
    *   Directional Call Vault: `0x8E7A90F13e3720C5415E621e9Db68B79b1a0cc39`
    *   Directional Put Vault: `0xA49b907734aF657c59Bdee11623eE45d3644399e`
    *   Condor Vault: `0x82eD817EDd587b466D7dFAb08A759B7870812fF7`

---

Klyra is a web interface for an automated dual-vault strategy system built on the Thetanuts Protocol. It allows users to deposit a stablecoin (e.g. sUSDS) and allocate funds into one of two yield-generating options strategies – either a Rangebound vault (a mean-reverting Iron Condor strategy) or a Directional vault (a long Call/Put strategy). A single smart contract wrapper unifies these vaults, handling deposits, tracking user shares, and enabling one-click strategy switches. This gives users a seamless experience to earn yield from options strategies without managing complex contracts or option mechanics.

## Features

*   Dual Strategy Vaults: Choose between Rangebound (market-neutral iron condor) and Directional (bullish or bearish) strategy vaults in a simple UI. The interface clearly explains each strategy and its risks.
*   Unified Deposits & Switching: All deposits go through a unified StrategyVaultWrapper contract, so users deposit sUSDS once and can switch strategies without manual withdrawal. The wrapper handles ERC-20 approvals, vault routing, and maintains per-user vault share balances for seamless strategy changes.


## How It Works

1.  Connect Wallet: The user connects their crypto wallet to Klyra and ensures they are on the supported network (Base Mainnet, Chain ID 8453).
2.  Select a Vault Strategy: The user selects either the Directional vault or the Rangebound Condor vault in the interface. For Directional, the UI allows choosing a bullish (Call) or bearish (Put) stance.
3.  Review Strategy Info: The app displays a description of the chosen strategy and key details like current APY, vault capacity, and risk notes. For example, a bullish directional vault might be described as buying call options for upside exposure, while the condor vault is described as selling an iron condor for range-bound yield.
4.  Enter Deposit Amount: The user enters the amount of sUSDS to deposit. The interface shows the user's available balance and calculates the estimated vault share tokens they will receive for that deposit.
5.  Approve Token (if needed): If it's the first time depositing, Klyra will prompt the user to approve the StrategyVaultWrapper contract to spend their sUSDS. This is a one-time ERC-20 approval transaction.
6.  Deposit to Vault: After approval, the user confirms the deposit. The frontend sends the deposit transaction to the StrategyVaultWrapper contract. Under the hood, the wrapper contract routes the funds into the selected vault strategy on the user's behalf.
7.  Share Issuance: The chosen vault contract issues vault shares representing the user's stake in that vault. Instead of directly holding those shares, the wrapper contract holds them and updates the user's internal balance. This design lets the platform track user positions and reinvest or switch strategies easily.
8.  Confirmation: Once the transaction is confirmed on-chain, the UI provides feedback (e.g. "Deposit Successful"). The user now starts earning yield according to the vault's strategy. In future updates, the interface may show the user's position details and enable withdrawals or strategy switches.

## Vault Strategies

### Rangebound Vault – Mean Reverting Iron Condor

The Rangebound strategy (implemented in the MeanRevertingCondorStrategyVault contract) is a market-neutral options strategy that profits when the underlying asset's price stays within a certain range. It automatically creates an iron condor position, which involves selling a spread of call options and a spread of put options around the current price (with protective buys to cap risk). The vault uses the excess yield of the deposited stablecoins to sell these option spreads (earning premiums), and it compounds the option premiums back into the strategy for growth. This strategy tends to produce enhanced yield during periods of low volatility or when prices mean-revert (stay range-bound). However, in trending or highly volatile markets the returns may underperform, as an iron condor can incur losses if the underlying price moves sharply beyond the range.

### Directional Vault – Long Call/Put Strategy

The Directional strategy (implemented via the DirectionalStrategyVault contract) is a directional bet on the underlying asset's price rising or falling. The vault takes a long position in an option (call or put) depending on the chosen stance – e.g. long calls for bullish bets or long puts for bearish bets. It uses a configurable strike price offset (e.g. buying options a certain percentage out-of-the-money) and does not compound its gains – any profits from an option that expires in-the-money are kept separate rather than reinvested. This non-compounding design keeps the exposure predictable for each cycle. Effectively, the vault sacrifices the continuous yield (from the stablecoin collateral's interest) to "trade" that yield for upside: if the underlying makes a big move in the predicted direction, the option payoff can be significant. If the move doesn't happen, the loss is limited to the premium spent (which was covered by the collateral's yield). This makes the directional vault akin to using your deposit's yield to continually buy call or put options for potential high payoff.

Each vault strategy uses sUSDS stablecoin as the collateral/base asset. The underlying asset for the options is initially ETH (on the Base network). All options are cash-settled, meaning payouts are done in sUSDS without needing to deliver the underlying asset. Users' principal stays in sUSDS (and even earns a baseline yield if unused), while the strategies deploy only the yield or a portion of funds into option positions. This approach ensures that even if options expire worthless, the user's stablecoin base may still earn interest via integration with yield-bearing tokens (rebasing sUSDS).

## Smart Contract Architecture

The Klyra frontend interacts with a set of Solidity smart contracts deployed on the Base Mainnet (Chain ID 8453). The design is modular, consisting of a wrapper contract and multiple vault contracts:

*   StrategyVaultWrapper: This is the unified entry-point contract that the frontend calls for all user actions (deposits, and in the future withdrawals or strategy switches). The wrapper holds the authority to deposit into or withdraw from the underlying vaults on behalf of users. It maintains an internal ledger of each user's share balances in each vault strategy, instead of transferring vault tokens to users directly. By acting as a custodian of vault shares, it abstracts away the complexities of interacting with multiple vault contracts. It enables the one-click strategy switching by combining a withdraw-and-deposit operation in a single transaction. The wrapper is custom-built for Klyra's dual vault system and is the only contract that needs to directly handle user funds and permissions (after the initial sUSDS approval).
*   MeanRevertingCondorStrategyVault: This is the Rangebound strategy vault that executes the Iron Condor options strategy. Internally, it extends Thetanuts' YieldStrategyVault contract, which means it inherits vault behaviors like share issuance, fee handling, and yield integration. The vault accepts sUSDS deposits (via the wrapper), converts them into a yield-bearing variant (if applicable), and uses the generated yield (and principal, if compounding) to write a balanced set of call and put option spreads (the iron condor). It issues an ERC-20 vault token representing a share of the vault's pooled assets. The vault automatically calculates strike prices around the current ETH price and opens new positions at each cycle (e.g. weekly). Earnings from option premiums and the underlying yield are accumulated and reflected in the vault share price. This vault's smart contract is non-upgradeable and follows Thetanuts' security model for vaults (fully collateralized positions, oracle price feeds for settlement, etc.).
*   DirectionalStrategyVault (Call & Put): This is the Directional strategy vault, deployed in two instances – one configured for Call options (bullish) and one for Put options (bearish). Both instances share the same code but different parameters (one uses a positive strike offset for calls, the other a negative offset for puts). Like the condor vault, the directional vault also inherits from YieldStrategyVault, enabling it to utilize yield-bearing collateral. In practice, the Directional vault will take the sUSDS deposit (via wrapper), possibly convert to a rebasing token, and periodically spend the accrued interest (and a portion of collateral as needed) to purchase call or put options with a preset strike distance. The vault token for each directional vault represents a claim on the remaining collateral plus any option payoffs that have been realized. Because profits aren't compounded, each cycle's outcome is distributed or left as idle collateral rather than increasing the next cycle's position size. This ensures a reset exposure each round, which is useful for users who want a consistent notional bet size.

All these vault contracts are implemented on top of Thetanuts Finance's audited vault framework. In fact, both the Condor and Directional vault contracts extend the Thetanuts YieldStrategyVault (which itself builds on a base cash-settled vault). This integration means that deposits can earn passive yield (e.g. lending interest on sUSDS) even while being used as option collateral, and the vaults employ Thetanuts' robust mechanisms for option creation, settlement, and yield distribution. The vaults utilize an OptionFactory and specific option instrument contracts (for calls, puts, and iron condors) under the hood to create the necessary option positions, though these are abstracted away from both the end-user and the frontend (the frontend only interacts with the vault contracts and wrapper).

Note: The vault contracts issue ERC-20 tokens for shares (with specific names/symbols per vault). However, because the StrategyVaultWrapper holds these on behalf of users, you won't see these tokens in your wallet. All interactions (deposit, withdraw, switch) are done via the wrapper. The Thetanuts option instruments (calls, puts, condors) and the OptionFactory are deployed separately and are utilized by the vaults internally; the frontend does not interact with those directly.

## Installation & Local Development

If you want to run the Klyra frontend locally for development or testing, follow these steps:

1.  Clone the Repository:

    ```bash
    git clone https://github.com/wishfulcynic/Klyra.git 
    cd Klyra/frontend
    ```

2.  Install Dependencies: Ensure you have Node.js and npm (or Yarn) installed. Then install the project's dependencies:

    ```bash
    npm install
    # or 
    yarn install
    ```

3.  Configure Environment: Klyra uses an RPC connection to the Base network. Create a file named `.env.local` in the `frontend` directory (if it doesn't exist) and add your RPC endpoint URL:

    ```env
    NEXT_PUBLIC_BASE_RPC_URL=https://<your-base-mainnet-RPC-url>
    ```

    Replace `<your-base-mainnet-RPC-url>` with a valid HTTPS RPC endpoint for Base (for example, a public node or Infura/Alchemy URL if available).

4.  Run the Development Server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    This will start the Next.js development server on `http://localhost:3000` by default.

5.  Open the App: Navigate to `http://localhost:3000` in your browser. Connect your wallet (MetaMask or others) and switch it to the Base network (Chain ID 8453) to begin testing the app. You should now be able to view the vaults and perform test deposits (you'll need some sUSDS on Base testnet or mainnet, depending on your environment).
6.  (Optional) Build for Production: To create an optimized production build, you can run `npm run build`. This will compile the Next.js application for production (outputting to the `.next` folder). Then run `npm start` to serve the production build. Ensure you have set the appropriate environment variables for production as well.
