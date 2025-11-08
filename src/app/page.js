// src/app/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

import CommandBar from "../components/CommandBar";
import WalletCard from "../components/WalletCard";
import TransactionHistory from "../components/TransactionHistory";

import styles from "./page.module.css";
import componentStyles from "../components/styles.module.css";

// ABIs
import { AGENTPAY_ABI, USDC_ABI } from "../lib/abi";

// Addresses (use env when available)
const AGENTPAY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AGENTPAY_CONTRACT_ADDRESS || "0xAF234A4faF6EEDac09694E4c7690F9a6CA993932";
const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || "0x3600000000000000000000000000000000000000";
const MERCHANT_ADDRESS_ENV = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || "0x1fb14ef9b655f8a5421d505d46a5d4cb6bef8ca0";
const USER_PRIVATE_KEY = process.env.NEXT_PUBLIC_USER_PRIVATE_KEY || null; // optional demo key
const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC || "https://rpc.testnet.arc.network";

export default function HomePage() {
  // Balances & UI
  const [userWalletBalance, setUserWalletBalance] = useState(0.0);
  const [merchantWalletBalance, setMerchantWalletBalance] = useState(0.0);

  const [commandOutput, setCommandOutput] = useState(null);
  const [transactionMessage, setTransactionMessage] = useState({ text: "", type: "info" });

  // animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationAmount, setAnimationAmount] = useState(0);

  // blockchain
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [agentPayContract, setAgentPayContract] = useState(null);
  const [usdcContract, setUsdcContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tokenDecimals, setTokenDecimals] = useState(6);

  // refs for animation
  const previousUserBalance = useRef(userWalletBalance);
  const previousMerchantBalance = useRef(merchantWalletBalance);

  // merchant address constant for UI
  const MERCHANT_ADDRESS = MERCHANT_ADDRESS_ENV;

  // small mapping (address -> friendly name). Add more if needed.
  const merchantNameMap = {
    [MERCHANT_ADDRESS.toLowerCase()]: "Netflix"
  };

  // Load merchant local balance (if saved)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("merchantBalance");
      if (saved) setMerchantWalletBalance(parseFloat(saved));
    } catch (e) {}
  }, []);

  // Init blockchain connection (demo private key OR browser wallet)
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider = new ethers.JsonRpcProvider(RPC_URL);

        // If a demo private key is provided (hackathon mode), use it
        if (USER_PRIVATE_KEY) {
          const wallet = new ethers.Wallet(USER_PRIVATE_KEY, readProvider);
          setProvider(readProvider);
          setSigner(wallet);
          const addr = await wallet.getAddress();
          setAccount(addr);

          const wAgent = new ethers.Contract(AGENTPAY_CONTRACT_ADDRESS, AGENTPAY_ABI, wallet);
          const wUsdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, wallet);
          setAgentPayContract(wAgent);
          setUsdcContract(wUsdc);

          try {
            const d = Number(await wUsdc.decimals());
            setTokenDecimals(d);
          } catch (e) {
            setTokenDecimals(6);
          }

          await fetchUserBalance(readProvider, addr);
          await fetchMerchantBalance(readProvider, MERCHANT_ADDRESS);
          await fetchSubscriptions(wAgent, addr);
          return;
        }

        // Otherwise use browser provider (MetaMask)
        if (typeof window !== "undefined" && window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          try {
            // best-effort request accounts - user may accept/decline
            await web3Provider.send("eth_requestAccounts", []);
          } catch (e) {
            // ignore
          }
          const accounts = await web3Provider.listAccounts();
          if (accounts.length === 0) {
            // no connected account; still setup readProvider
            setProvider(readProvider);
            // still fetch merchant balance for UI
            await fetchMerchantBalance(readProvider, MERCHANT_ADDRESS);
            return;
          }
          const web3Signer = await web3Provider.getSigner();
          const userAddr = await web3Signer.getAddress();

          setProvider(web3Provider);
          setSigner(web3Signer);
          setAccount(userAddr);

          const writeAgent = new ethers.Contract(AGENTPAY_CONTRACT_ADDRESS, AGENTPAY_ABI, web3Signer);
          const writeUsdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, web3Signer);
          setAgentPayContract(writeAgent);
          setUsdcContract(writeUsdc);

          try {
            const d = Number(await writeUsdc.decimals());
            setTokenDecimals(d);
          } catch (e) {
            setTokenDecimals(6);
          }

          await fetchUserBalance(readProvider, userAddr);
          await fetchMerchantBalance(readProvider, MERCHANT_ADDRESS);
          await fetchSubscriptions(writeAgent, userAddr);
        } else {
          // no window.ethereum and no demo key: still setup read provider and merchant balance
          setProvider(readProvider);
          await fetchMerchantBalance(readProvider, MERCHANT_ADDRESS);
        }
      } catch (e) {
        console.error("Init error:", e);
        setTransactionMessage({ text: `Error initializing: ${e.message || e}`, type: "error" });
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    previousUserBalance.current = userWalletBalance;
  }, [userWalletBalance]);

  useEffect(() => {
    previousMerchantBalance.current = merchantWalletBalance;
  }, [merchantWalletBalance]);

  useEffect(() => {
    try {
      window.localStorage.setItem("merchantBalance", merchantWalletBalance.toString());
    } catch (e) {}
  }, [merchantWalletBalance]);

  // --- Fetchers ---
  const fetchUserBalance = async (prov, userAccount) => {
    if (!prov || !userAccount) return;
    try {
      const readUsdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, prov);
      const bal = await readUsdc.balanceOf(userAccount);
      setUserWalletBalance(parseFloat(ethers.formatUnits(bal, tokenDecimals)));
    } catch (e) {
      console.error("fetchUserBalance failed:", e);
    }
  };

  const fetchMerchantBalance = async (prov, merchantAddress) => {
    if (!prov || !merchantAddress) return;
    try {
      const readUsdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, prov);
      const bal = await readUsdc.balanceOf(merchantAddress);
      setMerchantWalletBalance(parseFloat(ethers.formatUnits(bal, tokenDecimals)));
    } catch (e) {
      console.warn("fetchMerchantBalance failed, using local/demo balance", e);
    }
  };

  const fetchSubscriptions = async (contract, userAccount) => {
    if (!contract || !userAccount) return;
    try {
      const rawSubIds = await contract.getUserSubscriptions(userAccount);

      // Deduplicate IDs: convert to strings and use a Set
      const idStrings = rawSubIds.map((id) => id.toString());
      const uniqueIdStrings = [...new Set(idStrings)];

      if (uniqueIdStrings.length !== idStrings.length) {
        console.warn("Duplicate subscription IDs detected; deduping for UI.");
      }

      const subs = [];
      for (const idStr of uniqueIdStrings) {
        // contract.getSubscription expects a numeric/BigInt ID; convert to BigInt
        let sub;
        try {
          // ethers v6 supports BigInt; pass BigInt
          sub = await contract.getSubscription(BigInt(idStr));
        } catch (innerErr) {
          // fallback: pass as Number
          sub = await contract.getSubscription(Number(idStr));
        }

        // Normalize fields
        const amount = parseFloat(ethers.formatUnits(sub.amount, tokenDecimals));
        const paymentDate = Number(sub.paymentDate) ? new Date(Number(sub.paymentDate) * 1000).toLocaleString() : "N/A";
        const paid = !!sub.paid;
        const cancelled = !!sub.cancelled;
        const description = sub.description || "";

        subs.push({
          id: idStr,
          merchant: description,
          amount,
          date: paymentDate,
          paid,
          cancelled,
        });
      }

      setSubscriptions(subs.reverse()); // newest first
    } catch (e) {
      console.error("fetchSubscriptions failed:", e);
    }
  };

  // --- Parser ---
  const handleCommandSubmit = (commandText) => {
    const amountMatch = commandText.match(/\$([\d.]+)/);
    const merchantMatch = commandText.match(/(?:pay|to)\s(.*?)\s(?:\$[\d.]+|monthly|monthly|on|every|for)?/i);

    if (amountMatch && merchantMatch) {
      const amount = parseFloat(amountMatch[1]);
      let merchantName = merchantMatch[1].trim();

      merchantName = merchantName.replace(/netflix|spotify|amazon prime/i, (m) =>
        m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
      );

      const addrLower = MERCHANT_ADDRESS.toLowerCase();
      if (merchantName.toLowerCase().includes("netflix") || merchantName.toLowerCase().includes(addrLower)) {
        merchantName = merchantNameMap[addrLower] || "Netflix";
      }

      setCommandOutput({
        merchantName: merchantName || "Merchant",
        merchantAddress: MERCHANT_ADDRESS,
        amount: amount,
        frequency: "month",
        billingDay: "1st",
      });
      setTransactionMessage({ text: "", type: "info" });
    } else {
      setCommandOutput(null);
      setTransactionMessage({ text: 'Could not parse command. Try "Pay Netflix $12".', type: "error" });
    }
  };

  // --- Approval helper ---
  const checkAndRequestApproval = async (amountInSmallestUnit) => {
    if (!usdcContract || !signer || !account) {
      setTransactionMessage({ text: "Wallet is not connected.", type: "error" });
      return false;
    }
    setTransactionMessage({ text: "Checking USDC approval...", type: "info" });
    try {
      const allowance = await usdcContract.allowance(account, AGENTPAY_CONTRACT_ADDRESS);
      const allowBig = BigInt(allowance.toString ? allowance.toString() : allowance);
      const needBig = BigInt(amountInSmallestUnit.toString ? amountInSmallestUnit.toString() : amountInSmallestUnit);
      if (allowBig < needBig) {
        setTransactionMessage({ text: "Requesting approval...", type: "info" });
        const tx = await usdcContract.approve(AGENTPAY_CONTRACT_ADDRESS, amountInSmallestUnit);
        await tx.wait();
        setTransactionMessage({ text: "Approval granted.", type: "success" });
        return true;
      }
      setTransactionMessage({ text: "Approval already present.", type: "success" });
      return true;
    } catch (e) {
      console.error("Approval failed:", e);
      setTransactionMessage({ text: `Approval error: ${e.reason || e.message || e}`, type: "error" });
      return false;
    }
  };

  // --- Pay now (single) ---
  const handlePayOnceNowDemo = async () => {
    if (!commandOutput || !signer || !agentPayContract || !usdcContract) {
      setTransactionMessage({ text: "Wallet not ready. Please connect or provide a valid command.", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      const amount = commandOutput.amount.toString();
      const amountInSmallestUnit = ethers.parseUnits(amount, tokenDecimals);

      const approved = await checkAndRequestApproval(amountInSmallestUnit);
      if (!approved) {
        setIsLoading(false);
        return;
      }

      setTransactionMessage({ text: "Sending payment (auto-sign)...", type: "info" });
      const tx = await agentPayContract.payNow(commandOutput.merchantAddress, amountInSmallestUnit, commandOutput.merchantName);
      setTransactionMessage({ text: "Transaction sent... waiting for confirmation.", type: "info" });
      const receipt = await tx.wait();

      try {
        const map = JSON.parse(localStorage.getItem("subTxMap") || "{}");
        for (const ev of receipt.events || []) {
          const ename = ev.event;
          if (ename === "SubscriptionCreated" || ename === "PaymentExecuted") {
            const subId = ev.args?.subscriptionId?.toString();
            if (subId) map[subId] = tx.hash;
          }
        }
        localStorage.setItem("subTxMap", JSON.stringify(map));
      } catch (e) {}

      setTransactionMessage({ text: `Payment successful — Tx: ${tx.hash}`, type: "success" });
      setIsLoading(false);
      setCommandOutput(null);

      setAnimationAmount(Number(commandOutput.amount));
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        refreshAllData();
        setMerchantWalletBalance((p) => p + Number(commandOutput.amount));
      }, 1200);
    } catch (e) {
      console.error("Payment failed:", e);
      setTransactionMessage({ text: `Error: ${e.reason || e.message}`, type: "error" });
      setIsLoading(false);
    }
  };

  // --- Schedule batch ---
  const handleConfirmAndSchedule = async () => {
    if (!commandOutput || !signer || !agentPayContract || !usdcContract) {
      setTransactionMessage({ text: "Wallet not ready. Please connect or provide a valid command.", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      const count = 12;
      const amount = commandOutput.amount.toString();
      const amountInSmallestUnit = ethers.parseUnits(amount, tokenDecimals);
      const totalAmount = BigInt(amountInSmallestUnit) * BigInt(count);

      const approved = await checkAndRequestApproval(totalAmount);
      if (!approved) {
        setIsLoading(false);
        return;
      }

      setTransactionMessage({ text: "Scheduling payments (auto-sign)...", type: "info" });
      const startDate = Math.floor(Date.now() / 1000) + 120;
      const intervalDays = 30;

      const tx = await agentPayContract.batchSchedulePayments(
        commandOutput.merchantAddress,
        amountInSmallestUnit,
        startDate,
        intervalDays,
        count,
        commandOutput.merchantName
      );

      setTransactionMessage({ text: "Transaction sent... waiting for confirmation.", type: "info" });
      const receipt = await tx.wait();

      try {
        const map = JSON.parse(localStorage.getItem("subTxMap") || "{}");
        for (const ev of receipt.events || []) {
          if (ev.event === "SubscriptionCreated") {
            const subId = ev.args?.subscriptionId?.toString();
            if (subId) map[subId] = tx.hash;
          }
        }
        localStorage.setItem("subTxMap", JSON.stringify(map));
      } catch (e) {}

      setTransactionMessage({ text: `Scheduled ${count} payments — Tx: ${tx.hash}`, type: "success" });
      setIsLoading(false);
      setCommandOutput(null);
      refreshAllData();
    } catch (e) {
      console.error("Scheduling failed:", e);
      setTransactionMessage({ text: `Error: ${e.reason || e.message}`, type: "error" });
      setIsLoading(false);
    }
  };

  // refresh helper
  const refreshAllData = async () => {
    if (!provider) return;
    try {
      if (account && usdcContract) await fetchUserBalance(usdcContract.provider || provider, account);
      await fetchMerchantBalance(provider, MERCHANT_ADDRESS);
      if (agentPayContract && account) await fetchSubscriptions(agentPayContract, account);
    } catch (e) {
      console.error("refreshAllData error:", e);
    }
  };

  // UI helpers for merchant friendly name
  const getFriendlyMerchantName = (address, fallback) => {
    if (!address) return fallback;
    const lower = address.toLowerCase();
    return merchantNameMap[lower] || fallback || address;
  };

  // --- JSX Return ---
  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <div className={styles.logoBadge}><span className={styles.logoLetter}>A</span></div>
          <div className={styles.brandWrap}>
            <div className={styles.brandLine}>AgentPay <span className={styles.proBadge}>Pro</span></div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {account ? (
            <div className={styles.addressPill} title={account}>
              <span className={`${styles.addressMono} mono`}>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
            </div>
          ) : (
            <button className={styles.connectButton} onClick={async () => {
              if (typeof window !== "undefined" && window.ethereum) {
                try {
                  await window.ethereum.request({ method: "eth_requestAccounts" });
                  window.location.reload();
                } catch (e) { console.error("connect cancelled", e); }
              } else {
                setTransactionMessage({ text: "Please install a web3 wallet like MetaMask.", type: "error" });
              }
            }}>Connect Wallet</button>
          )}
        </div>
      </header>

      <h1 className={styles.mainTitle}>Automate Your Subscriptions</h1>

      <CommandBar onSubmit={handleCommandSubmit} />

      <div className={componentStyles.walletCardsWrapper}>
        <WalletCard
          title="Your Wallet"
          address={account}
          balance={userWalletBalance}
          type="user"
          isAnimating={isAnimating && animationAmount > 0}
          animationAmount={animationAmount}
        />
        <div className={componentStyles.walletConnector}>
          <div className={componentStyles.dotLine} />
          <div className={componentStyles.chip}><span className={componentStyles.badge}>USDC</span>Pay</div>
          <div className={componentStyles.dotLine} />
        </div>
        <WalletCard
          title="Merchant Wallet"
          address={MERCHANT_ADDRESS}
          balance={merchantWalletBalance}
          type="merchant"
          isAnimating={isAnimating && animationAmount > 0}
          animationAmount={animationAmount}
        />
      </div>

      <div className={componentStyles.fullWidthRow}>
        <div className={componentStyles.fullWidthPanel}>
          {transactionMessage.text && (
            <div className={`${componentStyles.messageInline} ${componentStyles[transactionMessage.type] || ""}`}>
              {transactionMessage.text}
            </div>
          )}

          {commandOutput && (
            <div className={componentStyles.actionCard}>
              <div className={componentStyles.actionLeft}>
                <div className={componentStyles.merchantBadge}>
                  <div className={componentStyles.merchantInitial}>
                    {getFriendlyMerchantName(commandOutput.merchantAddress, commandOutput.merchantName).charAt(0)}
                  </div>
                </div>
                <div className={componentStyles.actionText}>
                  <div className={componentStyles.actionTitle}>Confirm Your Subscription</div>
                  <div className={`${componentStyles.actionSubtitle} mono`}>
                    <strong>{getFriendlyMerchantName(commandOutput.merchantAddress, commandOutput.merchantName)}</strong>
                    <span> • ${commandOutput.amount} USDC</span>
                  </div>
                </div>
              </div>
              <div className={componentStyles.actionButtons}>
                <button className={componentStyles.primaryBtn} onClick={handleConfirmAndSchedule} disabled={isLoading}>
                  {isLoading ? "Scheduling..." : "Schedule (12 Months)"}
                </button>
                <button className={componentStyles.secondaryBtn} onClick={handlePayOnceNowDemo} disabled={isLoading}>
                  {isLoading ? "Paying..." : "Pay Once Now"}
                </button>
              </div>
            </div>
          )}

          <div className={componentStyles.historyScroll}>
            <TransactionHistory
              subscriptions={subscriptions}
              contract={agentPayContract}
              setTransactionMessage={setTransactionMessage}
              refreshData={refreshAllData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
