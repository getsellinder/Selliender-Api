import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import { timeFormat } from "../../Utils/formatDateToIST .js";
import Invoice from "../Plans/Invoice.js";
import packageModel from "../Plans/Package.model.js";
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

export const getAllCustomer = catchAsyncErrors(async (req, res) => {
  let limit = parseInt(req.query?.limit) || 4;
  let page = parseInt(req.query?.page) || 1;

  let obj = {
    status: "success",
  };
  let userMatch = {};
  if (req.query?.name) {
    if (req.query?.name) {
      userMatch.name = { $regex: new RegExp(req.query.name, "i") };
    }
  }

  let planMatch = {};
  if (req.query?.plan) {
    planMatch.Package = { $regex: new RegExp(req.query.plan, "i") };
  }
  let findUser = await UserModel.find().populate("PlanId", "Package _id");
  // console.log("findUser", findUser);
  let userIds = findUser.map((u) => u._id);
  // console.log("userIds", userIds);
  // let findInvoice = await Invoice.find(planIds);
  let total = await UserModel.countDocuments(obj);

  // const customers = await Invoice.find(obj).populate("userId", "name email").populate("PlanId", "Package")

  let customers = await Invoice.find(obj)
    .populate({
      path: "userId",
      select: "name email _id",
      match: userMatch,
    })
    .populate({
      path: "PlanId",
      select: "Package _id",
      match: planMatch,
    })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
  customers = customers.filter((c) => c.userId && c.PlanId);
  if (customers.length === 0) {
    return res.status(200).json({ message: "No Customer Found" });
  }
  const data = customers.map((val) => ({
    ...val.toObject(),
    createdAt: timeFormat(val.createdAt),
    Amount: val.Amount.toLocaleString(),
  }));

  res.status(200).json({
    success: true,
    data,
    currentPage: page,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
  });
});

// export const getAllCustomer = catchAsyncErrors(async (req, res) => {

//   let limit = parseInt(req.query?.limit) || 4;
//   let page = parseInt(req.query?.page) || 1;

//   let obj = {
//     status: "success",

//   };
//   let userMatch = {}
//   if (req.query?.name) {
//     if (req.query?.name) {
//       userMatch.name = { $regex: new RegExp(req.query.name, "i") }
//     }
//   }

//   let planMatch = {};
//   if (req.query?.plan) {
//     planMatch.Package = { $regex: new RegExp(req.query.plan, "i") }
//   }
//   let total = await Invoice.countDocuments(obj);

//   // const customers = await Invoice.find(obj).populate("userId", "name email").populate("PlanId", "Package")

//   let customers = await Invoice.find(obj)
//     .populate({
//       path: "userId",
//       select: "name email _id",
//       match: userMatch,
//     })
//     .populate({
//       path: "PlanId",
//       select: "Package _id",
//       match: planMatch,
//     })
//     .limit(limit)
//     .skip((page - 1) * limit)
//     .sort({ createdAt: -1 });
//   customers = customers.filter(c => c.userId && c.PlanId);
//   if (customers.length === 0) {
//     return res.status(200).json({ message: "No Customer Found" })
//   }
//   const data = customers.map((val) => ({
//     ...val.toObject(),
//     createdAt: timeFormat(val.createdAt),
//     Amount: val.Amount.toLocaleString()

//   }))

//   res.status(200).json({
//     success: true,
//     data,
//     currentPage: page,
//     totalItems: total,
//     totalPages: Math.ceil(total / limit),
//   });
// });
