import mongoose from "mongoose";

const ShopImageSchema = new mongoose.Schema(
    {

        image: {
            type: Object,
            required: true
        },
        addedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const ShopPageImageModel = mongoose.model("ShopPageImageModel", ShopImageSchema);
