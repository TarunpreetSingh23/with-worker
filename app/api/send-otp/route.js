import twilio from "twilio";
import connectDB from "@/lib/mongodb";

import Otp from "@/models/Otp";


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const normalizePhone = (phone) =>
  phone.replace("whatsapp:", "").replace(/\D/g, "").slice(-10);

console.log(normalizePhone);
export async function POST(req) {
  const { phone } = await req.json();

  if (!phone) {
    return Response.json({ error: "Phone required" }, { status: 400 });
  }
  await connectDB();

  const normalizedPhone = normalizePhone(phone);
  const otp = Math.floor(100000 + Math.random() * 900000);
 // Remove old OTPs
  await Otp.deleteMany({ phone: normalizedPhone });

  // Save new OTP
  await Otp.create({
    phone: normalizedPhone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  console.log("OTP SAVED IN DB:", normalizedPhone, otp);


  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:+91${normalizedPhone}`,
    body: `🔐 Your login OTP is ${otp}. It expires in 5 minutes.`,
  });

  return Response.json({ success: true });
}
