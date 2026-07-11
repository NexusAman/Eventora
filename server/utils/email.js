import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingConfirmationEmail = async (
  userEmail,
  userName,
  eventTitle,
) => {
  try {
    const mailOptions = {
      from: `"Eventora" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmation: ${eventTitle}`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:40px 0;">
        <div style="max-width:500px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0; font-size:24px;">Eventora</h1>
          </div>

          <div style="padding:30px; text-align:center;">
            <p style="font-size:16px; color:#555;">
              Hello ${userName},
            </p>
            <p style="font-size:16px; color:#555;">
              Your booking for <strong>${eventTitle}</strong> has been confirmed.
            </p>
          </div>

          <div style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} Eventora. All rights reserved.
          </div>

        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Booking confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error(
      `Error sending booking confirmation email to ${userEmail}:`,
      error,
    );
    throw new Error("Failed to send booking confirmation email");
  }
};

// Send OTP Email Function
export const sendOtpEmail = async (userEmail, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify your Eventora Account"
        : "Eventora Booking OTP";

    const msg =
      type === "account_verification"
        ? "Please use the following OTP to verify your Eventora account."
        : "Please use the following OTP to verify and confirm your event booking on Eventora.";

    const mailOptions = {
      from: `"Eventora" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: title,
      html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:40px 0;">
        <div style="max-width:500px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0; font-size:24px;">Eventora</h1>
          </div>

          <div style="padding:30px; text-align:center;">
            <p style="font-size:16px; color:#555;">
              ${msg}
            </p>

            <div style="margin:25px 0;">
              <span style="
                display:inline-block;
                font-size:32px;
                letter-spacing:6px;
                font-weight:bold;
                color:#4f46e5;
                background:#f1f5f9;
                padding:12px 24px;
                border-radius:8px;
              ">
                ${otp}
              </span>
            </div>

            <p style="font-size:14px; color:#777;">
              This OTP will expire in <strong>5 minutes</strong>.
            </p>
          </div>

          <div style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} Eventora. All rights reserved.
          </div>

        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`OTP email sent to ${userEmail} for ${type}`);
  } catch (error) {
    console.error(
      `Error sending OTP email to ${userEmail} for ${type}:`,
      error,
    );
    throw new Error("Failed to send OTP email");
  }
};
