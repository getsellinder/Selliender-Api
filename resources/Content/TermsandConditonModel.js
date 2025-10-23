import mongoose from "mongoose";
const { Schema, model } = mongoose;

const termsAndContionSchema = new Schema(
  {
    termsAndContionContent: {
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

export const TermsAndCondition = model(
  "TermsAndCondition",
  termsAndContionSchema
);
