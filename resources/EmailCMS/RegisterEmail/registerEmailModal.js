import mongoose from "mongoose";

const { Schema, model } = mongoose;

const registerEmailData = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Please Enter title "],
    },
    description: {
      type: String,
      maxLength: [500, "description cannot exceed 500 characters"],
      required: [true, "Please Enter  description"],
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true, versionKey: false }
);

export const RegisterEmail = mongoose.model("RegisterEmail", registerEmailData);
