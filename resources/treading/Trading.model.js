import mongoose from "mongoose";

const TradingSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 150,
    },
    image: {
      type: Object,
      required: true,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GenreModel",
    },
    subgenre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectModel",
    },
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "episode",
    },
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
    },
    isTreading: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const treading = mongoose.model("treading", TradingSchema);
