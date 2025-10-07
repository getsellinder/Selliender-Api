import mongoose from "mongoose";

const userPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "plan" },
    startDate: { type: Date, default: Date.now },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const userPlan = mongoose.model("userPlan", userPlanSchema);
export default userPlan;
