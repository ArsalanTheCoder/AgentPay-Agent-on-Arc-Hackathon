// src/app/page.js
"use client"; // This component needs interactivity (state, event handlers, animation)

import React, { useState } from 'react';
import CommandBar from '../components/CommandBar';
import WalletCard from '../components/WalletCard';
import TransactionHistory from '../components/TransactionHistory';
import styles from './page.module.css'; // Page-specific styles
import componentStyles from '../components/styles.module.css'; // Re-using animation style

export default function HomePage() {
  const [userWalletBalance, setUserWalletBalance] = useState(1000.00);
  const [merchantWalletBalance, setMerchantWalletBalance] = useState(5000.00);
  const [commandOutput, setCommandOutput] = useState(null); // To store parsed command for preview
  const [transactionMessage, setTransactionMessage] = useState(null); // For success/error messages
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationAmount, setAnimationAmount] = useState(0);

  // Function to simulate parsing command (for UI only, backend will do this)
  const handleCommandSubmit = (commandText) => {
    // Basic regex to extract amount and merchant for UI preview
    const amountMatch = commandText.match(/\$([\d.]+)/);
    const merchantMatch = commandText.match(/(pay|to) ([\w\s]+?) \$?/i); // Adjusted regex for merchant

    if (amountMatch && merchantMatch) {
      const amount = parseFloat(amountMatch[1]);
      const merchantName = merchantMatch[2].replace(/netflix|spotify|amazon prime/i, (match) => {
        // Capitalize first letter of common merchants for display
        return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
      });

      setCommandOutput({
        merchant: merchantName.trim(),
        amount: amount,
        frequency: 'month', // Default for MVP
        billingDay: '1st', // Default for MVP
      });
      setTransactionMessage(null); // Clear previous messages
    } else {
      setCommandOutput({
        merchant: 'Unknown',
        amount: 0,
        frequency: 'N/A',
        billingDay: 'N/A',
        error: 'Could not parse command. Please try again (e.g., "Pay Netflix $12 on the 1st of every month").'
      });
    }
  };


  const handleConfirmAndSchedule = () => {
    if (commandOutput && !commandOutput.error) {
      setTransactionMessage(`Subscription to ${commandOutput.merchant} for $${commandOutput.amount} USDC scheduled successfully!`);
      // In a real app, this would send data to backend to schedule
      setCommandOutput(null); // Clear preview
    } else {
      setTransactionMessage('Please submit a valid command first.');
    }
  };

  const handlePayOnceNowDemo = () => {
    if (commandOutput && !commandOutput.error) {
      const amountToPay = commandOutput.amount;
      if (userWalletBalance >= amountToPay) {
        setAnimationAmount(amountToPay);
        setIsAnimating(true);
        // Simulate transaction and balance update after animation
        setTimeout(() => {
          setUserWalletBalance(prev => prev - amountToPay);
          setMerchantWalletBalance(prev => prev + amountToPay);
          setIsAnimating(false);
          setTransactionMessage(`Transaction successful! Tx Hash: 0x...${Math.random().toString(16).substr(2, 8)}`);
          setCommandOutput(null); // Clear preview
        }, 1500); // Duration of the CSS animation
      } else {
        setTransactionMessage('Insufficient funds in your wallet for this demo!');
      }
    } else {
      setTransactionMessage('Please submit a valid command first.');
    }
  };


  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.mainTitle}>Automate Your Subscriptions</h1>

      <CommandBar onSubmit={handleCommandSubmit} />

      <div className={componentStyles.walletCardsWrapper}>
        <WalletCard title="Your Wallet" address="0x123...1A2b" balance={userWalletBalance} type="user" />
        <WalletCard title="Merchant Wallet (Netflix)" address="0x5x0...Cd4" balance={merchantWalletBalance} type="merchant" />
        {isAnimating && (
          <div className={componentStyles.animationCircle}>
            ${animationAmount}
          </div>
        )}
      </div>

      {commandOutput && (
        <div className={componentStyles.confirmationPanel}>
          <h2 className={componentStyles.panelTitle}>Confirm Your Subscription</h2>
          {commandOutput.error ? (
            <p className={componentStyles.previewText} style={{ color: 'red' }}>{commandOutput.error}</p>
          ) : (
            <p className={componentStyles.previewText}>
              You are about to schedule a payment: <br />
              Pay <strong>{commandOutput.merchant}</strong> <em>${commandOutput.amount} USDC</em> every {commandOutput.frequency} on the {commandOutput.billingDay}.<br />
              Next payment: December 1, 2025.
            </p>
          )}

          <div className={componentStyles.actionButtons}>
            <button
              className={componentStyles.confirmButton}
              onClick={handleConfirmAndSchedule}
              disabled={commandOutput.error}
            >
              Confirm & Schedule
            </button>
            <button
              className={componentStyles.demoButton}
              onClick={handlePayOnceNowDemo}
              disabled={commandOutput.error || isAnimating}
            >
              Pay Once Now [Demo]
            </button>
          </div>
          {transactionMessage && <p className={componentStyles.transactionMessage}>{transactionMessage}</p>}
        </div>
      )}

      <TransactionHistory />
    </div>
  );
}