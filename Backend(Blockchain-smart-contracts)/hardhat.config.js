require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
    },
    arc_testnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5042002, // Arc Testnet Chain ID
      timeout: 120000,
      // Let the network determine gas automatically
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  etherscan: {
    apiKey: {
      arc_testnet: process.env.ETHERSCAN_API_KEY || "dummy-key",
    },
    // customChains: [
    //   {
    //     network: "arc_testnet",
    //     chainId: 5042002,
    //     urls: {
    //       apiURL: "https://api-testnet.arcscan.app/api",
    //       browserURL: "https://testnet.arcscan.app",
    //     },
    //   },
    // ],
  },

  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
  },

  mocha: {
    timeout: 200000,
  },
};