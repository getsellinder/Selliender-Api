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

// export const getAllCustomer = catchAsyncErrors(async (req, res) => {
//   let limit = parseInt(req.query?.limit) || 4;
//   let page = parseInt(req.query?.page) || 1;
//   let search = req.query?.name || "";

//   const searchRegex = new RegExp(search, "i");

//   // ✅ 1. Find matching users and plans
//   const users = await UserModel.find({ name: { $regex: searchRegex } }).select(
//     "_id"
//   );
//   const plans = await packageModel
//     .find({ Package: { $regex: searchRegex } })
//     .select("_id");

//   const userIds = users.map((u) => u._id);
//   const planIds = plans.map((p) => p._id);

//   // ✅ 2. Build the invoice filter (either user name or plan name matches)
//   const filter = {
//     status: "success",
//     $or: [{ userId: { $in: userIds } }, { PlanId: { $in: planIds } }],
//   };

//   // ✅ 3. Get invoices with populate
//   let invoices = await Invoice.find(filter)
//     .populate({
//       path: "userId",
//       select: "name email _id",
//     })
//     .populate({
//       path: "PlanId",
//       select: "Package _id",
//     })
//     .sort({ createdAt: -1 });

//   // ✅ 4. Remove duplicates (one invoice per user)
//   const seenUserIds = new Set();
//   const uniqueInvoices = [];

//   for (const inv of invoices) {
//     if (inv.userId && !seenUserIds.has(inv.userId._id.toString())) {
//       seenUserIds.add(inv.userId._id.toString());
//       uniqueInvoices.push(inv);
//     }
//   }

//   // ✅ 5. Pagination
//   const totalItems = uniqueInvoices.length;
//   const startIndex = (page - 1) * limit;
//   const paginatedInvoices = uniqueInvoices.slice(
//     startIndex,
//     startIndex + limit
//   );

//   if (paginatedInvoices.length === 0) {
//     return res.status(200).json({ message: "No Customer Found" });
//   }

//   // ✅ 6. Format response
//   const data = paginatedInvoices.map((val) => ({
//     ...val.toObject(),
//     createdAt: timeFormat(val.createdAt),
//     Amount: val.Amount?.toLocaleString(),
//   }));

//   res.status(200).json({
//     success: true,
//     data,
//     currentPage: page,
//     totalItems,
//     totalPages: Math.ceil(totalItems / limit),
//   });
// });

export const getAllCustomer = catchAsyncErrors(async (req, res) => {
  let limit = parseInt(req.query?.limit) || 4;
  let page = parseInt(req.query?.page) || 1;
  let search = req.query?.name || "";
  const searchRegex = new RegExp(search, "i");

  // ✅ Find users
  const users = await UserModel.find({ name: { $regex: searchRegex } })
    .select("_id name email createdAt")
    .sort({ createdAt: -1 });

  const userData = [];

  for (const user of users) {
    // ✅ Find user's latest invoice (any status)
    const latestInvoice = await Invoice.findOne({ userId: user._id })
      .populate("PlanId", "Package price duration plan_expiry_date")
      .sort({ createdAt: -1 });

    let planStatus = "not_taken";
    let planDetails = null;

    if (latestInvoice) {
      const today = new Date();
      const expiryDate = latestInvoice?.PlanId?.plan_expiry_date
        ? new Date(latestInvoice.PlanId.plan_expiry_date)
        : null;

      if (latestInvoice.status === "success") {
        if (expiryDate && expiryDate < today) {
          planStatus = "expired";
        } else {
          planStatus = "active";
        }
        planDetails = latestInvoice.PlanId;
      } else if (latestInvoice.status === "failed") {
        planStatus = "failed";
      }
    }

    userData.push({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: timeFormat(user.createdAt),
      planStatus,
      planDetails,
    });
  }

  // ✅ Pagination
  const totalItems = userData.length;
  const startIndex = (page - 1) * limit;
  const paginatedUsers = userData.slice(startIndex, startIndex + limit);

  // ✅ Count tracking
  const planTakenCount = userData.filter(
    (u) => u.planStatus === "active"
  ).length;
  const planExpiredCount = userData.filter(
    (u) => u.planStatus === "expired"
  ).length;
  const planFailureCount = userData.filter(
    (u) => u.planStatus === "failed"
  ).length;
  const planNotTakenCount = userData.filter(
    (u) => u.planStatus === "not_taken"
  ).length;

  res.status(200).json({
    success: true,
    stats: {
      totalUsers: totalItems,
      planTakenCount,
      planExpiredCount,
      planFailureCount,
      planNotTakenCount,
    },
    data: paginatedUsers,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});



