import mongoose from "mongoose";

const GenreSchema = new mongoose.Schema(
  {
    genreName: {
      type: String,
      required: [true, "Name of genre required "],
    },
    genreImage: {},
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: "SubjectModel",
      // required: true,
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const GenreModel = mongoose.model("GenreModel", GenreSchema);
