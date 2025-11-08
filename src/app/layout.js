// src/app/layout.js
import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google'; // Import the font

// Setup the font to match our "Pro" theme
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// This sets your browser tab title
export const metadata = {
  title: 'AgentPay Pro',
  description: 'AI-Powered Crypto Subscriptions on Arc',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* We apply the font here.
        We have REMOVED the <Header /> component, as it's no longer needed.
        The {children} is your page.js file.
      */}
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}