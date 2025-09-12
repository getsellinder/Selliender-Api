import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TestimonialSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            maxLength: [150, "name cannot exceed 25 characters"],
            required: [true, "Please Enter name "],
        },
        company: {
            type: String,
            maxLength: [30, "company name cannot exceed 1000 characters"],
            default: ''
        },
        testimonial: {
            type: String,
            maxLength: [1000, "testimonial cannot exceed 1000 characters"],
            required: [true, "Please Enter testimonial"],
        },
        image: {
            public_id: {
                type: String,

            },
            url: {
                type: String,

            },
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }

    },
    { timestamps: true, versionKey: false }
);

export const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
