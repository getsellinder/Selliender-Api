import mongoose from "mongoose";

const PackageScheme = new mongoose.Schema(
  {
    Package: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    Gst: {
      type: mongoose.Schema.ObjectId,
      ref: "Tax",
      required: true,
    },
    Price: {
      type: Number,
      required: true,
    },
    Total_Price: {
      type: Number,
      required: true,
    },
    Support: {
      type: String,
      required: true,
    },
    Access: {
      type: String,
      required: true,
    },
    Limit: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const packageModel = mongoose.model("package", PackageScheme);

export default packageModel;
