import mongoose from "mongoose";

const RegistrationImageSchema = new mongoose.Schema(
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

export const RegistrationImageModel = mongoose.model("RegistrationImageModel", RegistrationImageSchema);
