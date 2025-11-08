# AgentPay: AI-Powered Crypto Subscriptions on Arc

![AgentPay Pro UI](https://placehold.co/1200x600/007AFF/FFFFFF?text=AgentPay+Pro+Dashboard&font=roboto)
*(Replace the image link above with a real screenshot of your beautiful new dashboard before submitting!)*

## 🚀 The Vision
**AgentPay** is an AI agent that automates recurring crypto payments on the Arc L1 blockchain.

In traditional finance, subscriptions (like Netflix or Spotify) are easy. In crypto, they are painful—users must manually sign every single monthly transaction. AgentPay solves this by combining **AI natural language intent** with **smart contract automation**, allowing users to "set and forget" their crypto subscriptions using stablecoins (USDC).

> **Built for the Arc Hackathon:** Leveraging Arc's low fees and native USDC support to make micro-subscriptions viable on-chain.

---

## 🌟 Key Features (Demo Ready)

* **🗣️ AI Command Bar:** Just type natural requests like *"Pay Netflix $12 monthly"* or *"Send $50 to Mike"*.
* **⚡ Zero-Friction Demo Mode:** We've implemented a specialized demo wallet system that auto-signs transactions instantly—no MetaMask pop-ups required for judges.
* **💸 Live Payment Animation:** Watch USDC move in real-time from your wallet to the merchant's balance upon confirmation.
* **📅 On-Chain Scheduling:** True decentralized recurring payments powered by our custom `AgentPayScheduledPayments.sol` smart contract.
* **🛡️ Arc L1 Native:** Utilizes Arc Testnet for sub-cent transaction fees and native USDC integration.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), React, CSS Modules ("AgentPay Pro" Theme).
* **Blockchain Interaction:** Ethers.js (v6).
* **Smart Contracts:** Solidity (deployed on Arc Testnet).
* **Network:** Arc Public Testnet.

### Project Structure
```bash
agentpay/
├── blockchain/         # Hardhat/Foundry smart contract development environment
├── src/
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # React UI components (WalletCard, CommandBar, etc.)
│   └── lib/            # Blockchain utilities and Contract ABIs
├── .env.local          # Local secrets (Not pushed to Git)
└── next.config.mjs     # Includes RPC proxy configuration to fix CORS issues
