import AuthModel from "./AuthenticationModel.js";
import bcrypt from "bcryptjs";
import randomstring from "randomstring";
import nodemailer from "nodemailer";

let otpcache = {};
function generateOTP() {
  return randomstring.generate({ length: 4, charset: "numeric" });
}

function sendOtp(email, otp) {
  const mailOption = {
    from: "",
    to: email,
    subject: "OTP Verification",
    text: `Your OTP for varification is:${otp}`,
  };
  let transported = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      // user: "kommushirisha9666@gmail.com",
      // pass: "aruc wuse crjy bxwg",
      user: process.env.NOEDEMAILERUSER,
      pass: process.env.NODEMAILERPASS,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });
  transported.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log("Error occurred", error);
    } else {
      console.log("OTP Email sent Successfully", info.response);
    }
  });
}

export const RegisterUser = async (req, res) => {
  try {
    const { name, phonenumber, email, password } = req.body;

    const user = await AuthModel.create({ name, phonenumber, email, password });
    const otp = generateOTP();
    otpcache[email] = otp;
    sendOtp(email, otp);
    res.cookie("otpcaChe", otpcache, { maxAge: 30000, httpOnly: true });
    return res
      .status(200)
      .json({ message: "User Registered Successfully", user });
  } catch (error) {
    console.log("error in RegisterUser", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error in LoginUser", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const otpverification = async (req, res) => {
  try {
    const { otp } = req.body;
    const otpCacheFromCookie = req.cookies.otpcaChe;
    if (!otpCacheFromCookie || typeof otpCacheFromCookie !== "object") {
      return res.status(400).json({ message: "Email not found" });
    }
    const email = Object.keys(otpCacheFromCookie)[0];
    const storedOtp = otpCacheFromCookie[email];
    if (storedOtp === otp.trim()) {
      res.clearCookie("otpcaChe");
      return res
        .status(200)
        .json({ message: "OTP Verified Successfully", email });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log("error in LoginUser", error.message);
    return res.status(500).json({ message: error.message });
  }
};
