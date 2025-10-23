import { mongoose } from "mongoose";

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter specialty name"],
    trim: true,
    maxlength: [100, "Specialty name cannot exceed 100 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Specialty = mongoose.model("Specialty", specialtySchema);
