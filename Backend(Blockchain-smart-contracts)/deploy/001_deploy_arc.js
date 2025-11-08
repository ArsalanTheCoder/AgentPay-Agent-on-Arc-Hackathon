// Deploy script for AgentPay Scheduled Payments
// Usage: npx hardhat deploy --network arc_testnet --tags AgentPay

module.exports = async function (hre) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // USDC contract address on Arc Testnet
    // Update this with the actual USDC address from Arc documentation
    const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x0000000000000000000000000000000000000000";

    if (USDC_ADDRESS === "0x0000000000000000000000000000000000000000") {
        throw new Error(
            "Missing USDC address. Set USDC_ADDRESS in .env file.\n" +
            "Get the address from: https://docs.arc.network/arc/references/contract-addresses"
        );
    }

    log("\n==========================================");
    log("Deploying AgentPay Scheduled Payments...");
    log("==========================================");
    log(`Network: ${network.name}`);
    log(`Deployer: ${deployer}`);
    log(`USDC Address: ${USDC_ADDRESS}`);

    const args = [USDC_ADDRESS];
    
    const result = await deploy("AgentPayScheduledPayments", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.name === "arc_testnet" ? 2 : 1,
    });

    log("\n✅ Deployment Complete!");
    log("==========================================");
    log(`Contract Address: ${result.address}`);
    log(`Transaction Hash: ${result.transactionHash}`);
    log(`Gas Used: ${result.receipt?.gasUsed || 'N/A'}`);
    log("==========================================\n");

    // Save deployment info
    log("Deployment Summary:");
    log(`- Network: ${network.name}`);
    log(`- AgentPay: ${result.address}`);
    log(`- USDC: ${USDC_ADDRESS}`);
    log(`- Deployer: ${deployer}`);

    // Verify contract if on testnet/mainnet
    if (network.name !== "hardhat" && network.name !== "localhost") {
        log("\n⏳ Waiting for block confirmations before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s

        try {
            log("Verifying contract on block explorer...");
            await hre.run("verify:verify", {
                address: result.address,
                constructorArguments: args,
            });
            log("✅ Contract verified successfully!");
        } catch (error) {
            log("⚠️ Verification failed:", error.message);
            log("You can verify manually later with:");
            log(`npx hardhat verify --network ${network.name} ${result.address} ${USDC_ADDRESS}`);
        }
    }

    return result;
};

module.exports.tags = ["AgentPay"];