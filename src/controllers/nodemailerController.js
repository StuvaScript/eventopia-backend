require("dotenv").config();
const nodemailer = require("nodemailer");
const { StatusCodes } = require("http-status-codes");

const transporter = nodemailer.createTransport({
  host: `${process.env.SMTP_HOST}`,
  port: process.env.SMTP_PORT,
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

const shareEvent = async (req, res) => {
  const { recipientEmail, eventDetails, userName } = req.body;

  const shareEventEmail = {
    from: `"No Reply" <${process.env.SENDER_EMAIL}>`,
    to: recipientEmail,
    subject: `${userName} Shared an Event with You`,
    html: `
          <h1>Hey there!</h1>
          <p>${userName} thinks you might be interested in this event:</p>
          <h2>${eventDetails.name}</h2>
          <p>Date: ${eventDetails.date}</p>
          <p>Location: ${eventDetails.location.address}, ${
      eventDetails.location.city
    }, ${eventDetails.location.state}</p>
          <p>Details: ${eventDetails.info || ""}</p>
          <p>Want to find events of your own? Check us out <a href="https://hh-team1-front.onrender.com/">here</a>.</p>
          `,
  };

  try {
    const info = await transporter.sendMail(shareEventEmail);
    res.status(StatusCodes.OK).json({
      message: "Email sent successfully",
      info: info.response,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error sending email",
      error: error.message,
    });
  }
};

module.exports = { shareEvent };
