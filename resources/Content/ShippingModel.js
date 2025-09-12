import mongoose from "mongoose";
const { Schema, model } = mongoose;

const shippingSchema = new Schema(
  {
    shippingContent: {
      type: String,
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Shipping = model("Shipping", shippingSchema);
