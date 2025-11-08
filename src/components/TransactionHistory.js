// src/components/TransactionHistory.js
"use client";
import React, { useState } from 'react';
import styles from './TransactionHistory.module.css';

export default function TransactionHistory({
  subscriptions, contract, setTransactionMessage, refreshData
}) {
  const [activeTab, setActiveTab] = useState('scheduled');

  const handleCancel = async (id) => { /* ... (no changes to logic) */ };
  const handleExecute = async (id) => { /* ... (no changes to logic) */ };

  const scheduled = subscriptions.filter(s => !s.paid && !s.cancelled);
  const history = subscriptions.filter(s => s.paid || s.cancelled);

  const renderList = (list) => {
    if (list.length === 0) {
      return <p className={styles.emptyState}>No payments found in this category.</p>;
    }
    return list.map(sub => {
      const isPending = !sub.paid && !sub.cancelled;
      const firstLetter = (sub.merchant || "A").charAt(0).toUpperCase();
      
      let statusClass = styles.statusScheduled;
      let statusText = "Scheduled";
      if (sub.paid) { statusClass = styles.statusPaid; statusText = "Paid"; }
      if (sub.cancelled) { statusClass = styles.statusCancelled; statusText = "Cancelled"; }

      return (
        <div key={sub.id} className={styles.txItem}>
          <div className={`${styles.itemIcon} ${styles[firstLetter]}`}>{firstLetter}</div>
          <div className={styles.itemDetails}>
            <span className={styles.merchantName}>{sub.merchant}</span>
            <span className={styles.amountDate}>${sub.amount.toFixed(2)} - Due {new Date(sub.date).toLocaleDateString()}</span>
          </div>
          <span className={`${styles.statusTag} ${statusClass}`}>{statusText}</span>
          {isPending ? (
            <>
              <button className={`${styles.actionButton} ${styles.payButton}`} onClick={() => handleExecute(sub.id)}>Pay Now</button>
              <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={() => handleCancel(sub.id)}>Cancel</button>
            </>
          ) : ( <div /> /* Empty divs to fill grid cells */ )}
        </div>
      );
    });
  };

  return (
    <div className={styles.historyContainer}>
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tabButton} ${activeTab === 'scheduled' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled Payments ({scheduled.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Transaction History ({history.length})
        </button>
      </div>
      <div className={styles.listContainer}>
        {activeTab === 'scheduled' ? renderList(scheduled) : renderList(history)}
      </div>
    </div>
  );
}