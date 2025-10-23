import mongoose from "mongoose";
//

const userrequest = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Support",
      unique: true,
    },
    AdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "CLOSED"],
      default: "IN_PROGRESS",
    },
  },
  { timestamps: true }
);
const request = mongoose.model("UserRequest", userrequest);
export default request;
