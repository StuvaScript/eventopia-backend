const crypto = require("crypto");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/bad_request");
const { UnauthenticatedError } = require("../errors/unauthenticated");
const { NotFoundError } = require("../errors/not_found");
const { sendEmail } = require("../utils/emails");

const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
      user: { id: user._id, name: `${user.firstName} ${user.lastName}` }, // <-- added "id: user._id,"
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: "Email already exist" });
    } else if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      res.status(StatusCodes.BAD_REQUEST).json({ msg: messages.join(" ") });
    } else {
      console.error("Registration Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Registration failed" });
    }
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // check if email and password are provided
    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }
    // find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    // compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    // generate JWT token and response
    const token = user.createJWT();
    const expiresIn = process.env.JWT_EXPIRES_IN || 3600;
    res.cookie("token", token, {
      maxAge: parseInt(expiresIn) * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        city: user.city,
        state: user.state,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Request password rest (Send email with reset token)
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Please provide an email address.");
    }
    // check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError("User with this email does not exist.");
    }
    // generate a rest token (secure token)
    const resetToken = crypto.randomBytes(20).toString("hex");
    // set reset token and expiration date (e.g., 1 hour)
    await User.updateOne(
      { _id: user._id },
      {
        passwordResetToken: resetToken,
        passwordResetExpires: Date.now() + 3600000, // 1 hour
      },
    );

    // send email with reset token
    // CORS_ORIGIN is already the frontend's exact origin
    const frontendOrigin = process.env.CORS_ORIGIN;
    const resetUrl = `${frontendOrigin}/resetpassword/`;

    const message = `Click the following link to reset your password: ${resetUrl}${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      message,
    });

    res.status(StatusCodes.OK).json({ msg: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      throw new BadRequestError(
        "Please provide a valid token and new password",
      );
    }
    // find user with the reset token
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new NotFoundError("Invalid or expired password reset token.");
    }

    // assign the raw password; the pre("save") hook hashes it once
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // Save the updated user document
    res.status(StatusCodes.OK).json({ msg: "Password reset successful" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: messages.join(" ") });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
