import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({}, { timestamps: true });

const notification = mongoose.model("notification", NotificationSchema);

export default notification;
