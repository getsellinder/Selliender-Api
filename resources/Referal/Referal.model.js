import mongoose from "mongoose";
import crypto from "crypto";

const ReferalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    PlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    referralemail: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    ReferalCode: {
      type: String,
      unique: true,
      default: function () {
        return "REF" + crypto.randomBytes(3).toString("hex").toUpperCase();
      },
    },
  },
  { timestamps: true }
);

const Referal = mongoose.model("Referal", ReferalSchema);

export default Referal;
