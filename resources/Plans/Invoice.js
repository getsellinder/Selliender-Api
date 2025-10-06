import mongoose from "mongoose";

const InvoicesSchema = new mongoose.Schema({
    InvoiceNo: {
        type: String,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    PlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "package"
    },

    TransactionId: {
        type: String
    },
    plan_start_date: {
        type: Date
    },
    plan_expiry_date: {
        type: Date
    },
    Amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["success", "failed"]

    }


}, { timestamps: true })

const Invoice = mongoose.model("Invoice", InvoicesSchema)
export default Invoice