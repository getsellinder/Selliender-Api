import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import shortid from "shortid";


export const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    // receiverId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   // required: true,
    // },
    message: { type: String, required: true },
    readByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const supportSchema = new mongoose.Schema(
  {
  ticketId: {
  type: String,
  default: () => `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
  unique: true,
},
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category:{
      type:String,
      required:true,
    },
     priority:{
      type:String,
      enum:["Low","Medium","High","Critical"],
      required:true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // unique: true,
    },
    messages: [MessageSchema],
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);
export const Support = mongoose.model("Support", supportSchema);
