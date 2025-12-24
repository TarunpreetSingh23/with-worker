import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Worker from "@/models/Worker";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET() {
  try {
    const token = cookies().get("session")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);

    if (!payload.workerId) {
      return Response.json({ error: "Not a worker" }, { status: 403 });
    }

    await connectDB();

    const worker = await Worker.findOne({ workerId: payload.workerId })
      .select("workerId name email role rating experience availability");

    if (!worker) {
      return Response.json({ error: "Worker not found" }, { status: 404 });
    }

    return Response.json({ worker });
  } catch (err) {
    console.error("WORKER PROFILE ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
