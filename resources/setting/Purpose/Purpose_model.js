import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PurposeSchema = new Schema(
  {
    purpose: { type: String, default: "" },

  },
  { timestamps: true }

);

export const Purpose = model("Purpose", PurposeSchema);
