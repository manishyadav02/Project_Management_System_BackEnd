import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import ErrorHandler from "../middlewares/error.js";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";
import {
  generateForgotPasswordTemplate,
  generateWelcomeTemplate,
} from "../utils/emailTamplates.js";

// REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = new User({ name, email, password, role });
  await user.save();

  // ✨ NEW: Send the Welcome Email!
  try {
    const message = generateWelcomeTemplate(user.name, user.role);

    // We send the email without blocking the registration process!
    await sendEmail({
      to: user.email,
      subject: "[PMS] 🎉 Welcome to Project Management System!",
      message,
    });
  } catch (error) {
    // We just log the error so the server doesn't crash.
    // The user will still be registered successfully!
    console.error("Welcome email failed to send:", error.message);
  }

  // Finally, generate token and send success response to the frontend
  generateToken(user, 201, "User registered successfully", res);
});

// LOGIN USER
export const login = asyncHandler(async (req, res) => {
  console.log("Login request body:", req.body);
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  const user = await User.findOne({ email, role }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  generateToken(user, 200, "Logged in successfully", res);
});

// GET USER
export const getUser = asyncHandler(async (req, res) => {
  const user = req.user; // FIX: Changed 'User' to 'user' to avoid conflict with Model
  res.status(200).json({
    success: true,
    user: user,
  });
});

// LOGOUT
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// FORGOT PASSWORD
export const forgotPassword = asyncHandler(async (req, res, next) => {
  // Added next
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // FIX: actually throw the error
    return next(new ErrorHandler("User not found", 404));
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const message = generateForgotPasswordTemplate(user.name, resetPasswordUrl);

  try {
    await sendEmail({
      to: user.email,
      subject: "🔐 Password Reset Request",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    // FIX: Use next for error handling consistency
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

// RESET PASSWORD
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Invalid or expired password reset token", 400),
    );
  }

  if (!req.body.password || !req.body.confirmPassword) {
    return next(
      new ErrorHandler("Please provide password and confirm password", 400),
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm password do not match", 400),
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
