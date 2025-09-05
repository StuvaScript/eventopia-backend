require("dotenv").config();
const nodemailer = require("nodemailer");
const { BadRequestError } = require("../errors/bad_request");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
});

const sendEmail = async ({
  to,
  subject,
  message,
  replyTo = "noreply@gmail.com",
}) => {
  const mailOptions = {
    from: `"No Reply" <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    text: message,
    replyTo,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new BadRequestError("Error sending email. Please try again later.");
  }
};

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection failed:", error.message);
  } else {
  }
});

// test
// (async () => {
//     try {
//         await sendEmail({
//             to: 'sisiwang242@gmail.com',
//             subject: 'Password Reset Request',
//             message: 'Click the link to reset your password.',
//         });
//     } catch (error) {
//         console.error("Email sending failed:", error.message);
//     }
// })();

module.exports = {
  sendEmail,
};
