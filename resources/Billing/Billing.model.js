import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema(
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

const Billing = mongoose.model("Billing", BillingSchema);

export default Billing;
