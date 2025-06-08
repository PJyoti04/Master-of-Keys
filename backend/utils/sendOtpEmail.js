const nodemailer = require("nodemailer");

const sendOtpEmail = async (to, otp) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const subject = "🔐 Your OTP for Password Reset - Master of Keys";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #3f51b5; text-align: center;">OTP Verification</h2>
        <p style="font-size: 16px;">You requested to reset your password.</p>
        <p style="font-size: 16px;">Use the following OTP to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #e3f2fd; color: #1e88e5; font-size: 24px; font-weight: bold; padding: 12px 24px; border-radius: 6px;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 14px; color: #666;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <p style="font-size: 14px; color: #999;">If you didn't request a password reset, you can ignore this email.</p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999;">© 2025 Master of Keys. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Master of Keys" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transport.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
