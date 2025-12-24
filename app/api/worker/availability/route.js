import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Worker from "@/models/Worker";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function PATCH(req) {
  try {
    const token = cookies().get("session")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const { availability } = await req.json();

    if (!["AVAILABLE", "OFFLINE"].includes(availability)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const worker = await Worker.findOneAndUpdate(
      { workerId: payload.workerId },
      { availability },
      { new: true }
    ).select("availability");

    if (!worker) {
      return Response.json({ error: "Worker not found" }, { status: 404 });
    }

    return Response.json({ success: true, availability: worker.availability });
  } catch (err) {
    console.error("UPDATE AVAILABILITY ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
