/** @type {import('next').NextConfig} */
const nextConfig = {
  // This creates the proxy
  async rewrites() {
    return [
      {
        source: '/api/rpc',
        destination: 'https://rpc.testnet.arc.network', // The correct RPC endpoint
      },
    ];
  },
};

// Use 'export default' for .mjs files
export default nextConfig;