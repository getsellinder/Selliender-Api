import mongoose from "mongoose";
const { Schema, model } = mongoose;

const Business_TypeSchema = new Schema(
  {
    // _id: { type: Schema.Types.ObjectId },
    business: { type: String, default: "" },
    // state: { type: Schema.Types.ObjectId, ref: "State" },
    // createdAt: { type: Date, default: new Date() },
  },
  // { timestamps: { createdAt: false, updatedAt: true } }
  { timestamps: true }

);

export const Business_Type = model("Business_Type", Business_TypeSchema);
