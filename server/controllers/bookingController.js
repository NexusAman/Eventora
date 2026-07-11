import Booking from "../models/Booking.js";
import Otp from "../models/Otp.js";
import Event from "../models/Event.js";
import { sendBookingConfirmationEmail, sendOtpEmail } from "../utils/email.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for booking
export const sendBookingOtp = async (req, res) => {
  try {
    const otp = generateOtp();

    await Otp.findOneAndDelete({
      email: req.user.email,
      type: "event_booking",
    });

    await Otp.create({
      email: req.user.email,
      otp,
      type: "event_booking",
    });

    await sendOtpEmail(req.user.email, otp, "event_booking");

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// Book Event
export const bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    const otpRecord = await Otp.findOne({
      email: req.user.email,
      otp,
      type: "event_booking",
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
      status: { $ne: "cancelled" },
    });

    console.log("Existing Booking:", existingBooking);

    if (existingBooking) {
      return res.status(400).json({
        message: "You already have an active booking for this event.",
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketPrice,
    });

    await Otp.deleteMany({
      email: req.user.email,
      type: "event_booking",
    });

    res.status(201).json({
      message: "Booking created. Waiting for confirmation.",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error booking event" });
  }
};

// Confirm Booking (Admin)
export const confirmBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { paymentStatus } = req.body;

    if (!["paid", "not_paid"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({ message: "Booking already confirmed" });
    }

    const event = booking.eventId;

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    booking.status = "confirmed";
    booking.paymentStatus = paymentStatus;

    await booking.save();

    event.availableSeats -= 1;
    await event.save();

    await sendBookingConfirmationEmail(
      booking.userId.email,
      booking.userId.name,
      event.title,
    );

    res.status(200).json({ message: "Booking confirmed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error confirming booking" });
  }
};

// Get My Bookings
export const getMyBookings = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user._id };
    const bookingsQuery = Booking.find(query)
      .populate("eventId")
      .sort({ createdAt: -1 });

    if (req.user.role === "admin") {
      bookingsQuery.populate("userId", "name email");
    }

    const bookings = await bookingsQuery;

    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = booking.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    if (booking.status === "confirmed") {
      const event = booking.eventId;
      event.availableSeats += 1;
      await event.save();
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelling booking" });
  }
};
