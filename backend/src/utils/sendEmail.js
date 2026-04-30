// এখানে nodemailer-এর কোনো দরকার নেই, তাই সেটাকে বাদ দেওয়া হয়েছে।

const sendEmail = async (options) => {
  const brevoApiKey = process.env.BREVO_API_KEY; // Render থেকে এই API Key টা নেবে
  const senderEmail = process.env.EMAIL_USER; // Render-এ থাকা তোমার জিমেইল আইডি

  try {
    // সরাসরি ইন্টারনেটের (HTTP) মাধ্যমে Brevo-কে ইমেইল পাঠাতে বলা হচ্ছে
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: { name: "Orbito App", email: senderEmail },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #10B981;">Welcome to Orbito!</h2>
                        <p style="font-size: 16px; color: #333;">${options.message}</p>
                      </div>`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("❌ Brevo API Error:", errorData);
      throw new Error('Failed to send email via Brevo');
    }

    console.log("✅ Email sent successfully via Brevo API!");
  } catch (error) {
    console.error("🚨 Email Sending Failed:", error);
    throw error; // এই এররটা তোমার authController-এর catch ব্লকে চলে যাবে
  }
};

module.exports = sendEmail;