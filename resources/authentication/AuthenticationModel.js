import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AuthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      set: (value) =>
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    phonenumber: {
      type: Number,
      required: [true, "Please Enter Your Phonenumber"],
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits",
      },
    },
    email: {
      type: String,
      required: [true, "Please Enter Your email"],
      // unique: true,
    },

    password: {
      type: String,
      required: [true, "Please Enter Your password"],
      minlength: 6,
    },
  },
  { timestamps: true }
);
AuthSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const AuthModel = mongoose.model("Authtication", AuthSchema);
export default AuthModel;
