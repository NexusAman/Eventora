import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["not_paid", "paid"],
      default: "not_paid",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
