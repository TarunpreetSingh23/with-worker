import mongoose from "mongoose";

/* Sub-schema for products (consumable) */
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: "pcs" }, // gm, ml, pcs, bottle
});

/* Sub-schema for accessories (tools) */
const AccessorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  reusable: { type: Boolean, default: true },
});

const ProfitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // Gold Facial
    category: { type: String, required: true },   // Facial
    price: { type: Number, required: true },      // Service price

    // 🔥 Products consumed in service
    products: [ProductSchema],

    // 🔥 Accessories/tools used
    accessories: [AccessorySchema],

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Profit || mongoose.model("Profit", ProfitSchema);
