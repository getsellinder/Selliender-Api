
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const testSchema = new mongoose.Schema(
    {
        k_value: {
            type: Number,
            required: true,
        },
        v_value: {
            type: Number,
            required: true,
        },
        p_value: {
            type: Number,
            required: true,
        },
        patient: {
            type: Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,


        }

    },
    { timestamps: true }
);



const Test = mongoose.model("Test", testSchema);

export default Test;



