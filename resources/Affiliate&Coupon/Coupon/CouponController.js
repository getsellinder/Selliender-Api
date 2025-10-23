import { AffiliateModel } from "../Affiliate/AffiliateModel.js"; //Note AffiliteModel is binded with coupons

//GET ALL Coupons
export const listAllCoupon = async (req, res) => {
  try {
    const coupon = await AffiliateModel.find(
      {},
      {
        name: 1,
        _id: 1,
        coupon_code: 1,
        discount_amount: 1,
        affiliate_discount_amount: 1,
        is_coupon_active: 1,
      }
    ).sort({ createdAt: -1 });
    const filteredCoupons = coupon.filter(
      (data) => !(data.coupon_code == null)
    );
    // console.log(filteredCoupons);
    // console.log(coupon);

    res.status(200).json({
      success: true,
      message: filteredCoupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};
//CREATE Coupon (AKA Need to update Affiliate )
export const createCoupon = async (req, res) => {
  //creation of date
  const date = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const dateOfMonth = date.getUTCDate();
  const month = monthsOfYear[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const formattedDate = `${dayOfWeek} ${dateOfMonth}-${month}-${year}`;
  const {
    coupon_code,
    discount_amount,
    valid_till,
    is_coupon_active,
    affiliate_discount_amount,
  } = req.body;
  try {
    const { id } = req.body;
    const update = {
      coupon_code,
      discount_amount,
      valid_till,
      affiliate_discount_amount,
      createdAt: formattedDate,
      is_coupon_active,
    };
    const options = { new: true };
    const saveData = await AffiliateModel.findByIdAndUpdate(
      id,
      update,
      options
    );

    if (saveData) {
      res.json("done");
    } else {
      res.status(404).json("Affiliate not found");
    }
  } catch (error) {
    res.status(400).json({
      success: true,
      message: "Coupon Already Exists",
    });
    console.log(error);
  }
};

//GET AFFILIATE FOR COUPON LIST
export const listAffiliateCoupon = async (req, res) => {
  try {
    let resArr = [];
    const coupon = await AffiliateModel.find(
      { is_coupon_active: true },
      {
        name: 1,
        _id: 1,
        is_coupon_active: 1,
        mobile: 1,
      }
    );
    // console.log(coupon)
    for (let i = 0; i < coupon?.length; i++) {
      if (coupon[i].is_coupon_active == true) {
        resArr.push(coupon[i]);
      }
    }
    res.status(200).json({
      success: true,
      message: resArr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};
//EDIT COUPON
export const editCoupon = async (req, res) => {
  const {
    coupon_code,
    discount_amount,
    valid_till,
    affiliate_discount_amount,
  } = req.body;

  const updateFields = {};

  // Add only the fields that are present in the request body to the updateFields object
  if (coupon_code) updateFields.coupon_code = coupon_code;
  if (discount_amount) updateFields.discount_amount = discount_amount;
  if (valid_till) updateFields.valid_till = valid_till;
  if (affiliate_discount_amount)
    updateFields.affiliate_discount_amount = affiliate_discount_amount;

  try {
    const saveData = await AffiliateModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      { new: true }
    );
    res.json({
      success: true,
      message: "Coupon Edited Succesfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
        ? error.message
          .split(":")
          .splice(1)
          .join(":")
          .trim()
          .split(":")
          .splice(1)
          .join(":")
          .trim()
        : "Error in Editing Coupon",
    });
  }
};
//SUSPEND COUPON
export const suspendCoupon = async (req, res) => {
  const { id, is_coupon_active } = req.body;
  try {
    const saveData = await AffiliateModel.findByIdAndUpdate(id, {
      is_coupon_active: is_coupon_active,
    });
    res.status(200).json({
      success: true,
      message: "Success",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Coupon Doesn't Exists",
    });
  }
};

//GET ONE COUPON
export const getOneCoupon = async (req, res) => {
  if (req.params?.id) {
    try {
      const saveData = await AffiliateModel.findById(req.params.id);

      const resObj = {
        name: saveData.name,
        mobile: saveData.mobile,
        coupon_code: saveData.coupon_code,
        discount_amount: saveData.discount_amount,
        valid_till: saveData.valid_till,
        affiliate_discount_amount: saveData.affiliate_discount_amount,
      };
      res.status(200).json({
        success: true,
        message: resObj,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in getting Coupons",
      });
    }
  }
};

//Validate Coupon-----------------------
export const validateCoupon = async (req, res) => {
  try {
    const { coupon } = req.params;
    // Check if coupon code is provided
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    // Find the coupon data in the database
    const couponData = await AffiliateModel.findOne({ coupon_code: coupon });

    // Check if coupon exists
    if (!couponData) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const { valid_till, discount_amount, is_coupon_active } = couponData;

    // Check if coupon is active
    if (!is_coupon_active) {
      return res.status(404).json({
        success: false,
        message: "Coupon is not active",
      });
    }

    // Check if the coupon has expired
    const currentDate = new Date();
    const expirationDate = new Date(valid_till);

    if (expirationDate <= currentDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // If coupon is valid, return success response
    return res.status(200).json({
      success: true,
      message: "Coupon is valid",
      discount_amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//PAY & HISTORY---------------------
export const usedCoupon = async (req, res) => {
  // Retrieve orderId and coupon_code from request body or query parameters
  const { orderId, coupon_code, userId } = req.body;
  if (!orderId || !coupon_code || !userId) {
    return res.status(400).json({
      success: false,
      message: "Error in getting OrderId or Coupon",
    });
  }

  // Validating Coupon
  try {
    const couponData = await AffiliateModel.findOne({
      coupon_code: coupon_code,
    });
    //order exists or not

    if (!couponData) {
      // Check if the coupon exists
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
    // Check if orderId is unique
    try {
      const isOrderIdUnique = await AffiliateModel.find(
        {},
        {
          coupon_used_history: 1,
        }
      );

      let orderIdFound = false;

      isOrderIdUnique.forEach((data) => {
        data.coupon_used_history.forEach((subItem) => {
          if (subItem.orderId == orderId) {
            orderIdFound = true;
          }
        });
      });

      if (orderIdFound) {
        return res.status(400).json({
          success: false,
          message: "Error: OrderId already used",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    //If not unique then create
    const {
      valid_till,
      is_coupon_active,
      is_affiliate_active,
      affiliate_discount_amount,
      _id,
    } = couponData;
    // console.log(couponData);
    if (!is_coupon_active || !is_affiliate_active) {
      return res.status(404).json({
        success: false,
        message: "Coupon Code Expired",
      });
    }
    const currentDate = new Date();
    const expirationDate = new Date(valid_till);

    if (currentDate > expirationDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    await AffiliateModel.findByIdAndUpdate(
      _id,
      {
        $inc: { total_earning: affiliate_discount_amount, coupon_claimed: 1 },
        $push: {
          coupon_used_history: {
            orderId: orderId,
            userId: userId,
            date: currentDate,
            couponCode: coupon_code,
          },
        },
      },
      { new: true }
    )
      .then(() => {
        res.status(200).json({
          success: true,
          message: "Coupon add success",
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//Get Coupon data for History
export const couponPayHistory = async (req, res) => {
  if (req.params?.id) {
    try {
      const saveData = await AffiliateModel.findById(req.params.id)
        .populate({
          path: "coupon_used_history.userId",
          select: "name email",
        })

        .sort({
          updatedAt: -1,
        });
      const resObj = {
        coupon_used_history: saveData?.coupon_used_history,
        coupon_code: saveData.coupon_code,
      };
      res.status(200).json({
        success: true,
        message: resObj,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in getting History",
      });
    }
  }
};
