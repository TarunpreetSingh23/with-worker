
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import connectDB from "@/lib/mongodb";
import Worker from "@/models/Worker";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret"
);

export async function POST(req) {
  try {
    const { workerId } = await req.json();

    if (!workerId) {
      return Response.json({ error: "Worker ID required" }, { status: 400 });
    }

    await connectDB();

    const worker = await Worker.findOne({
      workerId: workerId.trim().toUpperCase(),
    });

    if (!worker) {
      return Response.json(
        { error: "Invalid Worker ID" },
        { status: 401 }
      );
    }

    /* ✅ CREATE JWT SESSION */
    const token = await new SignJWT({
      workerId: worker.workerId,
      phone: worker.phone || null,
      role: "worker",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(SECRET);

    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return Response.json({
      success: true,
      worker: {
        workerId: worker.workerId,
        name: worker.name,
        role: worker.role,
      },
    });
  } catch (err) {
    console.error("WORKER LOGIN ERROR:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
