import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      required: true,
      unique: true,
    },

    name: String,

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    earning:{
      type:Number,
      default:0,
        
    },

    role: {
      type: String,
      enum: ["MU", "CL", "DC"],
      required: true,
    },

    availability: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "AVAILABLE",
    },

    pushToken: String,

    /* ⭐ RATING SYSTEM */
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Worker ||
  mongoose.model("Worker", WorkerSchema);
