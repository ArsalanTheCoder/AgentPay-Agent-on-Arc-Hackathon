// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}


/**
 * @title AgentPay Scheduled Payments
 * @notice Simple scheduled USDC payments on Arc blockchain
 * @dev AI agent creates multiple schedules for "recurring" effect
 */
contract AgentPayScheduledPayments {
    
    IERC20 public immutable USDC;

    // Errors
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidDate();
    error InsufficientBalance();
    error TransferFailed();
    error SubscriptionNotFound();
    error NotYetDue();
    error AlreadyPaid();
    error Unauthorized();

    // Events
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 paymentDate,
        string description
    );

    event PaymentExecuted(
        uint256 indexed subscriptionId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event SubscriptionCancelled(
        uint256 indexed subscriptionId,
        address indexed payer
    );

    // Subscription Data
    struct Subscription {
        address payer;
        address recipient;
        uint256 amount;
        uint256 paymentDate;
        bool paid;
        bool cancelled;
        string description; // "Netflix Nov 2025"
    }

    // State
    uint256 private subCounter;
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256[]) public userSubscriptions;

    // USDC ERC-20 contract on Arc Testnet
    // Get actual address from: https://docs.arc.network/arc/references/contract-addresses
    constructor(address _usdc) {
        if (_usdc == address(0)) revert InvalidRecipient();
        USDC = IERC20(_usdc);
    }

    /**
     * @notice Create scheduled payment (AI creates multiple for "recurring")
     * @param recipient Who receives the payment
     * @param amount How much USDC to send
     * @param paymentDate When to send (unix timestamp)
     * @param description Payment description for receipts
     * @return subscriptionId The created subscription ID
     */
    function schedulePayment(
        address recipient,
        uint256 amount,
        uint256 paymentDate,
        string calldata description
    ) external returns (uint256 subscriptionId) {
        // Validate inputs
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (paymentDate <= block.timestamp) revert InvalidDate();

        // Create subscription
        subCounter++;
        subscriptionId = subCounter;

        subscriptions[subscriptionId] = Subscription({
            payer: msg.sender,
            recipient: recipient,
            amount: amount,
            paymentDate: paymentDate,
            paid: false,
            cancelled: false,
            description: description
        });

        userSubscriptions[msg.sender].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            msg.sender,
            recipient,
            amount,
            paymentDate,
            description
        );
    }

   function payNow(
    address recipient,
    uint256 amount,
    string calldata description
) external returns (uint256 subscriptionId) {
    // Validate inputs
    if (recipient == address(0)) revert InvalidRecipient();
    if (amount == 0) revert InvalidAmount();

    // Check balance
    if (USDC.balanceOf(msg.sender) < amount) revert InsufficientBalance();

    // Create subscription record
    subCounter++;
    subscriptionId = subCounter;

    subscriptions[subscriptionId] = Subscription({
        payer: msg.sender,
        recipient: recipient,
        amount: amount,
        paymentDate: block.timestamp,
        paid: true, // Marked as paid immediately
        cancelled: false,
        description: description
    });

    userSubscriptions[msg.sender].push(subscriptionId);

    // Execute USDC transfer
    bool success = USDC.transferFrom(msg.sender, recipient, amount);
    if (!success) revert TransferFailed();

    emit SubscriptionCreated(
        subscriptionId,
        msg.sender,
        recipient,
        amount,
        block.timestamp,
        description
    );

    emit PaymentExecuted(
        subscriptionId,
        msg.sender,
        recipient,
        amount,
        block.timestamp
    );
}

    /**
     * @notice Execute the scheduled payment (anyone can call when due)
     * @param subscriptionId The subscription to execute
     */
    function executePayment(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];

        // Validate
        if (sub.payer == address(0)) revert SubscriptionNotFound();
        if (sub.paid) revert AlreadyPaid();
        if (sub.cancelled) revert Unauthorized();
        if (block.timestamp < sub.paymentDate) revert NotYetDue();

        // Check balance
        if (USDC.balanceOf(sub.payer) < sub.amount) revert InsufficientBalance();

        // Mark as paid first (reentrancy protection)
        sub.paid = true;

        // Execute USDC transfer
        bool success = USDC.transferFrom(sub.payer, sub.recipient, sub.amount);
        if (!success) revert TransferFailed();

        emit PaymentExecuted(
            subscriptionId,
            sub.payer,
            sub.recipient,
            sub.amount,
            block.timestamp
        );
    }

    /**
     * @notice Cancel a scheduled payment (only payer)
     * @param subscriptionId The subscription to cancel
     */
    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];

        if (sub.payer == address(0)) revert SubscriptionNotFound();
        if (sub.payer != msg.sender) revert Unauthorized();
        if (sub.paid) revert AlreadyPaid();

        sub.cancelled = true;

        emit SubscriptionCancelled(subscriptionId, msg.sender);
    }

    /**
     * @notice Batch create multiple scheduled payments (for recurring setup)
     * @param recipient Payment recipient
     * @param amount Amount per payment
     * @param startDate First payment date
     * @param intervalDays Days between payments (30 = monthly)
     * @param count How many payments to schedule
     * @param description Base description
     */
    function batchSchedulePayments(
        address recipient,
        uint256 amount,
        uint256 startDate,
        uint256 intervalDays,
        uint256 count,
        string calldata description
    ) external returns (uint256[] memory subscriptionIds) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (startDate <= block.timestamp) revert InvalidDate();
        if (count == 0 || count > 24) revert InvalidAmount(); // Max 2 years

        subscriptionIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            subCounter++;
            uint256 subId = subCounter;
            uint256 paymentDate = startDate + (i * intervalDays * 1 days);

            subscriptions[subId] = Subscription({
                payer: msg.sender,
                recipient: recipient,
                amount: amount,
                paymentDate: paymentDate,
                paid: false,
                cancelled: false,
                description: string(abi.encodePacked(description, " #", _toString(i + 1)))
            });

            userSubscriptions[msg.sender].push(subId);
            subscriptionIds[i] = subId;

            emit SubscriptionCreated(
                subId,
                msg.sender,
                recipient,
                amount,
                paymentDate,
                subscriptions[subId].description
            );
        }
    }

    /**
     * @notice Check if payment is ready to execute
     */
    function canExecute(uint256 subscriptionId) external view returns (bool) {
        Subscription memory sub = subscriptions[subscriptionId];
        
        if (sub.payer == address(0) || sub.paid || sub.cancelled) return false;
        return block.timestamp >= sub.paymentDate;
    }

    /**
     * @notice Get subscription details
     */
    function getSubscription(uint256 subscriptionId) 
        external 
        view 
        returns (
            address payer,
            address recipient,
            uint256 amount,
            uint256 paymentDate,
            bool paid,
            bool cancelled,
            string memory description
        ) 
    {
        Subscription memory sub = subscriptions[subscriptionId];
        if (sub.payer == address(0)) revert SubscriptionNotFound();
        
        return (
            sub.payer,
            sub.recipient,
            sub.amount,
            sub.paymentDate,
            sub.paid,
            sub.cancelled,
            sub.description
        );
    }

    /**
     * @notice Get all subscriptions for a user
     */
    function getUserSubscriptions(address user) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    /**
     * @notice Get pending (unpaid, uncancelled, due soon) subscriptions
     */
    function getPendingSubscriptions(address user) external view returns (uint256[] memory) {
        uint256[] memory allSubs = userSubscriptions[user];
        uint256 count = 0;

        // Count pending
        for (uint256 i = 0; i < allSubs.length; i++) {
            Subscription memory sub = subscriptions[allSubs[i]];
            if (!sub.paid && !sub.cancelled && block.timestamp >= sub.paymentDate) {
                count++;
            }
        }

        // Build array
        uint256[] memory pending = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allSubs.length; i++) {
            Subscription memory sub = subscriptions[allSubs[i]];
            if (!sub.paid && !sub.cancelled && block.timestamp >= sub.paymentDate) {
                pending[index] = allSubs[i];
                index++;
            }
        }

        return pending;
    }

    /**
     * @notice Get total subscriptions created
     */
    function getTotalSubscriptions() external view returns (uint256) {
        return subCounter;
    }

    // Helper: uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}