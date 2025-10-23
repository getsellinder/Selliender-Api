import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SeoRequestSchema = new mongoose.Schema(
  {
    GoogleTag: {
      type: String,
      maxLength: [25, "tag cannot exceed 25 characters"],
      //   required: [true, "Please Enter google tag "],
    },
    FacebookPixel: {
      type: String,
      maxLength: [25, "tag cannot exceed 25 characters"],
      // required: [true, "Please Enter Facebook Pixel "],
    },
    GoogleAnalytics: {
      type: String,
      maxLength: [500, "google analytics cannot exceed 500 characters"],
      required: [true, "Please Enter google analytics"],
    },
    MicrosoftClarity: {
      type: String,
      maxLength: [500, "Microsoft clarity cannot exceed 500 characters"],
      // required: [true, "Please Enter microsoft clarity"],
    },
  },
  { timestamps: true, versionKey: false }
);

export const SeoRequest = mongoose.model("SeoRequest", SeoRequestSchema);
