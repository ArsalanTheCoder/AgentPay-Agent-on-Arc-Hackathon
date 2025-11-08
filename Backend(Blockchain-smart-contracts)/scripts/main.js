// On-chain test script for AgentPay 
// Usage: npx hardhat run scripts/main.js --network arc_testnet

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n🚀 Testing AgentPay On-Chain Flow");
    console.log("===================================================\n");

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Contract addresses
    const AGENTPAY_ADDRESS = process.env.AGENTPAY_ADDRESS || "";
    const USDC_ADDRESS = process.env.USDC_ADDRESS || "";
    const NETFLIX_WALLET = process.env.NETFLIX_WALLET_ADDRESS || "";

    if (!AGENTPAY_ADDRESS || !USDC_ADDRESS) {
        throw new Error("Set AGENTPAY_ADDRESS and USDC_ADDRESS in .env");
    }

    // Complete ERC20 ABI for Arc's native USDC wrapper
    const ERC20_ABI = [
        "function balanceOf(address account) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)"
    ];

    // Connect to contracts
    const agentPay = await ethers.getContractAt("AgentPayScheduledPayments", AGENTPAY_ADDRESS);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, deployer);

    console.log("Contracts:");
    console.log("- AgentPay:", AGENTPAY_ADDRESS);
    console.log("- USDC:", USDC_ADDRESS);
    console.log("- Netflix Recipient:", NETFLIX_WALLET);

    // Check USDC balance
    const balance = await usdc.balanceOf(deployer.address);
    console.log("\n💰 USDC Balance:", ethers.formatUnits(balance, 6), "USDC");

    if (balance < ethers.parseUnits("5", 6)) {
        console.log("⚠️ Insufficient USDC balance. Need at least 5 USDC for testing.");
        return;
    }

    // Approve AgentPay to spend USDC (only what we need)
    console.log("\n1️⃣ Approving USDC for AgentPay...");
    const approveAmount = ethers.parseUnits("10", 6); // Approve 10 USDC max
    const approveTx = await usdc.approve(AGENTPAY_ADDRESS, approveAmount);
    await approveTx.wait();
    console.log("✅ Approved:", ethers.formatUnits(approveAmount, 6), "USDC");
    console.log("   Tx:", approveTx.hash);

    // Test 1: Immediate payment with payNow (2 USDC)
    console.log("\n2️⃣ Testing Immediate Payment (payNow)...");
    const immediateAmount = ethers.parseUnits("2", 6); // 2 USDC
    const payNowTx = await agentPay.payNow(
        NETFLIX_WALLET,
        immediateAmount,
        "Netflix - Immediate Payment Test"
    );
    const receipt1 = await payNowTx.wait();
    
    // Get subscription ID from event
    const payNowEvent = receipt1.logs.find(log => {
        try {
            return agentPay.interface.parseLog(log).name === "SubscriptionCreated";
        } catch { return false; }
    });
    const immediateSubId = payNowEvent ? agentPay.interface.parseLog(payNowEvent).args.subscriptionId : null;
    
    console.log("✅ Immediate payment executed!");
    console.log("   Subscription ID:", immediateSubId?.toString());
    console.log("   Amount:", ethers.formatUnits(immediateAmount, 6), "USDC");
    console.log("   Tx:", payNowTx.hash);

    // Test 2: Schedule single future payment (1.5 USDC) - will NOT be executed
    console.log("\n3️⃣ Testing Single Scheduled Payment...");
    const futureDate = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
    const scheduledAmount = ethers.parseUnits("1.5", 6); // 1.5 USDC
    
    const scheduleTx = await agentPay.schedulePayment(
        NETFLIX_WALLET,
        scheduledAmount,
        futureDate,
        "Netflix - Future Payment Test"
    );
    const receipt2 = await scheduleTx.wait();
    
    const scheduleEvent = receipt2.logs.find(log => {
        try {
            return agentPay.interface.parseLog(log).name === "SubscriptionCreated";
        } catch { return false; }
    });
    const scheduledSubId = scheduleEvent ? agentPay.interface.parseLog(scheduleEvent).args.subscriptionId : null;
    
    console.log("✅ Payment scheduled!");
    console.log("   Subscription ID:", scheduledSubId?.toString());
    console.log("   Amount:", ethers.formatUnits(scheduledAmount, 6), "USDC");
    console.log("   Payment Date:", new Date(futureDate * 1000).toLocaleString());
    console.log("   Tx:", scheduleTx.hash);
    console.log("   Note: This will NOT execute now (scheduled for future)");

    // Test 3: Batch schedule multiple payments (3 x 0.5 USDC = 1.5 USDC total)
    console.log("\n4️⃣ Testing Batch Scheduled Payments (Recurring)...");
    const startDate = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
    const monthlyAmount = ethers.parseUnits("0.5", 6); // 0.5 USDC per month
    const intervalDays = 30; // Monthly
    const paymentCount = 3; // 3 months only
    
    const batchTx = await agentPay.batchSchedulePayments(
        NETFLIX_WALLET,
        monthlyAmount,
        startDate,
        intervalDays,
        paymentCount,
        "Netflix Monthly"
    );
    const receipt3 = await batchTx.wait();
    console.log("✅ Batch payments scheduled!");
    console.log("   Count:", paymentCount, "payments");
    console.log("   Amount:", ethers.formatUnits(monthlyAmount, 6), "USDC each");
    console.log("   Total scheduled:", ethers.formatUnits(monthlyAmount * BigInt(paymentCount), 6), "USDC");
    console.log("   Interval:", intervalDays, "days");
    console.log("   Start Date:", new Date(startDate * 1000).toLocaleString());
    console.log("   Tx:", batchTx.hash);
    console.log("   Note: These will NOT execute now (scheduled for future)");

    // Test 4: View all subscriptions
    console.log("\n5️⃣ Fetching All User Subscriptions...");
    const allSubs = await agentPay.getUserSubscriptions(deployer.address);
    console.log("✅ Total subscriptions:", allSubs.length);

    // Display all subscription details
    console.log("\n📋 Subscription Details:");
    for (let i = 0; i < allSubs.length; i++) {
        const subId = allSubs[i];
        const sub = await agentPay.getSubscription(subId);
        console.log(`\n   [${i + 1}] Subscription #${subId}:`);
        console.log(`       Recipient: ${sub.recipient}`);
        console.log(`       Amount: ${ethers.formatUnits(sub.amount, 6)} USDC`);
        console.log(`       Date: ${new Date(Number(sub.paymentDate) * 1000).toLocaleString()}`);
        console.log(`       Status: ${sub.paid ? '✅ PAID' : sub.cancelled ? '❌ CANCELLED' : '⏳ PENDING'}`);
        console.log(`       Description: ${sub.description}`);
    }

    // Test 5: Check execution status
    if (scheduledSubId) {
        console.log("\n6️⃣ Checking Execution Status...");
        const canExecute = await agentPay.canExecute(scheduledSubId);
        console.log("   Scheduled payment (ID:", scheduledSubId.toString(), ")");
        console.log("   Can execute now?", canExecute);
        
        if (!canExecute) {
            console.log("   ⏰ Payment not yet due. Will be executable after:");
            console.log("      ", new Date(futureDate * 1000).toLocaleString());
        }
    }

    // Test 6: Cancel the single scheduled payment (to save USDC)
    if (scheduledSubId) {
        console.log("\n7️⃣ Testing Cancellation...");
        try {
            const cancelTx = await agentPay.cancelSubscription(scheduledSubId);
            await cancelTx.wait();
            console.log("✅ Subscription cancelled!");
            console.log("   ID:", scheduledSubId.toString());
            console.log("   Tx:", cancelTx.hash);
            console.log("   Saved:", ethers.formatUnits(scheduledAmount, 6), "USDC");
        } catch (error) {
            console.log("⚠️ Cancel failed:", error.message);
        }
    }

    // Test 7: Get pending subscriptions
    console.log("\n8️⃣ Checking Pending Subscriptions...");
    const pendingSubs = await agentPay.getPendingSubscriptions(deployer.address);
    console.log("   Pending (ready to execute):", pendingSubs.length);
    if (pendingSubs.length === 0) {
        console.log("   ✅ No pending payments (all are scheduled for future)");
    }

    // Test 8: Get total stats
    console.log("\n9️⃣ Contract Statistics...");
    const totalSubs = await agentPay.getTotalSubscriptions();
    console.log("   Total subscriptions created:", totalSubs.toString());

    // Final balance check
    const finalBalance = await usdc.balanceOf(deployer.address);
    const spent = balance - finalBalance;
    
    console.log("\n💸 Payment Summary:");
    console.log("====================================");
    console.log("   Initial Balance:", ethers.formatUnits(balance, 6), "USDC");
    console.log("   Final Balance:", ethers.formatUnits(finalBalance, 6), "USDC");
    console.log("   Actually Spent:", ethers.formatUnits(spent, 6), "USDC");
    console.log("   Scheduled (future):", ethers.formatUnits(monthlyAmount * BigInt(paymentCount), 6), "USDC");
    console.log("   Cancelled (saved):", ethers.formatUnits(scheduledAmount, 6), "USDC");
    console.log("====================================");

    console.log("\n✅ All tests completed successfully!");
    console.log("===================================================\n");

    console.log("📝 What was tested:");
    console.log("   ✓ Immediate payment (payNow) - 2 USDC spent");
    console.log("   ✓ Single scheduled payment - Created then cancelled");
    console.log("   ✓ Batch recurring payments - 3 payments scheduled");
    console.log("   ✓ View subscriptions - Listed all");
    console.log("   ✓ Cancel subscription - Tested cancellation");
    console.log("   ✓ Check execution status - Verified logic");
    console.log("   ✓ Get statistics - Retrieved contract stats\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });