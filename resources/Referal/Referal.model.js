import mongoose from "mongoose";

const ReferalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel"
    },
    PlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan"
    },
    referralemail: {
      type: [String],

    },

  },
  { timestamps: true }
);

const Referal = mongoose.model("Referal", ReferalSchema);

export default Referal;
