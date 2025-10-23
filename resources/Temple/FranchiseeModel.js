import mongoose from "mongoose";
import validator from "validator"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
const { Schema, model } = mongoose;

const FranchiseeSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please Enter Your Name"],
            maxLength: [30, "Name cannot exceed 30 characters"],
            minLength: [3, "Name should have more than 3 characters"],
        }, email: {
            type: String,
            required: [true, "Please Enter Your Email"],

            unique: [true, "Email already exist ! please try with diffent email"],


            validate: [validator.isEmail, "Please Enter a valid Email"],
        },
        password: {
            type: String,
            required: [true, "Please Enter Your Password"],
            minLength: [6, "Password should be greater than 6 characters"],
            select: false,//find not got passpord
        },
        address_line_1: { type: String, required: true },
        address_line_2: { type: String, required: true },
        contact_Number: { type: Number, required: true },
        contact_Person_Name: { type: String, required: true },
        city: { type: mongoose.Schema.ObjectId, ref: "City" },


        products: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
            },
        ],
        price_Lable: { type: String, default: "" },
        url: { type: String, default: "" },
        pin_Code: { type: Number, required: true },
        short_url: { type: String, default: "" },
        banner: { type: Object, default: { url: "", public_id: "" } },
        verify: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    { timestamps: true }
);

FranchiseeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 12);
});

// JWT TOKEN
FranchiseeSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};


// Compare Password

FranchiseeSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const Franchisee = model("Franchisee", FranchiseeSchema);
