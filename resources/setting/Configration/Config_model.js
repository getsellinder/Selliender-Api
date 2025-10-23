import mongoose from "mongoose";

const { Schema, model } = mongoose;

const configSchema = new Schema({
  appName: { type: String, default: "" },
  copyrightMessage: { type: String, default: "" },
  // scrollText: { type: String },
  socialMedia: { type: Array, default: [] },
  address: { type: Array, default: [] },
  logo: { type: Array, default: [] },
  terms_of_use: { type: String, default: "" },
  purpose: { type: String, default: "" },
  businessType: { type: String, default: "" },
  language: { type: String, default: "" },
});

export const Config = model("Config", configSchema);
