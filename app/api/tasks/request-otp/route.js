import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function POST(req) {
  await connectDB();

  const { taskId } = await req.json();

  const task = await Task.findById(taskId);

  if (!task || task.status !== "accepted") {
    return NextResponse.json(
      { message: "Invalid task" },
      { status: 400 }
    );
  }

  task.is_requested = true;
  await task.save();

  return NextResponse.json({ success: true });
}
