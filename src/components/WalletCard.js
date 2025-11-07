// src/components/WalletCard.js
"use client";

import React from 'react';
import styles from './styles.module.css'; // Common component styles

export default function WalletCard({ title, address, balance, type }) {
  // Simple state for animation, can be expanded later
  const [currentBalance, setCurrentBalance] = React.useState(balance);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // A placeholder for future animation logic
  React.useEffect(() => {
    setCurrentBalance(balance); // Update balance when prop changes
  }, [balance]);


  return (
    <div className={`${styles.walletCard} ${styles[type]}`}>
      <h3 className={styles.walletTitle}>{title}</h3>
      <p className={styles.walletAddress}>{address}</p>
      <div className={styles.walletBalance}>
        <span className={styles.balanceAmount}>{currentBalance.toLocaleString()}</span>
        <span className={styles.balanceUnit}> USDC</span>
      </div>
      <button className={styles.addFundsButton}>Add Funds</button>
    </div>
  );
}