import mongoose, { Schema } from "mongoose";

const BanerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const Banner = mongoose.model("Banner", BanerSchema);
