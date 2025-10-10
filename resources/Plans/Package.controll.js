import { timeFormat } from "../../Utils/formatDateToIST .js";
import razorpayInstance from "../../Utils/razorpay.js";
import { Tax } from "../Tax/tax_model.js";
import UserModel from "../user/userModel.js";
import Invoice from "./Invoice.js";
import packageModel from "./Package.model.js";

export const PackageCreate = async (req, res) => {
  try {
    const {
      Package,
      GST,
      yearlyUserLimit,
      monthlyUserLimit,
      SearchLimitMonthly,
      SearchLimitYearly,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,

      name,
      Monthly_features,
      Yearly_features,
    } = req.body;

    let data = {
      Package,
      GST,
      yearlyUserLimit,
      monthlyUserLimit,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      SearchLimitMonthly,
      SearchLimitYearly,
      name,
      Monthly_features,
      Yearly_features,
    };
    const add = await packageModel.create(data);
    return res
      .status(200)
      .json({ message: "Package Created Successfully", add });
  } catch (error) {
    console.log("Erron in the PackageCreate", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getByIdPackage = async (req, res) => {
  try {
    const { id } = req.params;
    let Findpackage = await packageModel
      .findById(id)
      .populate("GST", "name Gst active");

    if (!Findpackage) {
      return res
        .status(404)
        .json({ message: "Package not found with this Id" });
    }

    return res.status(200).json(Findpackage);
  } catch (error) {
    console.log("Erron in the getByIdPackage", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const getAllPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const { packagename } = req.query;

    const filter = {
      Status: "Active",
    };
    let skip = (page - 1) * limit;

    if (packagename) {
      filter.Package = { $regex: new RegExp(packagename, "i") };
    }

    const total = await packageModel.countDocuments(filter);
    let getpackages = await packageModel
      .find(filter)
      .populate("GST", "name Gst active")
      .sort({ createdAt: 1 })
      .skip(skip)

      .limit(limit);
    return res.status(200).json({
      getpackages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.log("Erron in the getAllPackages", error);
    return res.status(500).json({ message: error });
  }
};

export const PackageDelete = async (req, res) => {
  try {
    const { id } = req.params;
    let Findpackage = await packageModel.findById(id);

    if (!Findpackage) {
      return res
        .status(404)
        .json({ message: "Package not found with this Id" });
    }
    const dlt = await packageModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Package Deleted Successfully", dlt });
  } catch (error) {
    console.log("Erron in the PackageDelete", error);
    return res.status(500).json({ message: error.message });
  }
};
export const countSearchlimit = async (req, res) => {
  const { id } = req.params; // User id

  try {
    const getUser = await UserModel.findById(id);
    const getUserInvoice = await Invoice.findOne({ id: id }).sort({
      createdAt: -1,
    });
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!getUserInvoice) {
      return res.status(500).json({ message: "Invoice not found" });
    }
    let PlanId = getUser.PlanId;

    let getplanLimit = await packageModel.findById(PlanId);
    if (!getplanLimit) {
      return res.status(404).json({ message: "Plan not found" });
    }
    console.log("getplanLimit", getplanLimit);
    let limitMonth = getplanLimit?.SearchLimitMonthly ?? 0;
    let limitYear = getplanLimit?.SearchLimitYearly ?? 0;
    let currentLimit = getUser?.SearchLimit ?? 0;

    let activeLimit =
      getplanLimit.Total_Yearly_Price == null ? limitMonth : limitYear;

    if (currentLimit >= activeLimit) {
      return res.status(405).json({ message: "Your search limit is over" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { SearchLimit: 1 } },
      { new: true }
    );

    return res.status(200).json({
      message: "Search count updated",
      searchCount: updatedUser.SearchLimit,
      remaining: limit - updatedUser.SearchLimit,
    });
  } catch (error) {
    console.log("countSearchlimit.error", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", Error: error.message });
  }
};

// export const countSearchlimit = async (req, res) => {
//   const { id } = req.params // User id

//   try {
//     const getUser = await UserModel.findById(id)
//     const getUserInvoice = await Invoice.findOne({ id: id }).sort({ createdAt: -1 })
//     if (!getUser) {
//       return res.status(404).json({ message: "User not found" })
//     }
//     if (!getUserInvoice) {
//       return res.status(500).json({ message: "Invoice not found" })
//     }
//     let PlanId = getUserInvoice.PlanId

//     let getplanLimit = await packageModel.findById(PlanId)
//     if (!getplanLimit) {
//       return res.status(404).json({ message: "Plan not found" })
//     }
//     console.log("getplanLimit", getplanLimit)
//     let limitMonth = getplanLimit?.SearchLimitMonthly ?? 0
//     let limitYear = getplanLimit?.SearchLimitYearly ?? 0
//     let currentLimit = getUser?.SearchLimit ?? 0

//     let activeLimit = getplanLimit.Total_Yearly_Price == null ? limitMonth : limitYear

//     if (currentLimit >= activeLimit) {
//       return res.status(405).json({ message: "Your search limit is over" });
//     }

//     const updatedUser = await UserModel.findByIdAndUpdate(id, { $inc: { SearchLimit: 1 } }, { new: true })

//     return res.status(200).json({ message: "Search count updated", searchCount: updatedUser.SearchLimit, remaining: limit - updatedUser.SearchLimit })
//   } catch (error) {
//     console.log("countSearchlimit.error", error)
//     return res.status(500).json({ message: "Internal Server Error", Error: error.message })
//   }
// }

export const PackageUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Package,
      GST,
      yearlyUserLimit,
      monthlyUserLimit,
      SearchLimitMonthly,
      SearchLimitYearly,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
      Status,
      gstMonthlyPrice,
      gstYearlyPrice,
    } = req.body;
    const getuser = await packageModel.findById(id);
    if (!getuser) {
      return res.status(404).json({ message: "Package not found" });
    }

    let data = {
      Package,
      GST,
      yearlyUserLimit,
      monthlyUserLimit,
      SearchLimitMonthly,
      SearchLimitYearly,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
      Status,
      gstMonthlyPrice,
      gstYearlyPrice,
    };
    let update = await packageModel.findByIdAndUpdate(id, data, { new: true });
    return res
      .status(200)
      .json({ message: "Package Updated Successfully", update });
  } catch (error) {
    console.log("Erron in the PackageUpdate", error);
    return res.status(500).json({ message: error.message });
  }
};

// User purcheing the Plan APIS

// export const PlanPurchese = async (req, res) => {
//   try {
//     const { id } = req.params
//     const userId = req.user._id

//     const { durationType } = req.body;

//     const findPlan = await packageModel.findById(id)

//     const finduser = await UserModel.findById(userId)
//     if (!findPlan) {
//       return res.status(505).json({ message: "Plan not found" })
//     }
//     if (!finduser) {
//       return res.status(506).json({ message: "User not found" })
//     }
//     let planAmount = 0
//     if (durationType === "monthly") {
//       planAmount = findPlan?.Total_Monthly_Price ?? 0
//     } else if (durationType === "yearly") {
//       planAmount = findPlan?.Total_Monthly_Price ?? 0
//     }
//     else {
//       return res.status(400).json({ message: "Invalid duration type" });
//     }
//     const options = {
//       amount: planAmount * 100,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,

//     }
//     const order = await razorpayInstance.orders.create(options)
//     // let startDate = new Date()
//     // let expiryDate = new Date(startDate)

//     // if (durationType === "monthly") {
//     //   expiryDate.setMonth(expiryDate.getMonth() + 1)
//     // } else if (durationType === "yearly") {
//     //   expiryDate.setFullYear(expiryDate.getFullYear() + 1)
//     // }
//     // const add = {
//     //   InvoiceNo: `INV-${Date.now()}`,
//     //   userId,
//     //   PlanId: findPlan._id,
//     //   plan_start_date: startDate,
//     //   plan_expiry_date: expiryDate,
//     //   Amount: planAmount,
//     //   TransactionId: order.id,
//     //   status: "success"

//     // }
//     // let invoiceId = await Invoice.create(add)
//     // await UserModel.findByIdAndUpdate(userId,
//     //   { InvoiceId: invoiceId._id, PlanId: id, }, { new: true })

//     res.status(200).json({
//       success: true,

//       key_id: process.env.RAZORPAY_KEY_ID,
//       order_id: order.id,
//       amount: planAmount || 0,
//       currency: "INR",
//       message: "Order created successfully",
//     });

//   } catch (error) {
//     console.error("❌ PlanPurchese Error:", error);
//     return res.status(500).json({ message: error });
//   }
// }

export const PlanPurchese = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const { durationType } = req.body;

    const findPlan = await packageModel.findById(id);

    const finduser = await UserModel.findById(userId);
    if (!findPlan) {
      return res.status(505).json({ message: "Plan not found" });
    }
    if (!finduser) {
      return res.status(506).json({ message: "User not found" });
    }
    let planAmount = 0;
    let message = "";
    if (durationType === "monthly") {
      planAmount = findPlan?.Total_Monthly_Price ?? 0;
    } else if (durationType === "yearly") {
      planAmount = findPlan?.Total_Yearly_Price ?? 0;
      planAmount = planAmount * 0.8; //20% discount on yearly plan
      message = `You selected yearly plan. You got 20% discount!`;
    } else {
      return res.status(400).json({ message: "Invalid duration type" });
    }

    if (planAmount === 0) {
      const startDate = new Date();
      const expiryDate = new Date(startDate);

      if (durationType === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Create free invoice record
      const add = {
        InvoiceNo: `INV-${Date.now()}`,
        userId,
        PlanId: findPlan._id,
        plan_start_date: startDate,
        plan_expiry_date: expiryDate,
        Amount: 0,
        duration: durationType,
        TransactionId: null,
        status: "success",
      };

      await Invoice.create(add);

      await UserModel.findByIdAndUpdate(
        userId,
        { PlanId: findPlan._id },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Free plan activated successfully",
        planId: id,
      });
    }
    let amountInPaise = Math.round(planAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,

      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: planAmount || 0,
      currency: "INR",
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ PlanPurchese Error:", error);
    return res.status(500).json({ message: error });
  }
};

export const ConfirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { durationType, razorpayPaymentId, planAmount, orderId } = req.body;
    const findPlan = await packageModel.findById(id);
    if (!findPlan) return res.status(404).json({ message: "Plan not found" });

    let startDate = new Date();
    let expiryDate = new Date(startDate);

    if (durationType === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (durationType === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const add = {
      InvoiceNo: `INV-${Date.now()}`,
      userId,
      PlanId: findPlan._id,
      plan_start_date: startDate,
      plan_expiry_date: expiryDate,
      Amount: planAmount,
      duration: durationType,
      TransactionId: razorpayPaymentId,
      status: "success",
    };
    await Invoice.create(add);
    await UserModel.findByIdAndUpdate(
      userId,
      { PlanId: findPlan._id },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Payment confirmed Successfully and invoice stored",
    });
  } catch (error) {
    console.log("ConfirmPayment.error", error);
    return res.status(500).json({ message: error.message });
  }
};

// get invoice Details\

export const InvoiceDetailsById = async (req, res) => {
  const { id } = req.params; //invoice id
  try {
    const getinvoice = await Invoice.findById(id)

      .populate("userId", "phone name email")
      .populate("PlanId")
      .sort({ createdAt: -1 });
    let gstId = getinvoice?.PlanId?.GST;
    const getgst = await Tax.findById(gstId);
    if (!getgst) {
      return res.status(500).json({ message: "GST not found" });
    }
    if (!getinvoice) {
      return res.status(500).json({ message: "Invoice not found" });
    }

    // let invoiceData = getinvoice.map((val) => ({
    //   ...val.toObject(),
    //   plan_start_date: timeFormat(val.plan_start_date),
    //   plan_expiry_date: timeFormat(val.plan_expiry_date),
    //   Amount: val.Amount.toLocaleString(),
    // }));
    let invoiceData = getinvoice.toObject();
    (invoiceData.plan_start_date = timeFormat(invoiceData.plan_start_date)),
      (invoiceData.plan_expiry_date = timeFormat(invoiceData.plan_expiry_date)),
      (invoiceData.createdAt = timeFormat(invoiceData.createdAt)),
      (invoiceData.Amount = invoiceData.Amount.toLocaleString());
    invoiceData.GST = getgst.Gst;

    return res.status(200).json(invoiceData);
  } catch (error) {
    console.log("error in InvoiceDetailsById", error);
    return res.status(500).json({ message: error.message });
  }
};
