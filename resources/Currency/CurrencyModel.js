import mongoose from "mongoose";

const CurrencySchema = new mongoose.Schema(
  {
    CurrencyName: {
      type: String,
      required: true,
    },
    CurrencySymbol: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const CurrencyModel = mongoose.model("Currency", CurrencySchema);
