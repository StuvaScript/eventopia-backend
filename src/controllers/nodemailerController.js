require("dotenv").config();
const nodemailer = require("nodemailer");
const { StatusCodes } = require("http-status-codes");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // provider's SMTP server
  port: 587,
  secure: true, // Use true for TLS
  auth: {
    user: `HHTeamOne@gmail.com`,
    pass: process.env.EMAILPASSWORD,
  },
});
const shareEvent = async (req, res) => {
  const { recipientEmail, eventDetails, userName } = req.body;

  const shareEventEmail = {
    from: "HHTeamOne@gmail.com",
    to: recipientEmail,
    subject: "Check Out this Event",
    html: `
          <h1>Hey there!</h1>
          <p>${userName} wanted to share this event with you:</p>
          <h2>${eventDetails.name}</h2>
          <p>Date: ${eventDetails.date}</p>
          <p>Location: ${eventDetails.location.address}, ${
            eventDetails.location.city
            }, ${eventDetails.location.state}</p>
          <p>Details: ${eventDetails.info || ""}</p>
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
