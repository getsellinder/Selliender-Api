import mongoose from "mongoose";

const ContactRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: [25, "name cannot exceed 25 characters"],
      required: [true, "Please Enter name "],
    },
    email: {
      type: String,

      required: [true, "Please Enter title "],
    },
    message: {
      type: String,
      maxLength: [500, "message cannot exceed 500 characters"],
      required: [true, "Please Enter  message"],
    },
    contactType: {
      type: String,
      enum: ["Contact Sale", "Contact Us"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PROCESS", "PENDING", "FINISHED"],
      default: "PROCESS",
    },
  },
  { timestamps: true }
);

export const ContactRequest = mongoose.model(
  "ContactRequest",
  ContactRequestSchema
);
