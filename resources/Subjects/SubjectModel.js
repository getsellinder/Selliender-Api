import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, "Name of genre required "],
      unique: true,
    },
    subjectImage: {},
    genreId: {
      type: mongoose.Schema.ObjectId,
      ref: "GenreModel",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const SubjectModel = mongoose.model("SubjectModel", SubjectSchema);
