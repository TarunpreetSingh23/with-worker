import mongoose from "mongoose";

const ProofSchema = new mongoose.Schema({
  workerId: { type: String, required: true },
  orderId: { type: String, required: true },
  image: { type: String, required: false }, // ← make this not required for testing
  pushToken: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.Proof || mongoose.model("Proof", ProofSchema);
