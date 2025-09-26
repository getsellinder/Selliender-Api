import mongoose from "mongoose";

const PackageScheme = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    Package: {
      type: String,
      enum: ["Free", "Pro", "Growth", "Enterprise"],
      required: true,
    },
    PlanLimit: {
      type: Number,
      // required: true,
    },
    GST: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tax",
      required: false

    },

    Monthly_Price: {
      type: Number,
      default: 0

    },
    Yearly_Price: {
      type: Number,
      default: 0


    },
    Total_Yearly_Price: {
      type: Number,
      default: 0

    },
    Total_Monthly_Price: {
      type: Number,
      default: 0

    },
    Monthly_features: {
      type: [],
      required: true,
    },

    Yearly_features: {
      type: [],
      required: true,
    },

    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const packageModel = mongoose.model("package", PackageScheme);

export default packageModel;
