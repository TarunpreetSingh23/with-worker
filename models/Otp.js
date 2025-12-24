// models/Otp.js
import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: { type: String },
  email: { type: String },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
