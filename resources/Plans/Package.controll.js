import { timeFormat } from "../../Utils/formatDateToIST .js";
import UserModel from "../user/userModel.js";
import Invoice from "./Invoice.js";
import packageModel from "./Package.model.js";


export const PackageCreate = async (req, res) => {
  try {
    const {
      Package,
      GST,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
    } = req.body;


    let data = {
      Package,
      GST,

      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
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
      .sort({ createdAt: -1 })
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
  const { id } = req.params

  try {
    const getUser = await UserModel.findById(id)
    if (!getUser) {
      return res.status(404).json({ message: "User not found" })
    }
    let PlanId = getUser.PlanId

    let getplanLimit = await packageModel.findById(PlanId)
    if (!getplanLimit) {
      return res.status(404).json({ message: "Plan not found" })
    }
    let limit = getplanLimit.PlanLimit
    let currentLimit = getUser.SearchLimit || 0
    if (currentLimit >= limit) {
      return res.status(405).json({ message: "Your search limit is over" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, { $inc: { SearchLimit: 1 } }, { new: true })


    return res.status(200).json({ message: "Search count updated", searchCount: updatedUser.SearchLimit, remaining: limit - updatedUser.SearchLimit })
  } catch (error) {
    console.log("countSearchlimit.error", error)
    return res.status(500).json({ message: "Internal Server Error", Error: error.message })
  }
}
export const PackageUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Package,
      GST,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
      Status,
    } = req.body;
    const getuser = await packageModel.findById(id);
    if (!getuser) {
      return res.status(404).json({ message: "Package not found" });
    }

    let data = {
      Package,
      GST,

      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
      Status,
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

export const PlanPurchese = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const { TransactionId, status, durationType } = req.body;
    if (!TransactionId) {
      return res.status(500).json({ message: "Please Mention TransactionId" })
    }
    const findPlan = await packageModel.findById(id)

    if (!findPlan) {
      return res.status(500).json({ message: "Plan not found" })
    }
    let startDate = new Date()
    let expiryDate = new Date(startDate)

    if (durationType === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1)
    } else if (durationType === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    }
    const add = {
      InvoiceNo: `INV-${Date.now()}`,
      userId,
      PlanId: id,
      status,
      plan_start_date: startDate,
      plan_expiry_date: expiryDate,
      Amount: durationType === "yearly" ? findPlan.Total_Yearly_Price : findPlan.Total_Monthly_Price,
      TransactionId,

    }
    let invoiceId = await Invoice.create(add)
    const userUpdate = await UserModel.findByIdAndUpdate(userId,
      { InvoiceId: invoiceId._id, PlanId: id, }, { new: true })

    return res.status(200).json({ invoiceId, userUpdate })


  } catch (error) {
    console.log("error PlanPurchese", error)
    return res.status(500).json({ message: error.message })
  }
}


// get invoice Details\

export const InvoiceDetailsById = async (req, res) => {
  const { id } = req.params
  try {

    const getinvoice = await Invoice.find({ userId: id })
      .populate("userId", "name _id").populate("PlanId", "Package _id").sort({ createdAt: -1 })
    if (!getinvoice) {
      return res.status(500).json({ message: "Invoice not found" })
    }

    const invoicesWithIndianDates = getinvoice.map(inv => ({
      ...inv.toObject(),
      plan_start_date: timeFormat(inv.plan_start_date),
      plan_expiry_date: timeFormat(inv.plan_expiry_date),
      createdAt: timeFormat(inv.createdAt),
      updatedAt: timeFormat(inv.updatedAt),
    }))
    return res.status(200).json(invoicesWithIndianDates)
  } catch (error) {
    console.log("error in InvoiceDetailsById", error)
    return res.status(500).json({ message: error.message })
  }
}