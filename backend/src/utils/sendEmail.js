const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (Setup for Gmail here, but you can use SendGrid/Mailgun)
 const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // 🚀 লাইভ সার্ভারের SSL ইস্যু সলভ করার জন্য এটা মাস্ট
      rejectUnauthorized: false 
    },
    family: 4
  });

  // 2. Define the email options
  const mailOptions = {
    from: `"Orbito App" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can also send beautiful HTML emails later
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;