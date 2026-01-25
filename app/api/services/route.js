import connectDB from "@/lib/mongodb";
import Profit from "@/models/Profit";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Service name required" }, { status: 400 });
  }

  const service = await Profit.findOne({
    name: { $regex: `^${name}$`, $options: "i" }, // 👈 case-insensitive match
  });

  console.log("SERVICE FOUND:", service);

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}
