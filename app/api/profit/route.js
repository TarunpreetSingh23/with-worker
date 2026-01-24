import connectDB from "@/lib/mongodb";
import profit from "@/models/Profit";
export async function GET() {
  await connectDB();
  const services = await profit.find();
  console.log(services);
  return Response.json(services);
}
