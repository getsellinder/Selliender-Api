import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import shortid from "shortid";
// import { MessageModel } from "../message/MessageSchema.js";

// const supportSchema = new Schema(
//   {
//     addedBy: {
//       type: Schema.Types.ObjectId,
//       refPath: "addedByModel",
//       required: true,
//     },

//     addedByModel: {
//       type: String,
//       required: true,
//       enum: ["User", "Patient"],
//     },
//     subject: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       maxLength: [100, "description cannot exceed 100 characters"],
//       required: [true, "Please Enter product Description"],
//     },

//     lastreply: {
//       type: String,
//     },
//     status: {
//       type: String,
//       enum: ["Open", "Close"],
//       default: "Open",
//     },
//     from: {
//       type: String,
//       enum: ["Website", "Mobile"],
//       default: "Website",
//     },
//     image: [
//       {
//         public_id: {
//           type: String,
//           // required: true,
//         },
//         url: {
//           type: String,
//           // required: true,
//         },
//       },
//     ],
//     message: [
//       {
//         message: {
//           type: String,
//           default: "",
//         },
//         user: {
//           type: String,
//           enum: ["admin", "user"],
//           default: "user",
//         },
//         replyDate: {
//           type: String,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

export const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    message: { type: String, required: true },
    readByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const supportSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => `TKT-${Math.floor(Math.random() * 10) + 1}`,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
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
