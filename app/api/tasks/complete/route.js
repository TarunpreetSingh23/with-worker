import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function POST(req) {
  await connectDB();

  const { orderId } = await req.json();

  const task = await Task.findOne({ order_id: orderId }); // ✅ FIX

  if (!task || task.status !== "In Progress") {
    return NextResponse.json(
      { message: "Task not in progress" },
      { status: 400 }
    );
  }

  task.status = "Completed";
  await task.save();

  return NextResponse.json({ success: true });
}
