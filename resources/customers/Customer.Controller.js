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
    let limit = parseInt(req.query?.limit) || 10;
    let page = parseInt(req.query?.page) || 1;
    let skip = (page - 1) * limit;
    let search = req.query?.name || "";
    let status = req.query?.status || "";
    let filter = {};

    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }
    let total = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .populate("PlanId", "Package _id")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }
    let totalUsers = users.length;
    let activeUsers = users.filter((u) => u.status === "Active").length;
    let InactiveUsers = users.filter((u) => u.status === "Inactive").length;

    let result = users.map((user) => ({
      ...user.toObject(),
      createdAt: shordataformate(user.createdAt),
    }));
    return res.status(200).json({
      result,
      totalUsers,
      activeUsers,
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

// export const DashboardUsers = async (req, res) => {
//   try {
//     const user = await UserModel.find();
//     let totalUsers = user.length || 0;
//     let activeUser = user.filter((val) => val.status === "Active").length || 0;
//     let inactiveUser =
//       user.filter((val) => val.status === "Inactive").length || 0;
//     return res.status(200).json({ totalUsers, activeUser, inactiveUser });
//   } catch (error) {
//     console.log("DashboardUsers.error", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const DashboardUsers = async (req, res) => {
  try {
    let { month, year } = req.query;

    const now = new Date();
    if (!month || !year) {
      month = now.toLocaleString("en-US", { month: "short" }); // "Jan"
      year = now.getFullYear();
    }

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

    // ✅ Fetch users only once
    const allUsers = await UserModel.find();

    let totalUsers = allUsers.length || 0;
    let activeUser =
      allUsers.filter((val) => val.status === "Active").length || 0;
    let inactiveUser =
      allUsers.filter((val) => val.status === "Inactive").length || 0;

    // ✅ Filter users for selected month
    const monthUsers = allUsers.filter((u) => {
      const d = new Date(u.createdAt);
      return d.getMonth() === monthIndex && d.getFullYear() == year;
    });

    const monthUsersCount = monthUsers.length;
    const monthActive = monthUsers.filter((u) => u.status === "Active").length;
    const monthInactive = monthUsers.filter(
      (u) => u.status === "Inactive"
    ).length;

    // ✅ Prepare DAILY graph arrays
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const dailyRegistered = Array(daysInMonth).fill(0);
    const dailyInactive = Array(daysInMonth).fill(0);

    monthUsers.forEach((u) => {
      const day = new Date(u.createdAt).getDate() - 1;
      dailyRegistered[day]++;
      if (u.status === "Inactive") dailyInactive[day]++;
    });

    // ✅ Fetch monthly revenue from invoices
    const invoices = await Invoice.find({
      status: "success",
      createdAt: {
        $gte: new Date(year, monthIndex, 1),
        $lte: new Date(year, monthIndex, daysInMonth, 23, 59, 59),
      },
    });

    const dailyRevenue = Array(daysInMonth).fill(0);
    invoices.forEach((inv) => {
      const day = new Date(inv.createdAt).getDate() - 1;
      dailyRevenue[day] += inv.Amount || 0;
    });
    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + (inv.Amount || 0),
      0
    );
    const invoiceCountMap = {};
    invoices.forEach((inv) => {
      invoiceCountMap[inv.userId] = (invoiceCountMap[inv.userId] || 0) + 1;
    });

    // Users who purchased only once in this month = New users
    const newUsers = Object.entries(invoiceCountMap)
      .filter(([userId, count]) => count === 1)
      .map(([userId]) => userId);

    const newUsersCount = newUsers.length;

    // ✅ Daily new users for graph
    const dailyNewUsers = Array(daysInMonth).fill(0);
    invoices.forEach((inv) => {
      if (invoiceCountMap[inv.userId] === 1) {
        const day = new Date(inv.createdAt).getDate() - 1;
        dailyNewUsers[day]++;
      }
    });
    return res.status(200).json({
      selectedMonth: month,
      selectedYear: year,
      monthUsersCount,
      monthActive,
      monthInactive,
      totalRevenue,
      totalUsers,
      activeUser,
      inactiveUser,
      newUsersCount,
      chart: {
        labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        datasets: [
          { label: "Registered Users", data: dailyRegistered, borderWidth: 2 },
          { label: "Suspended Users", data: dailyInactive, borderWidth: 2 },
          { label: "Revenue", data: dailyRevenue, borderWidth: 2 },
          { label: "New Users", data: dailyNewUsers, borderWidth: 2 },
        ],
      },
    });
  } catch (error) {
    console.log("DashboardUsers.error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
