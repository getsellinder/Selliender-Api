
import mongoose from "mongoose";
import { datewithMonth, timeFormat } from "../../Utils/formatDateToIST .js";
import Invoice from "../Plans/Invoice.js";
import packageModel from "../Plans/Package.model.js";
import UserModel from "../user/userModel.js";

import { Tax } from "../Tax/tax_model.js";
import Referal from "../Referal/Referal.model.js";
import { UserRefreshClient } from "google-auth-library";

// export const getBills = async (req, res) => {
//   const limit = parseInt(req.query?.limit) || 7;
//   let page = parseInt(req.query?.page) || 1;
//   let search = req.query?.name || "";
//   let date = req.query?.date || "";

//   try {


//     const amount = await Invoice.find({ status: "success" });
//     const totalAmount = amount.reduce(
//       (sum, invoice) => sum + invoice.Amount,
//       0
//     );
//     const planDocs = await UserModel.find(
//       { PlanId: { $exists: true, $ne: null } },
//       { PlanId: 1, _id: 0 }
//     );
//     const planIds = planDocs.map((p) => p.PlanId);
//     let filter = { PlanId: { $in: planIds } };
//     const getBills = await Invoice.find(filter).populate(
//       "userId",
//       "name _id"
//     ).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
//     if (search) {
//       filter.$or = [
//         { TransactionId: { $regex: search, $options: "i" } },
//         { InvoiceNo: { $regex: search, $options: "i" } },
//       ];
//     }
//     if (date) {
//       const [day, month, year] = date.split("/").map(Number)
//       const start = new Date(year, month - 1, day, 0, 0, 0)
//       const end = new Date(year, month - 1, 23, 59, 59)
//       filter.createdAt = { $gte: start, $lte: end };
//     }
//     const totalsales = await Invoice.countDocuments({ status: "success" });
//     const totalItems = await Invoice.countDocuments(filter);
//     const getresult = getBills.map((val) => ({
//       ...val.toObject(),
//       createdAt: timeFormat(val.createdAt),
//       Amount: Number(val.Amount).toLocaleString(),
//     }));

//     return res
//       .status(200)
//       .json({
//         message: "ReferenceUsers Created Successfully",
//         getresult,
//         currentPage: page,
//         totalPages: Math.ceil(totalItems / limit),
//         totalItems,
//         totalsales,
//         totalAmount,
//       });
//   } catch (error) {
//     console.log("Erron in the PackageCreate", error);
//     return res.status(500).json({ message: error.message });
//   }
// };


export const getBills = async (req, res) => {
  const limit = parseInt(req.query?.limit) || 7;
  const page = parseInt(req.query?.page) || 1;
  const search = req.query?.name || "";
  const date = req.query?.date || "";

  try {
    // Get PlanIds
    const planIds = await UserModel.distinct("PlanId", { PlanId: { $ne: null } });

    // Build filter
    let filter = { PlanId: { $in: planIds } };

    if (search) {
      filter.$or = [
        { TransactionId: { $regex: search, $options: "i" } },
        { InvoiceNo: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const datePart = date.split(",")[0]

      const [day, month, year] = datePart.split("/").map(Number)

      const start = new Date(year, month - 1, day, 0, 0, 0)

      const end = new Date(year, month - 1, day, 23, 59, 59)

      filter.createdAt = { $gte: start, $lte: end }
    }

    // Count total filtered invoices
    const totalItems = await Invoice.countDocuments(filter);

    // Get paginated invoices
    const getBills = await Invoice.find(filter)
      .populate("userId", "name _id")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Format result
    const getresult = getBills.map((val) => ({
      ...val.toObject(),
      createdAt: timeFormat(val.createdAt),
      Amount: Number(val.Amount).toLocaleString(),
    }));

    // Total amount for all filtered invoices
    const totalAmountDocs = await Invoice.find(filter);
    let totalAmount = totalAmountDocs.reduce(
      (sum, invoice) => sum + Number(invoice.Amount),
      0
    );
    let totalsales = await Invoice.countDocuments({ status: "success" });
    totalsales = Number(totalsales).toLocaleString()
    totalAmount = Number(totalAmount).toLocaleString()

    return res.status(200).json({
      message: "Invoices fetched successfully",
      getresult,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      totalsales,
      totalAmount,
    });
  } catch (error) {
    console.log("Error in getBills", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getbillinvoice = async (req, res) => {
  const { id } = req.params; // User id


  try {
    const getinvoice = await Invoice.find({ userId: mongoose.Types.ObjectId(id) })
      .populate("userId", "phone name email")
      .populate("PlanId")
      .sort({ createdAt: -1 });
    if (!getinvoice || getinvoice.length === 0) {
      return res.status(404).json({ message: "No invoices found" })
    }
    const invoicesWithGST = await Promise.all(
      getinvoice.map(async (invoice) => {
        const invoiceData = invoice.toObject()
        let gstId = invoiceData?.PlanId?.GST;
        let getgst = gstId ? await Tax.findById(gstId) : null
        invoiceData.plan_start_date = datewithMonth(invoiceData.plan_start_date)
        invoiceData.plan_expiry_date = datewithMonth(invoiceData.plan_expiry_date)
        invoiceData.createdAt = datewithMonth(invoiceData.createdAt)
        if (invoiceData.Amount) {
          invoiceData.Amount = invoiceData.Amount.toLocaleString();
        }
        if (invoiceData.PlanId) {
          invoiceData.PlanId.Monthly_Price = invoiceData.PlanId.Monthly_Price?.toLocaleString();
          invoiceData.PlanId.Yearly_Price = invoiceData.PlanId.Yearly_Price?.toLocaleString();
          invoiceData.PlanId.Total_Yearly_Price = invoiceData.PlanId.Total_Yearly_Price?.toLocaleString();
          invoiceData.PlanId.Total_Monthly_Price = invoiceData.PlanId.Total_Monthly_Price?.toLocaleString();
          invoiceData.PlanId.gstMonthlyPrice = invoiceData.PlanId.gstMonthlyPrice?.toLocaleString();
          invoiceData.PlanId.gstYearlyPrice = invoiceData.PlanId.gstYearlyPrice?.toLocaleString();
        }
        invoiceData.GST = getgst ? getgst.Gst : null
        return invoiceData
      })
    )



    return res.status(200).json(invoicesWithGST);
  } catch (error) {
    console.log("getbillinvoice.error", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", Error: error.message });
  }
};




export const viewbilling = async (req, res) => {
  const { id } = req.params; // User id


  try {
    const getinvoice = await Invoice.findOne({ userId: mongoose.Types.ObjectId(id) })
      .populate("userId", "phone name email SearchLimit")
      .populate("PlanId")
      .sort({ createdAt: -1 });
    if (!getinvoice || getinvoice.length === 0) {
      return res.status(404).json({ message: "No invoices found" })
    }
    const referal = await Referal.findOne({ userId: id });
    let viewReferral = null;
    if (referal) {
      viewReferral = referal.toObject();
      viewReferral.createdAt = datewithMonth(viewReferral.createdAt);
    }

    // const invoicesWithGST = await Promise.all(
    //   getinvoice.map(async (invoice) => {
    //     const invoiceData = invoice.toObject()
    //     let gstId = invoiceData?.PlanId?.GST;
    //     let getgst = gstId ? await Tax.findById(gstId) : null
    //     invoiceData.plan_start_date = datewithMonth(invoiceData.plan_start_date)
    //     invoiceData.plan_expiry_date = datewithMonth(invoiceData.plan_expiry_date)
    //     invoiceData.createdAt = datewithMonth(invoiceData.createdAt)
    //     if (invoiceData.Amount) {
    //       invoiceData.Amount = invoiceData.Amount.toLocaleString();
    //     }
    //     if (invoiceData.PlanId) {
    //       invoiceData.PlanId.Monthly_Price = invoiceData.PlanId.Monthly_Price?.toLocaleString();
    //       invoiceData.PlanId.Yearly_Price = invoiceData.PlanId.Yearly_Price?.toLocaleString();
    //       invoiceData.PlanId.Total_Yearly_Price = invoiceData.PlanId.Total_Yearly_Price?.toLocaleString();
    //       invoiceData.PlanId.Total_Monthly_Price = invoiceData.PlanId.Total_Monthly_Price?.toLocaleString();
    //       invoiceData.PlanId.gstMonthlyPrice = invoiceData.PlanId.gstMonthlyPrice?.toLocaleString();
    //       invoiceData.PlanId.gstYearlyPrice = invoiceData.PlanId.gstYearlyPrice?.toLocaleString();
    //     }
    //     invoiceData.GST = getgst ? getgst.Gst : null
    //     return invoiceData
    //   })
    // )

    const invoicesWithGST = getinvoice.toObject()
    invoicesWithGST.plan_start_date = datewithMonth(invoicesWithGST.plan_start_date)
    invoicesWithGST.plan_expiry_date = datewithMonth(invoicesWithGST.plan_expiry_date)
    invoicesWithGST.Amount = invoicesWithGST.Amount.toLocaleString();
    invoicesWithGST.createdAt = datewithMonth(invoicesWithGST.createdAt)




    return res.status(200).json({ viewReferral, invoicesWithGST });
  } catch (error) {
    console.log("getbillinvoice.error", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", Error: error.message });
  }
};