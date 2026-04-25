const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (Setup for Gmail here, but you can use SendGrid/Mailgun)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your App Password (not your main password)
    }
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Campus Super App <noreply@campussuperapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can also send beautiful HTML emails later
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;