import connectDB from "@/lib/mongodb";
import Profit from "@/models/Profit";
import WorkerEarning from "@/models/WorkerEarning";

export async function POST(req) {
  await connectDB();
  const { workerId, tasks } = await req.json();

  if (!workerId || !tasks) {
    return Response.json({ error: "Missing data" }, { status: 400 });
  }

  let totalAdded = 0;

  for (const task of tasks) {

    // ✅ Only completed tasks (RECOMMENDED)
    if (!task.is_completed) continue;

    for (const item of task.cart) {
      const serviceName = item.name;

      // 🔥 Prevent duplicate
      const exists = await WorkerEarning.findOne({
        workerId,
        orderId: task.order_id,
        serviceName,
      });

      if (exists) continue;

      // 🔥 Find profit service
      const profit = await Profit.findOne({ name: serviceName });
      if (!profit) continue;

      // 💰 Worker commission (example 30%)
      const amount = profit.price;

      await WorkerEarning.create({
        workerId,
        orderId: task.order_id,
        serviceName,
        amount,
      });

      totalAdded += amount;
    }
  }

  return Response.json({ success: true, totalAdded });
}
