import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    trendingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "treading",
    },
    notifymodel: {
      type: String,
      required: true,
      enum: ["trending", "title", "episode"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const notification = mongoose.model("Notification", NotificationSchema);
