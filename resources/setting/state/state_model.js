import mongoose from "mongoose";
const { Schema, model } = mongoose;

const StateSchema = new Schema(
  {
    state_name: { type: String, default: "" },
  },
  { timestamps: true }
);

export const State = model("State", StateSchema);
