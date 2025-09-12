import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TaxSchema = new Schema(
  {
    name: String,
    Gst: Number,
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const Tax = model("Tax", TaxSchema);
