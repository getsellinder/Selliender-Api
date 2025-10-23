import mongoose from "mongoose";
const { Schema, model } = mongoose;
const RefundpolicySchema = new Schema(
  {
    Refundpolicy: {
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

export const Refundpolicy = model("refund-policy", RefundpolicySchema);
