// src/components/WalletCard.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './WalletCard.module.css';

// A simple utility to format numbers with commas
const formatBalance = (num) => {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function WalletCard({
  title,
  address,
  balance,
  type, // 'user' or 'merchant' — used for styling only
  isAnimating,
  animationAmount,
  previousBalance,
}) {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const intervalRef = useRef(null);

  // choose variant class for CSS styling
  const variantClass = type === 'merchant' ? styles.merchant : styles.user;

  useEffect(() => {
    if (!isAnimating) {
      setDisplayBalance(balance);
    }
  }, [balance, isAnimating]);

  useEffect(() => {
    if (isAnimating && animationAmount > 0) {
      const isUser = type === 'user';
      const startBalance = previousBalance ?? balance;
      const endBalance = isUser ? startBalance - animationAmount : startBalance + animationAmount;
      const duration = 900;
      const steps = 30;
      const stepTime = duration / steps;
      const increment = (endBalance - startBalance) / steps;

      let currentStep = 0;

      intervalRef.current = setInterval(() => {
        if (currentStep >= steps) {
          clearInterval(intervalRef.current);
          setDisplayBalance(endBalance);
          return;
        }
        setDisplayBalance(startBalance + (increment * currentStep));
        currentStep++;
      }, stepTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAnimating, animationAmount, previousBalance, type]);

  return (
    <div className={`${styles.walletCard} ${variantClass} pro-card`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{title}</h3>
        {address && <span className={`${styles.address} mono`}>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</span>}
      </div>
      <div className={styles.balanceWrapper}>
        <h1 className={styles.balance}>
          ${formatBalance(displayBalance)} <span className={styles.currency}>USC</span>
        </h1>
      </div>

      {type === 'user' && isAnimating && (
        <div className={styles.receiptAnimation}>
          <span>-${animationAmount} USC</span>
        </div>
      )}
    </div>
  );
}
