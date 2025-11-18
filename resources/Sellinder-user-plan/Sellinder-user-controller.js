import UserModel from "../user/userModel.js";
import {
  shordataformate,
  shortDateWithTime,
  timeFormat,
} from "../../Utils/formatDateToIST .js";
import Invoice from "../Plans/Invoice.js";
import packageModel from "../Plans/Package.model.js";

export const getusercurrentplan = async (req, res) => {
  try {
    const id = req.user._id;
    const findInvoice = await Invoice.findOne({
      userId: id,
      invoice_status: "Active",
      status: "success",
    })
      .populate("userId", "name _id SearchLimit")
      .populate({
        path: "PlanId",
        populate: {
          path: "GST",
          select: "Gst",
        },
      });

    if (!findInvoice) {
      return res.status(404).json({ message: "User Invoice not found" });
    }
    // present pln details
    let presetPlanAmont = findInvoice.Amount;
    let presentPlanDuration = findInvoice.duration;
    let presentPlan = findInvoice.PlanId.Package;

    const getplan = presentPlan === "Pro" ? "Growth" : "Pro";
    const findAllPlans = await packageModel.findOne({ Package: getplan });
    let selectMonthPrice = findAllPlans.Total_Monthly_Price;
    let selectYearPrice = findAllPlans.Total_Yearly_Price;
    let futurePlanAmount =
      presentPlanDuration === "monthly" ? selectMonthPrice : selectYearPrice;
    let AddtogetPlanAmount = Math.floor(futurePlanAmount - presetPlanAmont);

    let invoice = findInvoice.toObject();
    invoice.plan_start_date = shortDateWithTime(invoice.plan_start_date);
    invoice.plan_expiry_date = shortDateWithTime(invoice.plan_expiry_date);
    invoice.createdAt = shortDateWithTime(invoice.createdAt);
    invoice.Amount = invoice.Amount.toString();

    return res.status(200).json({
      findInvoice,
      AddtogetPlanAmount,
      getplan,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserBills = async (req, res) => {
  const limit = parseInt(req.query?.limit) || 7;
  const page = parseInt(req.query?.page) || 1;
  const search = req.query?.name || "";
  const date = req.query?.date || "";
  const userId = req.user._id;
  // const { id } = req.params;
  console.log("userId", userId);

  try {
    const planIds = await UserModel.distinct("PlanId", {
      _id: userId,
      PlanId: { $ne: null },
    });

    let filter = {
      userId: userId,
      PlanId: { $in: planIds },
      status: "success",
    };

    if (search) {
      filter.$or = [
        { TransactionId: { $regex: search, $options: "i" } },
        { InvoiceNo: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const datePart = date.split(",")[0];

      const [day, month, year] = datePart.split("/").map(Number);

      const start = new Date(year, month - 1, day, 0, 0, 0);

      const end = new Date(year, month - 1, day, 23, 59, 59);

      filter.createdAt = { $gte: start, $lte: end };
    }

    // Count total filtered invoices
    const totalItems = await Invoice.countDocuments(filter);

    // Get paginated invoices
    const getBills = await Invoice.find(filter)
      .populate("userId", "name _id SearchLimit")
      .populate({
        path: "PlanId",
        populate: {
          path: "GST",
          select: "Gst",
        },
      })
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

    totalAmount = Number(totalAmount).toLocaleString();

    return res.status(200).json({
      message: "Invoices fetched successfully",
      getresult,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,

      totalAmount,
    });
  } catch (error) {
    console.log("Error in getBills", error);
    return res.status(500).json({ message: error.message });
  }
};
