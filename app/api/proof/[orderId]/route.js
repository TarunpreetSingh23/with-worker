import { NextResponse } from "next/server";
import Proof from "@/models/Proof";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

export const runtime = "nodejs"; // required for Buffer & MongoDB

// POST /api/proof/[orderId]
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { orderId } = params;
    const formData = await request.formData();

    const workerId = formData.get("workerId");
    const file = formData.get("image");

    if (!orderId || !workerId || !file) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // ✅ Check task + worker authorization
    const task = await Task.findOne({ order_id: orderId });
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    const worker = task.assignedWorkers.find(
      (w) => w.workerId === workerId && w.status === "accepted"
    );

    if (!worker) {
      return NextResponse.json(
        { success: false, message: "Worker not authorized." },
        { status: 403 }
      );
    }

    // ✅ Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type." },
        { status: 400 }
      );
    }

    // ✅ Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // ✅ Save proof
    const proof = await Proof.create({
      workerId,
      orderId,
      image: base64Image,
    });

    return NextResponse.json(
      { success: true, message: "Proof uploaded successfully.", proof },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error uploading proof:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
