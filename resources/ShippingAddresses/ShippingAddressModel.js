import mongoose from "mongoose";
const shippingAddressSchema = new mongoose.Schema(
  {
    first_Name: {
      type: String,
      required: true,
    },
    last_Name: {
      type: String,
      required: true,
    },
    phone_Number: {
      type: Number,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      // Add a regular expression to enforce a specific postal code format
      // For example, assuming a 5-digit format for the United States
      match: /^\d{6}$/,
    },
    country: {
      type: String,
      required: true,
    },
    // company_name: {
    //   type: String,
    // },
    // gst_number: {
    //   type: String,
    //   validate: {
    //     validator: function (v) {
    //       // Regular expression for Indian GST number validation
    //       return /^(\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1})$/.test(v);
    //     },
    //     message: (props) => `${props.value} is not a valid Indian GST number!`,
    //   },
    // },
    default: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const shippingAddress = mongoose.model(
  "ShippingAddress",
  shippingAddressSchema
);

