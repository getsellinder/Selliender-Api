import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema(
    {
        colorName: {
            type: String,
            required: [true, "Name of Color required "],
        },
        colorCode: {
            type: String,
            required: [true, "Please provide a color code (e.g., #FFFFFF)"],
            unique: true,
            match: [/^#[0-9A-F]{6}$/i, "Please provide a valid hex color code"],
        },
        addedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const ColorModel = mongoose.model("Color", ColorSchema);
