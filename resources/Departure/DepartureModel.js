import mongoose from "mongoose";
const { Schema, model } = mongoose;

const departureSchema = new Schema({
    FlightNumber: {
        type: String,
        maxLength: [25, "FlightNumber cannot exceed 25 characters"],
        required: true,
        trim: true,
    },
    Airline: {
        type: String,
        maxLength: [25, "Airline cannot exceed 25 characters"],
        required: [true, "Please Enter Airline"],
    },
    Destination: {
        type: String,
        required: [true, "Please Enter Destination"],
        maxLength: [25, "Price cannot exceed 25 characters"],
    },
    GateNumber: {
        type: String,
        required: [true, "Please Enter GateNumber "],
        maxLength: [3, "GateNumber cannot exceed 3 characters"],
    },
    ActualTimeofDeparture: {
        type: String,
        required: true


    },
    ScheduledTimeofDeparture: {
        type: String,
        required: true
    },
    EstimatedTimeofDeparture: {

        type: String,
        required: true

    },
    Status: {
        type: String,
        enum: ["Departed", "OnTime", "Boarding", "Delayed", "Cancelled"],
        required: true,
        trim: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },






}, { timestamps: true });

export const Departure = model("Departure", departureSchema);
