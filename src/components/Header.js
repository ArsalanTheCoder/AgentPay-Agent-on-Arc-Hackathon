// src/components/Header.js
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import { ethers } from "ethers";

const ARC_TESTNET_CHAIN_ID = "0x4cf44e"; // 5042002
const ARC_TESTNET_RPC_URL = "https://rpc.testnet.arc.network";
const ARC_TESTNET_NAME = "Arc Testnet";
const ARC_TESTNET_EXPLORER = "https://testnet.arcscan.app";
const ARC_TESTNET_SYMBOL = "USDC";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add / switch network helpers (unchanged logic)
  const addArcNetwork = async (provider) => {
    try {
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: ARC_TESTNET_CHAIN_ID,
          chainName: ARC_TESTNET_NAME,
          rpcUrls: [ARC_TESTNET_RPC_URL],
          nativeCurrency: {
            name: "USDC",
            symbol: ARC_TESTNET_SYMBOL,
            decimals: 6,
          },
          blockExplorerUrls: [ARC_TESTNET_EXPLORER],
        },
      ]);
    } catch (addError) {
      console.error("Failed to add Arc network:", addError);
      setError("Failed to add Arc Network. Please try again.");
    }
  };

  const switchNetwork = async (provider) => {
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: ARC_TESTNET_CHAIN_ID },
      ]);
    } catch (switchError) {
      if (switchError.code === 4902) {
        await addArcNetwork(provider);
      } else {
        console.error("Failed to switch network:", switchError);
        setError("Failed to switch to Arc Network. Please check MetaMask.");
      }
    }
  };

  const connectWallet = async () => {
    if (isLoading || typeof window.ethereum === "undefined") {
      if (!isLoading) setError("Please install MetaMask to use this app!");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const network = await provider.getNetwork();
      if (network.chainId.toString() !== "5042002") {
        await switchNetwork(provider);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      if (error.code !== 4001) {
        setError("Wallet connection failed. Please try again.");
      }
    }
    setIsLoading(false);
  };

  const checkExistingConnection = async () => {
    if (typeof window.ethereum === "undefined") return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setAccount(addr);
        const network = await provider.getNetwork();
        if (network.chainId.toString() !== "5042002") {
          await switchNetwork(provider);
        }
      }
    } catch (e) {
      console.error("Error checking existing connection:", e);
    }
  };

  useEffect(() => {
    checkExistingConnection();
  }, []);

  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        checkExistingConnection();
      } else {
        setAccount(null);
      }
    };
    const handleChainChanged = () => window.location.reload();
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Format short address like 0xAf23...d34K
  const shortAddress = (addr) => {
    if (!addr) return "";
    const s = String(addr);
    return `${s.substring(0, 6)}...${s.substring(s.length - 4)}`;
  };

  return (
    <>
      <header className={styles.headerTop}>
        <div className={styles.headerLeft}>
          {/* Logo circle with "A" */}
          <div className={styles.logoBadge} aria-hidden>
            <span className={styles.logoLetter}>A</span>
          </div>

          <div className={styles.brandWrap}>
            <div className={styles.brandLine}>AgentPay <span className={styles.proBadge}>Pro</span></div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {account ? (
            <div
              className={styles.addressPill}
              onClick={() => setDropdownOpen((s) => !s)}
              title={account}
            >
              <span className={styles.addressMono}>{shortAddress(account)}</span>
            </div>
          ) : (
            <button
              className={styles.connectButton}
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className={styles.errorBar}>
          {error}
          <button onClick={() => setError(null)} className={styles.errorClose}>
            ×
          </button>
        </div>
      )}
    </>
  );
}
