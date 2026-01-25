import mongoose from "mongoose";

const WorkerEarningSchema = new mongoose.Schema({
  workerId: String,
  orderId: String,
  serviceName: String,
  amount: Number,
}, { timestamps: true });

// 🔥 Unique: worker + order + service
WorkerEarningSchema.index(
  { workerId: 1, orderId: 1, serviceName: 1 },
  { unique: true }
);

export default mongoose.models.WorkerEarning || mongoose.model("WorkerEarning", WorkerEarningSchema);
