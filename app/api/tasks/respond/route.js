import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function PATCH(request) {
  try {
    // Connect DB
    await connectDB();

    // Parse body
    const { taskId, workerId, action } = await request.json();

    // Fetch task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    console.log("Task fetched:", task);
    console.log("Assigned workers:", task.assignedWorkers);
    console.log("Type of assignedWorkers:", typeof task.assignedWorkers);
    console.log("Is array?", Array.isArray(task.assignedWorkers));

    // Find assigned worker using prefix match
    const workerEntry = task.assignedWorkers.find((w) => {
      console.log("Worker in task:", w.workerId);
      return w.workerId.startsWith(workerId);
    });

    if (!workerEntry) {
      return NextResponse.json(
        { success: false, message: "Worker not assigned" },
        { status: 403 }
      );
    }

    // Update worker status
    workerEntry.status = action === "accept" ? "accepted" : "rejected";

    if (action === "accept") {
      task.status = "accepted";
      task.is_approved = true;

      // Reject all other workers
      task.assignedWorkers.forEach((w) => {
        if (w.workerId !== workerEntry.workerId) {
          w.status = "rejected";
        }
      });
    } else if (action === "reject") {
      // Mark worker rejected
      workerEntry.status = "rejected";

      // If all rejected
      const allRejected = task.assignedWorkers.every(
        (w) => w.status === "rejected"
      );

      if (allRejected) {
        task.status = "rejected";
        task.is_rejected = true;
      }
    }

    await task.save();

    return NextResponse.json({ success: true, task });
  } catch (err) {
    console.error("Error updating task:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update task" },
      { status: 500 }
    );
  }
}
