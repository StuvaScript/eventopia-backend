require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // provider's SMTP server
  port: 587,
  secure: true, // Use true for TLS
  auth: {
    user: `HHTeamOne@gmail.com`,
    pass: process.env.EMAILPASSWORD,
  },
});

const shareEventEmail = {
  from: "HHTeamOne@gmail.com",
  to: recipientEmail,
  subject: "Check Out this Event",
  html: "<h1>Hey there!</h1><p>Take a look at this event I found on .....</p>",
};

transporter.sendMail(shareEventEmail, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});