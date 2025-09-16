import mongoose from "mongoose";
const Schema = mongoose.Schema;
// const contentEntrySchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       enum: ["series", "standalone"],
//       required: true,
//     },

//     chapterName: String,

//     subject: String, // subjectName (not the ID)
//     genre: String, // genreName (not the ID)

//     seriesId: {
//       type: mongoose.Schema.Types.ObjectId,
//       // ref: "Chapter.series._id",
//     },
//     seriesTitle: String,

//     // Episode content
//     episode: {
//       title: String,
//       episodenumber: Number,
//       audioUrl: String,
//       duration: String,
//       thumbnail: String,
//       description: String,
//       about: String,
//     },
//     listenedAt: { type: Date, default: Date.now },
//   },
//   { _id: true }
// );

const contentEntrySchema = new mongoose.Schema(
  {
    type: { type: String },
    title: { type: String },
    episodenumber: { type: Number },
    audioUrl: { type: String },
    duration: { type: String },
    thumbnail: { type: String },
    description: { type: String },
    about: { type: String },
    seriesId: { type: Schema.Types.ObjectId, ref: "Series", default: null },
    episodeId: { type: Schema.Types.ObjectId, ref: "Series", default: null },
    seriestitle: { type: String, ref: "Series" },
    seriesabout: { type: String, ref: "Series" },
    seriespart: { type: String, ref: "Series" },
    seriesno: { type: String },

    isStandalone: { type: Boolean, default: false },
    listenedAt: { type: Date, default: Date.now }, // helps filtering
  },
  { _id: true }
);

const MyligrarySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    library: [contentEntrySchema],
    downloads: [contentEntrySchema],
    listenHistory: [contentEntrySchema],
  },
  { timestamps: true }
);

const LibraryModel = mongoose.model("MyLibrary", MyligrarySchema);
export default LibraryModel;
