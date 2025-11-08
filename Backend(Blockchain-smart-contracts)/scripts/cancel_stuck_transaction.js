// Script to cancel stuck transaction by sending a replacement with higher gas
// Usage: npx hardhat run scripts/cancel_stuck_transaction.js --network arc_testnet

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n🔧 Canceling Stuck Transaction");
    console.log("================================\n");

    const [deployer] = await ethers.getSigners();
    console.log("Address:", deployer.address);

    // Get current nonce from the network
    const currentNonce = await deployer.getNonce();
    console.log("Current nonce from network:", currentNonce);

    // Get current gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("\nCurrent Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");

    // Ask user which nonce to replace (should be the stuck one)
    console.log("\n⚠️  Manual Input Required:");
    console.log("The stuck transaction has nonce 0 (first transaction)");
    console.log("We'll send a self-transaction with nonce 0 and HIGHER gas to replace it\n");

    // Send a replacement transaction to self with 0 value
    // This effectively cancels the stuck deployment transaction
    const nonceToReplace = 0; // The stuck transaction nonce
    
    // Use MUCH higher gas price than current (3x to be safe)
    const newGasPrice = feeData.gasPrice * 3n;
    
    console.log("Sending replacement transaction:");
    console.log("- To:", deployer.address, "(self)");
    console.log("- Value: 0 USDC");
    console.log("- Nonce:", nonceToReplace);
    console.log("- Gas Price:", ethers.formatUnits(newGasPrice, "gwei"), "gwei");
    
    const tx = await deployer.sendTransaction({
        to: deployer.address,
        value: 0,
        nonce: nonceToReplace,
        gasPrice: newGasPrice,
        gasLimit: 21000, // Simple transfer
    });

    console.log("\n✅ Replacement transaction sent!");
    console.log("Transaction Hash:", tx.hash);
    console.log("\nWaiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("\n✨ Stuck transaction has been replaced!");
    console.log("You can now redeploy the contract with:");
    console.log("npx hardhat deploy --network arc_testnet --tags AgentPay --reset\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });