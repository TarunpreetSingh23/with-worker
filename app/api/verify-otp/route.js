import { SignJWT } from "jose";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Otp from "@/models/Otp";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-this"
);

export async function POST(req) {
  try {
    const { phone, otp } = await req.json();
    
    // Normalize to 10 digits to match the OTP record
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
console.log(normalizedPhone)
    await connectDB();

    // 1. Find the OTP record
    const record = await Otp.findOne({ phone: normalizedPhone });

    if (!record) {
      return Response.json({ error: "OTP record not found" }, { status: 400 });
    }

    // 2. Check Expiration
    if (Date.now() > record.expiresAt.getTime()) {
      await Otp.deleteOne({ _id: record._id });
      return Response.json({ error: "OTP has expired" }, { status: 400 });
    }

    // 3. Verify OTP Match
    if (record.otp !== String(otp)) {
      return Response.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // 4. Cleanup: Delete the OTP record after successful verification
    await Otp.deleteOne({ _id: record._id });

    /**
     * 🛠️ REMOVED: Database User lookup/creation
     * We proceed directly to session creation using the verified phone number.
     */

    // 5. Generate JWT Session
    const token = await new SignJWT({
      phone: normalizedPhone,
      verifiedAt: new Date().toISOString(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // Session valid for 30 days
      .sign(SECRET);

    // 6. Set Secure HTTP-Only Cookie
    const cookieStore = cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    });

    return Response.json({ 
      success: true, 
      message: "Session established successfully" 
    });

  } catch (err) {
    console.error("Verification Error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}