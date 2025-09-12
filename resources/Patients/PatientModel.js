import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deviceAdded: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },

    password: {
      type: String,
      minLength: [6, "Password should be greater than 6 characters"],
      select: false, //find not got passpord
    },
    avatar: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },

    weight: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ['Kgs', 'Lbs'],
      },
    },
    height: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ['Ft', 'Cm'],
      },
    },

    age: Number,
    commonHealthComplaints: String,
    familyHistory: String,
    personalHistory: String,
    dailyRoutine: String,
    newMobileNumber: { type: String },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
patientSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// Compare Password
patientSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating   Reset Token
patientSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding reset PasswordToken to patientSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //expire password time
  // console.log(this.resetPasswordToken)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 minut

  return resetToken;
};

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;



