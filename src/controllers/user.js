const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/bad_request");
const { UnauthenticatedError } = require("../errors/unauthenticated");
const { NotFoundError } = require("../errors/not_found");
const { sendEmail } = require('../utils/emails');


const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    console.log("created user:", user);

    res.status(StatusCodes.CREATED).json({
      user: { id: user._id, name: `${user.firstName} ${user.lastName}` }, // <-- added "id: user._id,"
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: "Email already exist" });
    } else {
      console.error("Registration Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Registration failed" });
    }
  }
};

const login = async (req, res, next) => {

  console.log("login request body:", req.body);
  console.log("login request email:", req.body.email);
  console.log("login request password:", req.body.password);
  console.log("request:", req);

  try {
    const { email, password } = req.body;
    // check if email and password are provided
    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }
    // find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("Found user:", user);


    if (!user) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    // compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    console.log("Found user:", user);
    // generate JWT token and response
    const token = user.createJWT();
    console.log("Generated Jwt token:", token);
    res.cookie("token", token);
    res.status(StatusCodes.OK).json({
      user: { id: user._id, name: `${user.firstName} ${user.lastName}`, city: user.city, state: user.state }, // <-- added "id: user._id,"
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Request password rest (Send email with reset token)
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  console.log("Email received:", email);
  
  if (!email) {
    throw new BadRequestError("Please provide an email address.");
  }
  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User with this email does not exist.");
  }
  // generate a rest token (secure token)
  const resetToken = crypto.randomBytes(20).toString('hex');
  // set reset token and expiration date (e.g., 1 hour)

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour

  try {
    await User.updateOne(
      { _id: user._id},
      {
        passwordResetToken: resetToken,
        passwordResetExpires: Date.now() + 3600000,
      }
    );
    console.log("Password reset token and expiration updated successfully.");
  } catch (error) {
    console.error("Error updating password reset info:", error);
  }

  console.log("User document after save:", user);

  // send email with reset token 
  const resetUrl = 'http://localhost:5173/resetpassword/';
  // const resetUrl = `http://localhost:8000/api/v1/user/reset-password/${resetToken}`;
  const message = `Click the following link to reset your password: ${resetUrl}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      message,
    });
    res.status(StatusCodes.OK).json({ msg: 'Password reset email sent' });
  } catch (error) {
    throw new BadRequestError('Error sending password reset email');
  }
};

// Reset password 
const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  console.log("Received resetToken:", resetToken);
  console.log("Received newPassword:", newPassword);

  if (!resetToken || !newPassword) {
    throw new BadRequestError("Please provide a valid token and new password")
  }
  // find user with the reset token
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log("Current time:", Date.now());

  console.log("Database stored resetToken:", user ? user.passwordResetToken : null);
  console.log("Database stored passwordResetExpires:", user ? user.passwordResetExpires : null);

  
  if (!user) {
    throw new NotFoundError("Invalid or expired password reset token.");
  }

  console.log("User found, resetting password...");

  // hash the new password
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  try {
    await user.save();  // Save the updated user document
    res.status(StatusCodes.OK).json({ msg: 'Password reset successful' });
  } catch (error) {
    console.error("Error saving user after password reset:", error);
    throw new BadRequestError("Error saving new password");
  }
}


module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};