import connectDB from "@/lib/mongodb";
import Worker from "@/models/Worker";
import Task from "@/models/Task";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId");

    if (!workerId) {
      return new Response(JSON.stringify({ error: "WorkerId is required" }), { status: 400 });
    }

    // get role prefix from workerId
    const rolePrefix = workerId.slice(0, 2);

    // find tasks matching worker's role
        // match tasks where order_id starts with worker prefix
    const tasks = await Task.find({ order_id: { $regex: `^${rolePrefix}` } });
console.log(tasks)
    return new Response(JSON.stringify(tasks), { status: 200 });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
