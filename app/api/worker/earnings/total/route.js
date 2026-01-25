import connectDB from "@/lib/mongodb";
import WorkerEarning from "@/models/WorkerEarning";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get("workerId");

  const earnings = await WorkerEarning.aggregate([
    { $match: { workerId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return Response.json({ total: earnings[0]?.total || 0 });
}
