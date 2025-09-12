import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  id: String,
  addressLine1: String,
  addressLine2: String,
  country: String,
  state: String,
  city: String,
  zipcode: String,
});

const userAddressSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: [true, "User type is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phno: {
      type: String,
      required: [true, "Phone number is required"],
    },
    addressess: [addressSchema], // Define the schema for the array
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const UserAddressModel = mongoose.model(
  "UserAddressModel",
  userAddressSchema
);
