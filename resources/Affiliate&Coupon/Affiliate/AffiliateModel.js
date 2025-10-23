import mongoose from "mongoose";
const { Schema, model } = mongoose;

const couponUsedSchema = new Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true },
  couponCode: { type: String, required: true },
  date: { type: String, required: true },
});
const affilitePaySchema = new Schema({
  amount: { type: Number, required: true },
  transecId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
});
const affiliateSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: [25, "name cannot exceed 25 characters"],
      required: [true, "Please Enter Name"],
    },
    mobile: {
      type: Number,
      maxLength: [10, "Mobile cannot exceed 10 characters"],
      minlength: [10, "Invalid Mobile Number"],
      required: [true, "Please Enter Mobile Number"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please Enter Email"],
      unique: true,
    },
    country: {
      type: String,
      required: [true, "Please Enter Country"],
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Please Enter Address"],
    },
    pincode: {
      type: Number,
      required: [true, "Please Enter Pincode"],
    },
    nameAsBank: {
      type: String,
      required: [true, "Please Enter Name as Bank"],
    },
    accountNo: {
      type: Number,
      required: [true, "Please Enter Account Number"],
      unique: true,
    },
    ifsc: {
      type: String,
      required: [true, "Please Enter IFSC code"],
    },
    bankName: {
      type: String,
      required: [true, "Please Enter Bank Name"],
    },
    branchName: {
      type: String,
      required: [true, "Please Enter Branch Name"],
    },
    coupon_code: {
      type: String,
      unique: [true, "Coupon Alerady Exists"],
      sparse: true,
    },
    discount_amount: {
      type: Number,
    },
    affiliate_discount_amount: {
      type: Number,
    },
    valid_till: {
      type: String,
    },
    createdAt: {
      type: String,
    },

    coupon_claimed: {
      type: Number,
      default: 0,
    },
    total_earning: {
      type: Number,
      default: 0,
    },
    paid_amount: {
      type: Number,
      default: 0,
    },
    no_of_paid_coupon: {
      type: Number,
      default: 0,
    },
    is_affiliate_active: {
      type: Boolean,
      default: true,
    },
    is_coupon_active: {
      type: Boolean,
      default: false,
    },
    coupon_used_history: [couponUsedSchema],
    affiliate_pay_history: [affilitePaySchema],
  },
  { timestamps: true }
);

export const AffiliateModel = model("Affiliate", affiliateSchema);
