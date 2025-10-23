// models/ReviewStatusModel.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Define a schema for the review status (just a single global value)
const ReviewStatusSchema =new Schema(
  {
    reviews_status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the model for ReviewStatus
export const ReviewStatusModel = model("ReviewStatus", ReviewStatusSchema);

// export default ReviewStatusModel;
