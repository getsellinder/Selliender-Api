import mongoose from "mongoose";

const DesignSchema = new mongoose.Schema(
  {
    designName: {
      type: String,
      required: [true, "Name of desing required "],
    },
    categoryName: {
      type: String,
      required: [true, "Category is required"],
    },
    designImage: {},
    designImageJson: {},
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const DesignModel = mongoose.model("DesignModel", DesignSchema);
