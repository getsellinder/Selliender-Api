import {
  datewithMonth,
  shordataformate,
  timeFormat,
} from "../../Utils/formatDateToIST .js";
import razorpayInstance from "../../Utils/razorpay.js";
import { sendBrevoEmail } from "../../Utils/sendEmail.js";
import { Config } from "../setting/Configration/Config_model.js";
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
    // const userId = req.user._id;

    const { durationType, userId } = req.body;

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
      order,
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

    const {
      durationType,
      razorpayPaymentId,
      planAmount,
      userId,
      paymentStatus,
      razorpaySignature,
      razorpayOrderId,
    } = req.body;
    const findPlan = await packageModel.findById(id);
    const findUser = await UserModel.findById(userId);
    const findTax = await Tax.findById(findPlan.GST);
    const sellinderAddress = await Config.find();
    if (!findPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    if (!findUser) {
      return res.status(404).json({ message: "User  not found" });
    }
    const appName = sellinderAddress[0]?.appName || "Sellinder";
    const address =
      sellinderAddress[0]?.address[0]?.email || "support@sellinder.com";
    const logo = sellinderAddress[0]?.logo[0]?.Headerlogo?.url;
    const copyright = sellinderAddress[0].copyrightMessage;
    let gstcalculate;

    let startDate = new Date();
    let expiryDate = new Date(startDate);
    let planOriginalAmount;

    let gstnumber = findTax.Gst;
    let searchLimit;
    let userLimit;

    if (durationType === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      planOriginalAmount = findPlan.Monthly_Price;
      searchLimit = findPlan.SearchLimitMonthly;
      userLimit = findPlan.monthlyUserLimit;
    } else if (durationType === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      planOriginalAmount = findPlan.Yearly_Price;
      searchLimit = findPlan.SearchLimitYearly;
      userLimit = findPlan.yearlyUserLimit;
    }

    gstcalculate = ((planOriginalAmount * gstnumber) / 100).toFixed(2);
    const add = {
      InvoiceNo: `INV${Date.now()}`,
      userId,
      PlanId: findPlan._id,
      plan_start_date: startDate,
      plan_expiry_date: expiryDate,
      RazorpayOrderId: razorpayOrderId,
      Amount: planAmount,
      RazorpaySignature: razorpaySignature,
      duration: durationType,
      TransactionId: razorpayPaymentId,
      status: paymentStatus,
    };
    let invoice = await Invoice.create(add);
    await UserModel.findByIdAndUpdate(
      userId,
      { PlanId: findPlan._id },
      { new: true }
    );

    await sendBrevoEmail({
      to: findUser.email,
      fromEmail: address,
      fromName: appName,
      subject: `${appName} Invoice Plan Details`,
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0a2c60, #143d80); color: white; padding: 25px;">
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${logo}" alt="Sellinder Logo" width="120" />
   
      </div>
    </div>

    <!-- Invoice Info -->
    <div style="padding: 25px;">
      <h3 style="margin: 0 0 10px;">INVOICE</h3>
      <p style="margin: 0;">Invoice Number: <strong>${invoice.InvoiceNo
        }</strong></p>
     
      <p style="margin: 0;">Date: <strong>${shordataformate(
          invoice.createdAt
        )}</strong></p>
    </div>

    <!-- Table -->
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #143d80; color: white;">
          <th style="padding: 10px; text-align: left;">#</th>
          <th style="padding: 10px; text-align: left;">Plan</th>
          <th style="padding: 10px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">1</td>
          <td style="padding: 10px;">${findPlan.Package}</td>
          <td style="padding: 10px; text-align: right;">₹${Number(planOriginalAmount.toFixed(2)).toLocaleString()}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;"></td>
          <td style="padding: 10px;">${shordataformate(
          invoice.plan_start_date
        )}-${shordataformate(invoice.plan_expiry_date)}</td>
          <td style="padding: 10px; text-align: right;"></td>
        </tr>
          <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;"></td>
          <td style="padding: 10px;">${searchLimit} Profile Monthly </td>
          <td style="padding: 10px; text-align: right;"></td>
        </tr>
         </tr>
          <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;"></td>
          <td style="padding: 10px;">    Up to ${userLimit} user</td>
          <td style="padding: 10px; text-align: right;"></td>
        </tr>
      </tbody>
    </table>

    <!-- Plan & Totals Section -->
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        margin: 20px 0;
        padding: 20px 25px;
      "
    >
      <!-- Left side: Plan Details -->
 

      <!-- Divider -->
  

      <!-- Right side: Totals -->
      <div style="width: 100%; text-align: right;">
 
        <p style="margin: 0; font-size: 14px;">
          Sub Total: <strong>₹${Number(planOriginalAmount.toFixed(2)).toLocaleString()}</strong>
        </p>
        <p style="margin: 0; font-size: 14px;">
          GST ${gstnumber}%: <strong>₹${Number(gstcalculate).toLocaleString()}</strong>
        </p>
        <h3 style="margin: 10px 0 0; color: #000;">
          Total: ₹${Number(invoice.Amount.toFixed(2)).toLocaleString()}

        </h3>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #143d80, #0a2c60); color: white; text-align: center; padding: 15px; font-size: 14px;">
      <strong>${copyright}</strong>
    </div>

  </div>
  `,
    });

    res.status(200).json({
      success: true,
      message: "Payment confirmed Successfully and invoice stored",
      sellinderAddress,
    });
  } catch (error) {
    console.log("ConfirmPayment.error", error);
    return res.status(500).json({ message: error.message });
  }
};

export const InvoiceDetailsById = async (req, res) => {
  const { id } = req.params; //userId id
  try {
    const getinvoice = await Invoice.find({ userId: id })
      .populate("userId", "phone name email")
      .populate("PlanId")
      .sort({ createdAt: -1 });
    if (!getinvoice || getinvoice.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }
    const invoicesWithGST = await Promise.all(
      getinvoice.map(async (invoice) => {
        const invoiceData = invoice.toObject();
        let gstId = invoiceData?.PlanId?.GST;
        let getgst = gstId ? await Tax.findById(gstId) : null;
        invoiceData.plan_start_date = datewithMonth(
          invoiceData.plan_start_date
        );
        invoiceData.plan_expiry_date = datewithMonth(
          invoiceData.plan_expiry_date
        );
        invoiceData.createdAt = datewithMonth(invoiceData.createdAt);
        if (invoiceData.Amount) {
          invoiceData.Amount = invoiceData.Amount.toLocaleString();
        }
        if (invoiceData.PlanId) {
          invoiceData.PlanId.Monthly_Price =
            invoiceData.PlanId.Monthly_Price?.toLocaleString();
          invoiceData.PlanId.Yearly_Price =
            invoiceData.PlanId.Yearly_Price?.toLocaleString();
          invoiceData.PlanId.Total_Yearly_Price =
            invoiceData.PlanId.Total_Yearly_Price?.toLocaleString();
          invoiceData.PlanId.Total_Monthly_Price =
            invoiceData.PlanId.Total_Monthly_Price?.toLocaleString();
          invoiceData.PlanId.gstMonthlyPrice =
            invoiceData.PlanId.gstMonthlyPrice?.toLocaleString();
          invoiceData.PlanId.gstYearlyPrice =
            invoiceData.PlanId.gstYearlyPrice?.toLocaleString();
        }
        invoiceData.GST = getgst ? getgst.Gst : null;
        return invoiceData;
      })
    );

    return res.status(200).json(invoicesWithGST);
  } catch (error) {
    console.log("error in InvoiceDetailsById", error);
    return res.status(500).json({ message: error.message });
  }
};
