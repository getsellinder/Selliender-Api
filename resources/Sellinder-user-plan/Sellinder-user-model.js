import mongoose from "mongoose";
const Schema = mongoose.Schema;
const seriesSchema = new mongoose.Schema(
  {
    seriesno: { type: String },
    // seriesno: { type: String, required: true },
    seriestitle: { type: String, required: true },
    coverImage: {},
    seriespart: { type: String },
    description: { type: String },
    about: { type: String },
    genre: { type: String },
    subject: { type: String },
  },
  { timestamps: true }
);
// creatre seasons

const SeasonsSchema = new mongoose.Schema(
  {
    seriesno: { type: String, required: true },
    seriestitle: { type: String, required: true },
    coverImage: {},
    seriespart: { type: String },
    description: { type: String },
    about: { type: String },
    // genre: { type: String },
    // subject: { type: String },
  },
  { timestamps: true }
);
const episodeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    episodenumber: { type: Number },
    pricingType: { type: String, required: true },
    audioUrl: {},
    duration: { type: String, required: true },
    thumbnail: {},
    description: { type: String },
    about: { type: String },
    seriesId: { type: Schema.Types.ObjectId, ref: "Series", default: null },
    seasonNo: { type: String },


    subject: {
      type: mongoose.Schema.ObjectId,
      ref: "SubjectModel",
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: "GenreModel",
    },
    isStandalone: { type: Boolean, default: false }, // helps filtering
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// seriesSchema.index({ seriesno: 1, seriespart: 1 }, { unique: true });
export const Series = mongoose.model("Series", seriesSchema);
export const episode = mongoose.model("episode", episodeSchema);
export const seriesseason = mongoose.model("seasons", SeasonsSchema);
