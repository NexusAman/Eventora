import express from "express";
import {
  registerUser,
  loginUser,
  verifyOtp,
} from "../controllers/authController.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login an existing user
router.post("/login", loginUser);

// Verify OTP
router.post("/verify-otp", verifyOtp);

export default router;
