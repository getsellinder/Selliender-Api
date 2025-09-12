import mongoose from "mongoose";

const LoginImageSchema = new mongoose.Schema(
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

export const LoginImageModel = mongoose.model("LoginImageModel", LoginImageSchema);
