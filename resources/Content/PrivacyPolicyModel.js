import mongoose from "mongoose";
const { Schema, model } = mongoose;

const privacyAndPolicySchema = new Schema(
  {
    privacyAndPolicyContent: {
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

export const PrivacyAndPolicy = model(
  "PrivacyAndPolicy",
  privacyAndPolicySchema
);
