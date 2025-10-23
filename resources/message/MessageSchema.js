import mongoose from "mongoose";

export const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    readByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model("Message", MessageSchema);
