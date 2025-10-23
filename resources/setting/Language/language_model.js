import mongoose from "mongoose";
const { Schema, model } = mongoose;

const LanguageSchema = new Schema(
  {
    // _id: { type: Schema.Types.ObjectId },
    language: { type: String, default: "" },
    // state: { type: Schema.Types.ObjectId, ref: "State" },
    // createdAt: { type: Date, default: new Date() },
  },
  // { timestamps: { createdAt: false, updatedAt: true } }
  { timestamps: true }

);

export const Language = model("Language", LanguageSchema);
