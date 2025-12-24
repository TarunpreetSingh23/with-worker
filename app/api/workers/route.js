import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Worker from "@/models/Worker";

// POST /api/workers
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { workerId, name, email, password, role } = body;

    if (!workerId || !password) {
      return NextResponse.json(
        { error: "workerId and password are required" },
        { status: 400 }
      );
    }

    // check duplicate workerId
    const existing = await Worker.findOne({ workerId });
    if (existing) {
      return NextResponse.json(
        { error: "Worker already exists" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newWorker = await Worker.create({
      workerId,
      name,
      email,
      password: hashedPassword,
      role: role || "MU", // default role
    });

    return NextResponse.json(
      { message: "Worker created successfully", worker: newWorker },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating worker:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
