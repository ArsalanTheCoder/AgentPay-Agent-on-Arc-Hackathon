// src/app/layout.js
import './globals.css';
import React from 'react';
import Header from '../components/Header'; // Import the new Header component

export const metadata = {
  title: 'AgentPay - Automate Subscriptions',
  description: 'AI-powered automated crypto subscriptions on Arc Testnet',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header /> {/* Our global header */}
          <main style={{ flexGrow: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            {children}
          </main>
          {/* A simple footer could go here if needed later */}
        </div>
      </body>
    </html>
  );
}