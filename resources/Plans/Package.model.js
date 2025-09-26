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
      // required: true,
    },

    Monthly_Price: {
      type: Number,

    },
    Yearly_Price: {
      type: Number,


    },
    Total_Yearly_Price: {
      type: Number,

    },
    Total_Monthly_Price: {
      type: Number,

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
