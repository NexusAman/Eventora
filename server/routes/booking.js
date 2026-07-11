import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  bookEvent,
  sendBookingOtp,
  getMyBookings,
  confirmBooking,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", protect, bookEvent);
router.post("/send-otp", protect, sendBookingOtp);
router.get("/my", protect, getMyBookings);
router.put("/:id/confirm", protect, admin, confirmBooking);
router.delete("/:id", protect, cancelBooking);

export default router;
