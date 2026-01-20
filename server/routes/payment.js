const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Payment } = require("../models/payment");

// Helper function to generate PayHere hash
const generatePayHereHash = (
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret
) => {
  // Convert amount to have exactly 2 decimal places
  const formattedAmount = Number(amount).toFixed(2);

  // First MD5 hash of merchant secret
  const md5MerchantSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  // Final MD5 hash
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${md5MerchantSecret}`;
  return crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();
};

// Generate payment hash
router.post("/get-hash", async (req, res) => {
  try {
    const { merchantId, orderId, amount, currency = "LKR" } = req.body;

    // Validate required fields
    if (!merchantId || !orderId || !amount) {
      const missingFields = [];
      if (!merchantId) missingFields.push("merchantId");
      if (!orderId) missingFields.push("orderId");
      if (!amount) missingFields.push("amount");

      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      return res.status(500).json({
        success: false,
        error: "Missing merchant secret configuration",
      });
    }

    const hash = generatePayHereHash(
      merchantId,
      orderId,
      amount,
      currency,
      merchantSecret
    );

    return res.status(200).json({
      success: true,
      hash,
    });
  } catch (error) {
    console.error("Error generating hash:", error);
    res.status(500).json({
      success: false,
      error: "Error generating payment hash",
    });
  }
});

// Verify PayHere hash
const verifyPayHereHash = (params, merchantSecret) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
  } = params;

  const md5MerchantSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const localHash = crypto
    .createHash("md5")
    .update(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        md5MerchantSecret
    )
    .digest("hex")
    .toUpperCase();

  return localHash === params.md5sig;
};

// Handle payment notification
router.post("/notify", async (req, res) => {
  try {
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    // Verify the payment notification
    if (!verifyPayHereHash(req.body, merchantSecret)) {
      return res.status(400).json({
        success: false,
        error: "Invalid hash",
      });
    }

    // Map PayHere status codes to our status values
    const statusMap = {
      2: "success",
      0: "pending",
      "-1": "cancelled",
      "-2": "failed",
      "-3": "chargedback",
    };

    // Create or update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: req.body.order_id },
      {
        paymentId: req.body.payment_id,
        amount: parseFloat(req.body.payhere_amount),
        currency: req.body.payhere_currency,
        status: statusMap[req.body.status_code] || "pending",
        userId: req.body.custom_1, // Assuming you pass userId in custom_1
        paymentMethod: req.body.method,
        cardHolderName: req.body.card_holder_name,
        cardNo: req.body.card_no,
      },
      { new: true, upsert: true }
    );

    // If payment is successful, you might want to update order status
    if (payment.status === "success") {
      // Add your order update logic here
      // Example: await Order.findOneAndUpdate({ orderId: req.body.order_id }, { status: 'paid' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing payment notification:", error);
    res.status(500).json({
      success: false,
      error: "Error processing payment notification",
    });
  }
});

module.exports = router;
