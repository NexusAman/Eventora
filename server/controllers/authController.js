import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/email.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`OTP for ${email}: ${otpCode}`);

    await Otp.deleteMany({ email, type: "account_verification" });

    await Otp.create({
      email,
      otp: otpCode,
      type: "account_verification",
    });

    await sendOtpEmail(email, otpCode, "account_verification");

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("Email received:", email);
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      await Otp.deleteMany({ email, type: "account_verification" });

      console.log(`OTP for ${email}: ${otpCode}`);

      await Otp.create({
        email,
        otp: otpCode,
        type: "account_verification",
      });

      await sendOtpEmail(email, otpCode, "account_verification");

      return res.status(403).json({
        message: "Account not verified. OTP sent to email.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({
      email,
      otp,
      type: "account_verification",
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Otp.deleteOne({
      email,
      otp,
      type: "account_verification",
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
