import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
    {
        collectionName: {
            type: String,
            required: [true, "Name of Collection required "],
        },
        addedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
    },
    { timestamps: true }
);

export const CollectionModel = mongoose.model("Collection", CollectionSchema);
