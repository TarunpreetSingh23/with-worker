import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Worker from "@/models/Worker";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return Response.json({ user: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);

    if (payload.role !== "worker") {
      return Response.json({ user: null }, { status: 401 });
    }

    await connectDB();

    const worker = await Worker.findOne({
      workerId: payload.workerId,
    }).select("workerId name role phone");

    if (!worker) {
      return Response.json({ user: null }, { status: 404 });
    }

    return Response.json({
      user: {
        type: "worker",
        id: worker._id.toString(),
        workerId: worker.workerId,
        name: worker.name,
        role: worker.role,
        phone: worker.phone,
      },
    });
  } catch (err) {
    console.error("ME API ERROR:", err);
    return Response.json({ user: null }, { status: 401 });
  }
}
