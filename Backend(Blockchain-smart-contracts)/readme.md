# AgentPay Scheduled Payments

A smart contract system for scheduling and managing automated USDC payments on the Arc Network testnet. Perfect for subscription payments, recurring bills, and automated transfers.

## 🚀 Blockchain Update - AgentPay Smart Contract

**Date:** November 5, 2025  
**Status:** ✅ **DEPLOYED & TESTED - PRODUCTION READY**

---

### 📦 Deployment Info

**Smart Contract: `AgentPayScheduledPayments`**
- **Network:** Arc Testnet
- **Contract Address:** `0xAF234A4faF6EEDac09694E4c7690F9a6CA993932`
- **USDC Address:** `0x3600000000000000000000000000000000000000`
- **Status:** Verified & Operational

---

### ✅ Testing Complete - All Systems Operational

Successfully tested all core functionality on-chain:

| Feature | Status | Details |
|---------|--------|---------|
| Instant Payments | ✅ Working | 2 USDC test payment executed |
| Scheduled Payments | ✅ Working | Single future payment created & cancelled |
| Recurring Payments | ✅ Working | 3-month batch subscription created |
| Cancellations | ✅ Working | Successfully cancelled pending payment |
| Query Functions | ✅ Working | All data retrieval confirmed |
| USDC Integration | ✅ Working | ERC20 approve + transfer working |

**Total Test Transactions:** 5  
**Gas Spent:** ~0.17 USDC  
**Actual USDC Moved:** 2.0 USDC (immediate payment)  
**Scheduled for Future:** 1.5 USDC (3 recurring payments)

---

### 🎯 Ready for Integration

#### 3 Main Functions Available:

1. **`payNow()`** - Instant payments (works immediately)
2. **`schedulePayment()`** - One-time future payments 
3. **`batchSchedulePayments()`** - Recurring subscriptions (monthly/weekly)

#### Supporting Functions:
- ✅ `executePayment()` - Trigger scheduled payments (for cron jobs)
- ✅ `cancelSubscription()` - Cancel pending payments
- ✅ `getUserSubscriptions()` - Get all user's subscriptions
- ✅ `getSubscription()` - Get payment details
- ✅ `canExecute()` - Check if payment is ready

---

### ⚠️ Critical Integration Notes

1. **USDC Amounts:** Use 6 decimals (multiply by 1,000,000)
   - User enters: $50 → Contract needs: `50000000`

2. **Timestamps:** Use Unix timestamps (seconds since 1970)
   - User enters: "Dec 1, 2025" → Contract needs: `1733011200`

3. **USDC Approval:** Users MUST approve contract first
   - Show approval popup on first use
   - Check allowance before transactions

4. **Cron Job Required:** Contract doesn't auto-execute
   - You need to call `executePayment()` when dates arrive
   - Suggest daily cron at 00:05 UTC

---

## 🌟 Features

- **Immediate Payments**: Execute instant USDC transfers with `payNow()`
- **Scheduled Payments**: Set up future one-time payments
- **Batch Scheduling**: Create multiple recurring payments in a single transaction
- **Payment Management**: View, cancel, and track all your scheduled payments
- **Permissionless Execution**: Anyone can execute payments once they're due
- **Gas Efficient**: Optimized Solidity 0.8.20 with 200 runs

## 📦 Project Structure

```
agentpay-scheduled-payments/
├── src/
│   └── AgentPayScheduledPayments.sol    # Main smart contract
├── deploy/
│   └── 01-deploy-agentpay.js            # Deployment script
├── scripts/
│   ├── main.js                          # Full test suite
│   └── cancel_stuck_transaction.js      # Utility for stuck txs
├── hardhat.config.js                    # Hardhat configuration
└── .env                                 # Environment variables
```

## 🛠️ Tech Stack

- **Solidity** ^0.8.20
- **Hardhat** - Development environment
- **hardhat-deploy** - Deployment management
- **Arc Network Testnet** - Target blockchain
- **USDC** - Payment token (ERC-20)

## 🚀 Deployment

The contract is deployed on Arc Network testnet and requires:
- USDC token address on Arc testnet
- Funded deployer wallet with Arc testnet tokens

```bash
npx hardhat deploy --network arc_testnet --tags AgentPay
```

## 🧪 Testing

Run the comprehensive on-chain test suite:

```bash
npx hardhat run scripts/main.js --network arc_testnet
```

**Tests include:**
- ✅ Immediate payment execution (payNow)
- ✅ Single scheduled payment creation
- ✅ Batch recurring payment scheduling
- ✅ Subscription viewing and listing
- ✅ Payment cancellation
- ✅ Execution status verification
- ✅ Contract statistics retrieval

## 📝 Contract Overview

### Main Contract: `AgentPayScheduledPayments.sol`

**Key Features:**
- Supports scheduled USDC payments at specific timestamps
- Batch creation for recurring payment schedules
- User-initiated cancellation before execution
- Permissionless execution by anyone once payment is due
- Comprehensive event logging for off-chain tracking

**Core Functions:**

| Function | Description | Parameters |
|----------|-------------|------------|
| `payNow()` | Execute immediate payment | `recipient`, `amount`, `description` |
| `schedulePayment()` | Schedule single future payment | `recipient`, `amount`, `paymentDate`, `description` |
| `batchSchedulePayments()` | Create multiple recurring payments | `recipient`, `amount`, `startDate`, `intervalDays`, `count`, `description` |
| `executePayment()` | Execute a due payment | `subscriptionId` |
| `cancelSubscription()` | Cancel pending payment | `subscriptionId` |
| `getUserSubscriptions()` | Get all user subscriptions | `user` |
| `getPendingSubscriptions()` | Get executable subscriptions | `user` |
| `getSubscription()` | Get subscription details | `subscriptionId` |

**Events:**
- `SubscriptionCreated` - Emitted when new subscription is created
- `PaymentExecuted` - Emitted when payment is successfully executed
- `SubscriptionCancelled` - Emitted when subscription is cancelled

## 🔒 Security Features

- ✅ Reentrancy protection (state updates before external calls)
- ✅ Input validation (zero address, zero amount checks)
- ✅ Access control (only payer can cancel their subscriptions)
- ✅ Balance checks before execution
- ✅ Custom error messages for gas efficiency

## 🛠️ Utilities

### Cancel Stuck Transaction

If a deployment gets stuck, use the cancellation script:

```bash
npx hardhat run scripts/cancel_stuck_transaction.js --network arc_testnet
```

This sends a replacement transaction with higher gas to unstick your nonce.

## 📊 Contract Statistics

The contract provides real-time statistics:
- Total subscriptions created
- Per-user subscription lists
- Pending (executable) payment counts
- Individual subscription status tracking

## 🌐 Network Configuration

**Arc Testnet:**
- Chain ID: `5042002`
- RPC URL: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- USDC Address: See `.env` configuration

## 📄 License

MIT License - see contract header for details

## 🤝 Contributing

Contributions are welcome! Please ensure:
- All tests pass before submitting PR
- Code follows existing style conventions
- New features include appropriate tests
- Documentation is updated

## ⚠️ Disclaimer

This contract is deployed on testnet for demonstration purposes. Always audit smart contracts before mainnet deployment.

## 📚 Additional Resources

- [Arc Network Documentation](https://docs.arc.network)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

Built with ❤️ for automated crypto payments on Arc Network
