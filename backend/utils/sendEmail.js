const nodemailer = require("nodemailer");

const sendEmail = async (to,username) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,       // your Gmail address
      pass: process.env.GMAIL_APP_PASS,   // the app password (not your Gmail password)
    },
  });

  const subject = `Welcome to Master of Keys, ${username}! 🧠💻 Unlock Your Typing Superpower`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #3f51b5; text-align: center;">Welcome to Master of Keys! 🔑</h1>
        <p style="font-size: 16px;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 16px;">
          We're thrilled to have you on board! Master of Keys (MOK) is your personal gateway to becoming a typing maestro. Track your progress, join competitive rooms, practice daily, and level up your skills — one keystroke at a time.
        </p>
        <p style="font-size: 16px;">
          🚀 Ready to begin? Head over to your dashboard and start your first session.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://yourwebsite.com/dashboard" style="background-color: #3f51b5; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">If you didn’t sign up for Master of Keys, you can safely ignore this email.</p>
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

module.exports = sendEmail;

// const nodemailer = require("nodemailer");

// const sendEmail = async (to, subject, html) => {
//   // Looking to send emails in production? Check out our Email API/SMTP product!
//   const transport = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: process.env.MAILTRAP_USER,
//       pass: process.env.MAILTRAP_PASS,
//     },
//   });

//   const mailOptions = {
//     // from: `"Master of Keys" <${process.env.EMAIL_USER}>`,
//     from:`Master of Keys !!!`,
//     to,
//     subject,
//     html,
//   };

//   await transport.sendMail(mailOptions);
// };

// module.exports = sendEmail;