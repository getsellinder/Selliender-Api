import Invoice from "../Plans/Invoice.js";
import packageModel from "../Plans/Package.model.js";
import UserModel from "../user/userModel.js";
import Referal from "./Referal.model.js";

export const ReferralPlan = async (req, res) => {
  const { referralemail } = req.body;
  const userId = req.user._id;
  try {
    const findUser = await UserModel.findById(userId);

    const findPanPurches = await Invoice.findOne({
      userId: userId,
      status: "success",
    });
    if (!findUser) {
      return res.status(500).json({ message: "User not found" });
    }
    if (!findPanPurches) {
      return res.status(500).json({ message: "Invoice not found" });
    }
    let durtion = findPanPurches.duration;
    const PlanId = findUser.PlanId;
    const getPlan = await packageModel.findById(PlanId);
    if (!getPlan) {
      return res.status(500).json({ message: "Plan not found" });
    }
    let planduration;
    if (durtion === "monthly") {
      planduration = getPlan.monthlyUserLimit;
    } else {
      planduration = getPlan.yearlyUserLimit;
    }
    if (referralemail.length > planduration) {
      return res.status(500).json({
        message: `You can only add up to ${planduration} referral emails for this plan.`,
      });
    }

    let data = {
      referralemail,
      PlanId,
      userId,
    };
    await Referal.create(data);

    return res
      .status(200)
      .json({ message: "ReferenceUsers Created Successfully", planduration });
  } catch (error) {
    console.log("Erron in the PackageCreate", error);
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
      // remaining: limit - updatedUser.SearchLimit,
    });
  }




  catch (error) {
    console.log("countSearchlimit.error", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", Error: error.message });
  }
};