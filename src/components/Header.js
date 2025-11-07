// src/components/Header.js
"use client"; // Needs to be a client component for interactivity (dropdown, etc.)

import React, { useState } from 'react';
import Image from 'next/image'; // For your logo if you have one
import styles from './styles.module.css'; // Common component styles

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {/* Replace with your actual logo image if available */}
        <Image src="/logo.svg" alt="AgentPay Logo" width={30} height={30} className={styles.logoIcon} />
        <span className={styles.appName}>AgentPay</span>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.profileContainer} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className={styles.profileIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className={styles.dropdownArrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <a href="#">My Account</a>
              <a href="#">Settings</a>
              <a href="#">Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}