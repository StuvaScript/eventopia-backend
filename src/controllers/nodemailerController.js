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

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  });
};

const shareEvent = async (req, res) => {
  const { recipientEmail, eventDetails, userName } = req.body;

  const shareEventEmail = {
    from: `"No Reply - Eventopia" <${process.env.SENDER_EMAIL}>`,
    to: recipientEmail,
    subject: `${userName} Shared an Event with You on Eventopia!`,
    html: `
          <h1>Hey there!</h1>
          <p>${userName} thinks you might be interested in this event:</p>
          <h2>${eventDetails.name}</h2>
          <p><strong>Date:</strong> ${formatDateTime(
            eventDetails.startDateTime
          )}</p>
          <p><strong>Location:</strong> ${eventDetails.venue.name}, ${
      eventDetails.venue.address
    }, ${eventDetails.venue.city}, ${eventDetails.venue.state}</p>
          <p><strong>Details:</strong> ${eventDetails.info || ""}</p>
          <p style="color: #808080; font-size: 0.8em">Want to find events of your own? Check Eventopia out <a href="https://hh-team1-front.onrender.com/">here</a>, or find us on <a href="https://www.facebook.com/">Facebook</a>, <a href="https://www.instagram.com/">Instagram</a>, or <a href="https://www.twitter.com/">X</a> (formerly known as Twitter).</p>
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
