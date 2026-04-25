const Razorpay = require('razorpay');
const crypto = require('crypto');

// Razorpay কনফিগারেশন (তোমার Key ID আর Secret এখানে বসাবে)
const razorpay = new Razorpay({
  key_id: 'rzp_test_Sh04Zw4yuPq0ZJ', 
  key_secret: 'jQIszWFfo99EM91ee1qrEwpa',
});

// ১. পেমেন্ট অর্ডার তৈরি করা
exports.createOrder = async (req, res) => {
  const { amount } = req.body;
  
  try {
    const options = {
      amount: amount * 100, // পয়সাতে হিসেব হয় (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error: error.message });
  }
};

// ২. পেমেন্ট ভেরিফাই করা (পেমেন্ট সফল হলে সিগনেচার চেক করা)
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const hmac = crypto.createHmac('sha256', 'YOUR_RAZORPAY_KEY_SECRET');
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    res.status(200).json({ message: "Payment verified successfully", success: true });
  } else {
    res.status(400).json({ message: "Invalid signature, payment failed", success: false });
  }
};