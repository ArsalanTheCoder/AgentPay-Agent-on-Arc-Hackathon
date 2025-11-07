// src/components/TransactionHistory.js
"use client";

import React, { useState } from 'react';
import styles from './styles.module.css'; // Common component styles

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' or 'history'

  // Dummy data for scheduled payments
  const scheduledPayments = [
    { id: 1, merchant: 'Netflix', amount: 12, frequency: 'month', nextPayment: 'Dec 1, 2025' },
    { id: 2, merchant: 'Spotify', amount: 10, frequency: 'month', nextPayment: 'Dec 5, 2025' },
  ];

  // Dummy data for payment history
  const paymentHistory = [
    { id: 3, merchant: 'Netflix', amount: 12, date: 'Nov 1, 2025', status: 'paid', txLink: '#' },
    { id: 4, merchant: 'Amazon Prime', amount: 15, date: 'Oct 20, 2025', status: 'paid', txLink: '#' },
    { id: 5, merchant: 'Hulu', amount: 8, date: 'Oct 15, 2025', status: 'failed', txLink: '#' }, // Example of a failed one
  ];

  return (
    <div className={styles.historyContainer}>
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'scheduled' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'scheduled' && (
          <div className={styles.scheduledList}>
            {scheduledPayments.length === 0 ? (
              <p className={styles.noData}>No scheduled payments.</p>
            ) : (
              scheduledPayments.map(payment => (
                <div key={payment.id} className={styles.scheduledItem}>
                  <p className={styles.itemText}>{payment.merchant} - ${payment.amount} USDC / {payment.frequency} (Next: {payment.nextPayment})</p>
                  <div className={styles.itemActions}>
                    <button className={styles.actionButton}>Pause</button>
                    <button className={styles.actionButton}>Cancel</button>
                    <a href="#" className={styles.actionLink}>View Tx</a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.historyList}>
            {paymentHistory.length === 0 ? (
              <p className={styles.noData}>No payment history.</p>
            ) : (
              paymentHistory.map(transaction => (
                <div key={transaction.id} className={`${styles.historyItem} ${styles[transaction.status]}`}>
                  <p className={styles.itemText}>
                    {transaction.status === 'paid' ? '' : 'Failed: '}
                    {transaction.merchant} - ${transaction.amount} USDC ({transaction.date})
                  </p>
                  <div className={styles.itemActions}>
                    {transaction.status === 'paid' && (
                      <span className={styles.statusText}>Paid &#10003;</span>
                    )}
                    {transaction.status === 'failed' && (
                      <span className={styles.statusText}>Failed &#x2717;</span>
                    )}
                    <a href={transaction.txLink} className={styles.actionLink} target="_blank" rel="noopener noreferrer">View Transaction</a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}