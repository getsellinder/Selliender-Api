import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      // maxLength: [30, "Name cannot exceed 30 characters"],
      // minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    phone: {
      type: Number,
      // required: [true, "Please Enter Your phone no."],
      maxLength: [12, "phone cannot exceed 12 characters"],
      minLength: [6, "phone should have more than 6 characters"],
    },

    password: {
      type: String,
      // required: [true, "Please Enter Your Password"],
      minLength: [6, "Password should be greater than 6 characters"],
      select: false, //find not got passpord
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        // required: true,
      },
    },
    logintype: {
      type: String,
      enum: ["email-password", "google"],
      default: "email-password",
    },
    PlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
    },
    SearchLimit: {
      type: Number,
    },
    LinkedinPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LinkedinPost",
    },
    LinkedinContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LinkedinContent",
    },
    pendingLinkedInURL: { type: String },
    pendingProductDescription: { type: String },
    pendingProductPrice: { type: Number },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: "India" },
    pincode: { type: String },
    street: { type: String },
    state: {},
    role: {
      type: String,
      // default: "Employee",
      default: "Customer",
    },
    googleId: String,
    accessTo: {},

    PlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
      default: null
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// Compare Password

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating   Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding reset PasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //expire password time
  // console.log(this.resetPasswordToken)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 minut

  return resetToken;
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
