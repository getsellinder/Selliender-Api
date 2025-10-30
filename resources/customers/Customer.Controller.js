import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import { shordataformate, timeFormat } from "../../Utils/formatDateToIST .js";
import { sendBrevoEmail } from "../../Utils/sendEmail.js";
import Invoice from "../Plans/Invoice.js";
import packageModel from "../Plans/Package.model.js";
import { Config } from "../setting/Configration/Config_model.js";
import UserModel from "../user/userModel.js";

import User from "../user/userModel.js";

export const AddCusstomer = async (req, res) => {
  try {
    const { name, email, password, ConfirmPassword } = req.body;

    if (!name || !email || !password || !ConfirmPassword) {
      return res.status(404).json({ message: "All The Fileds Are Required" });
    }

    if (password.trim() !== ConfirmPassword.trim()) {
      return res
        .status(404)
        .json({ message: "Password Should be match with confirm Password" });
    }

    let findUser = await User.findOne({ email });
    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(200).json({
      message: "Customer created successfully",
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal Servar Error" });
  }
};


export const getAllCustomer = async (req, res) => {
  try {
    let limit = parseInt(req.query?.limit) || 4;
    let page = parseInt(req.query?.page) || 1;
    let skip = (page - 1) * limit
    let search = req.query?.name || "";

    const searchRegex = new RegExp(search, "i");
    let total = await UserModel.countDocuments(searchRegex)
    const users = await UserModel.find({
      name: { $regex: searchRegex },
    }).populate("PlanId", "Package _id");

    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }
    let totalUsers = users.length;
    let activeUsers = users.filter((u) => u.status === "Active").length;
    let InactiveUsers = users.filter((u) => u.status === "Inactive").length;

    let result=users.map((user)=>({
      ...user.toObject(),
    createdAt:shordataformate(user.createdAt)
    }))
    return res
      .status(200)
      .json({
        result, totalUsers, activeUsers,
        InactiveUsers,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
      });
  } catch (error) {
    console.log("getAllCustomer.error", error);
    return res.status(500).json({ message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  const { id } = req.params;


  try {
    const findId = await UserModel.findById(id);
    const sellinderAddress = await Config.find();
    if (!findId) {
      return res.status(400).json({ message: "user not found" });
    }
    if (!sellinderAddress) {
      return res
        .status(404)
        .json({ message: "Sellinder Address Details not found" });
    }

    const appName = sellinderAddress[0]?.appName || "Sellinder";
    const address =
      sellinderAddress[0]?.address[0]?.email || "support@sellinder.com";
    const newStatus = findId.status === "Active" ? "Inactive" : "Active";
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );
    const subject =
      newStatus === "Active"
        ? `✅ Your Account is Activated - ${appName}`
        : `⚠️ Your Account is Suspended - ${appName}`;
    const message =
      newStatus === "Active"
        ? `
      <p>Hi ${findId.name || ""},</p>

      <p>Great news! Your account has been successfully <b>activated</b>.</p>
      <p>You now have full access to the platform.</p>

      <p>If you have any questions, feel free to contact us.</p>

      <br/>
      <p>Thank you for being with us!</p>
      <p>Regards,</p>
      <p><b>Team ${appName}</b></p>
    `
        : `
      <p>Hi ${findId.name || ""},</p>

      <p>Your account has been <b>suspended</b> and access is temporarily disabled.</p>
      <p>If you believe this was a mistake or need assistance, please contact support.</p>

      <br/>
      <p>Regards,</p>
      <p><b>Team ${appName}</b></p>
    `;
    // await sendBrevoEmail({
    //   to: `${findId.email}`, // Change to your recipient
    //   fromEmail: address,
    //   fromName: appName, // Change to your verified sender
    //   subject,
    //   html: message,
    // });
    return res.status(200).json({
      message: `User status changed to ${newStatus}`,
      data: updatedUser,
    });
  } catch (error) {
    console.log("toggleStatus.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};
