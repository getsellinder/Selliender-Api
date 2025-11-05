import ErrorHander from "../../Utils/errorhander.js";
import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import User from "./userModel.js";
import sendToken from "../../Utils/jwtToken.js";
import sendEmail, { sendBrevoEmail } from "../../Utils/sendEmail.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import password from "secure-random-password";
import { Order } from "../Orders/orderModel.js";
import { RegisterEmail } from "../EmailCMS/RegisterEmail/registerEmailModal.js";
import { Config } from "../setting/Configration/Config_model.js";
import admin from "./VerifySingnGoogle.js";
import randomstring from "randomstring";
import { oauth2client } from "../../Utils/googleauth.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import UserModel from "./userModel.js";
import { OAuth2Client } from "google-auth-library";
import dontenv from "dotenv";
dontenv.config();

// 1.Register a User
function generateOTP() {
  return randomstring.generate({ length: 4, charset: "numeric" });
}
let otpObject = {};
let userobj = {};
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      PlanId,
      phone,
      accessTo,
      role,
      street,
      city,
      state,
      country,
      pincode,
    } = req.body;

    let findUser = await User.findOne({ email });

    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (password.trim() !== confirmPassword.trim()) {
      return res.status(400).json({
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }

    let data = {
      name,
      email,
      password,
      phone,
      role,
      accessTo,
      street,
      city,
      state,
      country,
      pincode,
      PlanId,
      logintype: "email-password",
    };
    const add = await User.create(data);

    sendToken(add, 201, res);
    // return res.status(201).json({ message: "User registered successfully.", add });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

export const AddEmploye = async (req, res) => {
  try {
    const { name, email, password, phone, accessTo } = req.body;

    let findUser = await User.findOne({ email });

    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    userobj = {
      name,
      email,
      password,
      phone,
      accessTo,
      role: "Employee",
      logintype: "email-password",
    };
    const add = await User.create(userobj);
    const userWithoutPassword = add.toObject();

    delete userWithoutPassword.password;
    return res
      .status(200)
      .json({ message: "Employe Added Successfully", userWithoutPassword });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal Servar Error" });
  }
};

export const VarificationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let getotp = req.cookies.otp_verification;
    console.log("otpObject", getotp);

    if (!getotp) {
      return res
        .status(400)
        .json({ message: "OTP cookie not found or expired" });
    }
    // const email = Object.keys(getotp.otpObject)[0];
    // const otpFromCookie = getotp.otpObject[email];
    let otpObject;
    try {
      otpObject = JSON.parse(getotp);
    } catch (err) {
      return res.status(400).json({ message: "Invalid cookie format" });
    }

    // const otpFromCookie  = Object.keys(otpObject)[0];
    const otpFromCookie = otpObject[email];
    if (!otpFromCookie) {
      return res.status(400).json({ message: "OTP not found for this email" });
    }
    console.log("otpObject", otpObject);
    console.log("email", email);
    console.log("otpFromCookie", otpFromCookie);

    if (otpFromCookie === otp.trim()) {
      // res.clearCookie("otp_verification");
      delete otpObject[email];
      res.cookie("otp_verification", JSON.stringify(otpObject), {
        // httpOnly: true,
        // secure: true,
        // sameSite: "None",
        // maxAge: 5 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None", // allow cross-site
        maxAge: 5 * 60 * 1000,
      });
      const user = await User.create(userobj);

      sendToken(user, 201, res, {
        message: "OTP Verified Successfully",
        email,
      });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log("VarificationOTP Error", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Addcustomers
export const Addcustomers = async (req, res) => {
  try {
    const { name, email, street, city, state, country, pincode } = req.body;
    // console.log("this is the password ", password, name, req.body);

    let findUser = await User.findOne({ email });

    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,

      street,
      city,
      state,
      country,
      pincode,
    });

    return res.status(200).json({ message: "user created successfully", user });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

// 2.Login User
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  // checking if user has given password and email both

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please Enter Email & Password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
    await User.findOneAndUpdate(
      { email: email },
      { logintype: "email-password" },
      { new: true }
    );

    sendToken(user, 200, res);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong!", error: error?.message || "" });
  }
};

// 3.Logout User
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// 4.Forgot Password

export const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  const sellinderAddress = await Config.find();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!sellinderAddress) {
    return res
      .status(404)
      .json({ message: "Sellinder Address Details not found" });
  }
  // Get ResetPassword Token
  // const resetToken = user.getResetPasswordToken(); //call function

  //save database reset token
  // await user.save({ validateBeforeSave: false });

  const passwords = password.randomPassword({
    length: 12,
    characters: [
      { characters: password.upper, exactly: 1 },
      { characters: password.symbols, exactly: 1 },
      password.lower,
      password.digits,
    ],
  });

  user.password = passwords;
  await user.save();
  const appName = sellinderAddress[0]?.appName || "Sellinder";
  const address =
    sellinderAddress[0]?.address[0]?.email || "support@sellinder.com";

  try {
    await sendBrevoEmail({
      to: `${user.email}`, // Change to your recipient
      fromEmail: address,
      fromName: appName, // Change to your verified sender
      subject: `${appName} Password Recovery`,
      html: `
    <p>Hi ${user.name || ""},</p>
    <p>Your new password is:</p>
    <h3>${passwords}</h3>
    <p>If you didn’t request a password reset, please ignore this email.</p>
    <br/>
    <p>– The ${appName} Team</p>
  `,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json({ message: "Something went wrong!", error: error?.message || "" });
  }
};


export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

//6.Get User Detail
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findById(req.user.id).populate(
    "PlanId",
    "Package SearchLimitMonthly SearchLimitYearly name"
  );
  if (!user) {
    return res.status(400).json({ message: "data not found" });
  }

  // If user has a plan but SearchLimit is 0, initialize it from the plan monthly limit
  try {
    const planLimit = user?.PlanId?.SearchLimitMonthly ?? 0;
    if ((user.SearchLimit === 0 || user.SearchLimit == null) && planLimit > 0) {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { SearchLimit: planLimit } },
        { new: true }
      ).populate("PlanId", "Package SearchLimitMonthly SearchLimitYearly name");
    }
  } catch (err) {
    console.log("getUserDetails: failed to initialize SearchLimit", err?.message || err);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHander(`please send User ID`, 404));
  }
  const user = await User.findById(req.params.id).populate(
    "PlanId",
    "Package SearchLimitMonthly SearchLimitYearly name"
  );

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});
export const getUserOrderForAdmin = async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  try {
    const order = await Order.find({
      user: id,
      // payment_status: "success",
    }).sort({ createdAt: -1 });

    if (order) {
      return res.status(200).json({
        success: true,
        order,
        message: "self Order fetched",
      });
    }
  } catch (error) {
    if (error.code) {
    }
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
// 8.update User password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// 9. Update User Profile
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  // Check if the email already exists but belongs to a different user
  if (req?.body?.email) {
    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists && emailExists._id.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Same Email is already in use by another user.",
      });
    }
  }

  if (req?.files) {
    const userImage = req.files?.avatar;
    const user = await User.findById(req.user.id);
    if (user?.avatar?.public_id) {
      const imageId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(imageId);
    }

    const myCloud = await cloudinary.v2.uploader.upload(
      userImage.tempFilePath,
      {
        folder: "Frameji/user_image",
      }
    );

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  return res.status(200).json({
    success: true,
    user,
  });
});

// 9.Get all users(admin)
3;
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});
export const getAllAdminUsers = catchAsyncErrors(async (req, res, next) => {
  // Assuming your User model is imported as 'User'
  const users = await User.find({ role: "admin" }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    users,
  });
});
export const getAllEmployee = catchAsyncErrors(async (req, res, next) => {
  // Assuming your User model is imported as 'User'
  const employee = await User.find({ role: "Customer" }).sort({
    createdAt: -1,
  });
  console.log(employee);

  res.status(200).json({
    success: true,
    employee,
  });
});
export const deleteEmployeeById = catchAsyncErrors(async (req, res, next) => {
  // console.log("request came here", req.params);
  // Extract the employee ID from the request parameters
  const { id } = req.params;

  try {
    // Find the employee by ID and delete it
    const deletedEmployee = await User.findByIdAndDelete(id);

    if (!deletedEmployee) {
      // If the employee with the provided ID is not found, return an error
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // If deletion is successful, return success response
    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    // Handle any errors that occur during deletion
    return res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
});
// Update employee
// Import necessary modules and set up your User model

export const updateEmployeeById = catchAsyncErrors(async (req, res, next) => {
  // Extract the employee ID from the request parameters
  const { id } = req.params;

  try {
    // Find the employee by ID and update its fields
    const user = await User.findById(id);
    console.log(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found here",
      });
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      id,
      { $set: req.body }, // Update fields based on the request body
      { new: true } // Return the updated document
    );

    if (!updatedEmployee) {
      // If the employee with the provided ID is not found, return an error
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // If update is successful, return success response with updated employee data
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    // Handle any errors that occur during update
    return res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
  }
});

export const googleSigninAndLogin = catchAsyncErrors(async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res
      .status(400)
      .json({ success: false, message: "Google idToken  is required" });
  }
  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    // Check if the user already exists in your database
    let user = await User.findOne({ email });
    if (!user) {
      // First-time login: create a new user
      user = await User.create({
        name,
        email,
        googleId: uid,
        logintype: "google", //new item add
        avatar: {
          public_id: uid,
          url: picture,
        },
      });
    } else {
      //new else add
      // if (user.logintype !== "google") {
      //   user.logintype = "google";
      //   await user.save();
      // }
      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            logintype: "google",
          },
        },
        { new: true }
      );
    }
    // Generate your own JWT token or session token for the user

    // await User.findOneAndUpdate(
    //   { email: email },
    //   { logintype: "google" },
    //   { new: true }
    // );
    console.log("google authtication doing.....");
    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ success: false, message: "id-token-expired" });
    }
    if (error.code === "auth/invalid-id-token") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid-id-token-expired" });
    }
    if (error.message?.includes("Decoding Firebase ID token failed")) {
      return res
        .status(401)
        .json({ success: false, message: "Decoding Firebase ID token failed" });
    }
    if (error.message?.includes("Firebase ID token has expired")) {
      return res
        .status(401)
        .json({ success: false, message: "Firebase ID token has expired" });
    }
    if (error.message?.includes("Firebase ID token is invalid")) {
      return res
        .status(401)
        .json({ success: false, message: "Firebase ID token is invalid" });
    }
    if (error.code === "auth/argument-error") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Google ID token format. Please retrieve a valid token from Firebase client SDK.",
      });
    }

    res
      .status(401)
      .json({ success: false, message: "Google Authentication failed" });
    // res.status(401).json({ success: false, message: error.message });
  }
});

//wish list functionality
// Add a product to the wishlist
export const AddproductTowishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req?.user?.id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res
      .status(200)
      .json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({
      message: err.message ? err.message : "Error adding product to wishlist!",
    });
  }
};

//Remove wishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.body;

  // Check if productId is provided
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    // Fetch the user by their ID
    const user = await User.findById(req?.user?.id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product is in the wishlist
    const wishlistItemExists = user?.wishlist?.some(
      (item) => item?.toString() === productId
    );
    if (!wishlistItemExists) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    // Remove the product from the wishlist
    user.wishlist = user?.wishlist?.filter(
      (item) => item?.toString() !== productId
    );
    await user.save();

    // Respond with success and updated wishlist
    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    // Handle possible errors and send meaningful messages
    if (err.name === "CastError") {
      res.status(400).json({ message: "Invalid user or product ID format" });
    } else if (err.name === "ValidationError") {
      res.status(400).json({ message: "Validation error" });
    } else {
      res.status(500).json({
        message: err.message || "Error removing product from wishlist!",
      });
    }
  }
};

// Get the user's wishlist
export const Mywishlist = async (req, res) => {
  try {
    const user = await User.findById(req?.user?.id).populate("wishlist");
    res.status(200).json({ success: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message ? err.message : "Something wentWrong!" });
  }
};

// google authtication

// export const googlelogin = async (req, res) => {
//   try {
//     const { code } = req.query;
//     const googleRes = await oauth2client.getToken(code);
//     oauth2client.setCredentials(googleRes.tokens);
//     const userRes = await axios.get(
//       `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
//     );
//     const { email, name, avatar } = userRes.data;
//     let user = await UserModel.findOne({ email });
//     if (!user) {
//       user = await UserModel.create({
//         name,
//         email,
//         avatar,
//         logintype: "google",
//       });
//     } else if (user.logintype !== "google") {
//       user.logintype = "google";
//       user.avatar = avatar;
//       user.name = name;
//       await user.save();
//     }
//     const { _id } = user;

//     const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
//       expiresIn: "12h",
//     });
//     return res.status(200).json({ message: "Success", token, user });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googlelogin = async (req, res) => {
  console.log("requvesting sending....");
  try {
    const { idToken } = req.body;
    console.log("idToken", idToken);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("ticket", ticket);
    const payload = ticket.getPayload();
    const { email, name, avatar } = payload;
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name,
        email,
        avatar,
        logintype: "google",
      });
    } else if (user.logintype !== "google") {
      user.logintype = "google";
      user.avatar = avatar;
      user.name = name;
      await user.save();
    }
    // prefer using sendToken to ensure SearchLimit and PlanId are populated/initialized
    sendToken(user, 200, res);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
