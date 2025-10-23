import mongoose from "mongoose";
const { Schema, model } = mongoose;

const aboutUsSchema = new Schema(
  {
    aboutUsContent: {
      type: String,
      default: "",
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const AboutUs = model("AboutUs", aboutUsSchema);
