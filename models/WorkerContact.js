import mongoose from "mongoose";

const WorkerContactSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.WorkerContact ||
  mongoose.model("WorkerContact", WorkerContactSchema);
