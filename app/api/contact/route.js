import  connectDB  from "@/lib/mongodb";
import WorkerContact from "@/models/WorkerContact";

export async function POST(req) {
  try {
    await connectDB();

    const { workerId, subject, message } = await req.json();

    if (!workerId || !subject || !message) {
      return Response.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const contact = await WorkerContact.create({
      workerId,
      subject,
      message,
    });

    console.log("📩 New worker contact saved:", contact);

    return Response.json(
      { message: "Your message has been sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error saving contact message:", error);
    return Response.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
