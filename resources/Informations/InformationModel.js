import mongoose from "mongoose";

const { Schema, model } = mongoose;

const informationSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            maxLength: [150, "title cannot exceed 25 characters"],
            required: [true, "Please Enter title "],
        },
        description: {
            type: String,
            maxLength: [500, "description cannot exceed 500 characters"],
            required: [true, "Please Enter  description"],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

    },
    { timestamps: true, versionKey: false }
);

export const Information = mongoose.model("Information", informationSchema);
