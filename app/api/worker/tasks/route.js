import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import Worker from "@/models/Worker";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  try {
    // 1. Create the new task
    const task = new Task(body);

    // 2. Detect prefix based on category
    const category = body.cart?.[0]?.category?.toLowerCase() || "";
    let prefix = "OR";
    if (category === "makeup") prefix = "MU";
    else if (category === "decor") prefix = "ED";
    else if (category === "cleaning") prefix = "CL";

    // 3. Find all workers with matching prefix
    const workers = await Worker.find({ workerId: new RegExp(`^${prefix}`) });

    // 4. Assign all workers to the task
    task.assignedWorkers = workers.map((w) => ({
      workerId: w.workerId,
      status: "Pending",
    }));

    // 5. Save the task
    await task.save();

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err) {
    console.error("Error creating task:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create task" },
      { status: 500 }
    );
  }
}
