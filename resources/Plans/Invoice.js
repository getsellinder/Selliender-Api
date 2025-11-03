import mongoose from "mongoose";

const InvoicesSchema = new mongoose.Schema(
  {
    InvoiceNo: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    PlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
    },

    TransactionId: {
      type: String,
    },
    RazorpaySignature: {
      type: String,
    },
    RazorpayOrderId: {
      type: String,
    },
    plan_start_date: {
      type: Date,
    },
    plan_expiry_date: {
      type: Date,
    },
    duration: {
      type: String,
      required: true,
    },
    // gst: {
    //   type: Number,
    //   required: true,
    // },
    // totalGst: {
    //   type: Number,
    //   required: true,
    // },
    Amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
    },
    razorypayTime: {
      type: Date,
      // default: Date.now,
      required:false
    },
    invoice_status: {
      type: String,
      enum: ["Active", "Deactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", InvoicesSchema);
export default Invoice;
