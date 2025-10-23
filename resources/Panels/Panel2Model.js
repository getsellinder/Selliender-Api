import mongoose from "mongoose";
const { Schema, model } = mongoose;

const panel2Schema = new Schema(
    {
        title: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        image: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        addedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        displayPanel: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const Panel2 = model(
    "Panel2",
    panel2Schema
);
