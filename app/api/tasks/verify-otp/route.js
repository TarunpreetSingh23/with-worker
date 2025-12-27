import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function POST(req) {
  await connectDB();

  const { orderId, otp } = await req.json();

  const task = await Task.findOne({ order_id: orderId });

  if (!task || !task.serviceOtp?.code) {
    return NextResponse.json(
      { message: "Task or OTP not found" },
      { status: 400 }
    );
  }

  if (task.serviceOtp.verified) {
    return NextResponse.json(
      { message: "OTP already verified" },
      { status: 400 }
    );
  }

  if (task.serviceOtp.code !== otp) {
    return NextResponse.json(
      { message: "Invalid OTP" },
      { status: 400 }
    );
  }

  // ✅ OTP matches
  task.serviceOtp.verified = true;
  task.status = "In Progress";

  await task.save();

  return NextResponse.json({
    success: true,
    message: "OTP verified successfully",
  });
}
