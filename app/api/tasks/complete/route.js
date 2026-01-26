import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import Worker from "@/models/Worker";

export async function POST(req) {
  await connectDB();

  const { orderId } = await req.json();

  const task = await Task.findOne({ order_id: orderId });

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  // ✅ Prevent double completion
  if (task.status === "Completed") {
    return NextResponse.json({ message: "Task already completed" }, { status: 400 });
  }

  if (task.status !== "In Progress") {
    return NextResponse.json(
      { message: "Task not in progress" },
      { status: 400 }
    );
  }

  /* ================= CALCULATE WORKER EARNING ================= */

  // total earning from cart
  const totalEarning = task.cart.reduce((sum, item) => {
    return sum + (item.earning || 0) * (item.quantity || 1);
  }, 0);

  /* ================= UPDATE WORKERS ================= */

  // find accepted workers
  const acceptedWorkers = task.assignedWorkers.filter(
    (w) => w.status === "accepted" || w.status === "In Progress"
  );
console.log(acceptedWorkers);
  // split earning equally if multiple workers
  const perWorkerEarning =
    acceptedWorkers.length > 0 ? totalEarning / acceptedWorkers.length : 0;
console.log(perWorkerEarning);
  for (const w of acceptedWorkers) {
    await Worker.findOneAndUpdate(
      { workerId: w.workerId },
      { $inc: { earning: perWorkerEarning } }
    );
  }

  /* ================= UPDATE TASK STATUS ================= */

  task.status = "Completed";
  task.is_completed = true;
  await task.save();

  return NextResponse.json({
    success: true,
    totalEarning,
    workersPaid: acceptedWorkers.length,
  });
}
