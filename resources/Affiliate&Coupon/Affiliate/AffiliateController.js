import axios from "axios";
import { AffiliateModel } from "./AffiliateModel.js";

import Razorpay from "razorpay";
import UserModel from "../../user/userModel.js";
const razorpay = new Razorpay({
  key_id: process.env.RAZERPAY_KEY_ID,
  key_secret: process.env.RAZERPAY_SECRET_KEY,
});
import password from "secure-random-password";
import sendEmail from "../../../Utils/sendEmail.js";

// -----------------------------AFFILIATE & COUPONS ARE HARDLY BINDED DATA--------------------------------------------------------
//Create Affiliate
export const createAffiliate = async (req, res) => {
  try {
    const result = req.body;
    let findAffiliate = await AffiliateModel.findOne({ email: result?.email });
    if (findAffiliate) {
      return res.status(400).json({
        success: false,
        message: "This Email Id Affiliate Already exists",
      });
    }
    // Check if email already exists in User collection
    let findUser = await UserModel.findOne({ email: result?.email });
    if (!findUser) {
      const passwords = password.randomPassword({
        length: 10,
        characters: [
          { characters: password.upper, exactly: 1 },
          { characters: password.symbols, exactly: 1 },
          password.lower,
          password.digits,
        ],
      });

      // req.body.password = passwords;
      const user = await UserModel.create({
        password: passwords,
        phone: result?.mobile,
        ...result,
      });
      // console.log("user", user);
      await sendEmail({
        to: `${result?.email}`, // Change to your recipient

        from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

        subject: `Welcome to Smellika Affiliate!`,
        html: ` <h1 style="color: #333; text-align: left; font-family: Arial, sans-serif;">Welcome to Smellika Affiliate!</h1>
       <strong style="color: #1b03a3; font-size: 16px"> Hey ${
         result?.name
       },</strong>
       
     
       <br/> 
       <p style="color: #555; font-size: 15px;">You can login into :${`https://smellika.com`} </p>
        <br/>
        <p style="color: #555; font-size: 15px;">Below are your  Affiliate login credentials:</p>
  <p style="color: #555; font-size: 15px;">Email: ${result?.email}</p>
  <p style="color: #555; font-size: 15px;">Password: ${passwords}</p>
        <span style="color: #555; font-size: 13px;">Happy shopping,</span><br/>`,
      });
    }

    const affiliate = new AffiliateModel(result);
    const savedData = await affiliate.save();
    if (savedData) {
      return res
        .status(201)
        .json({ success: true, message: "Affiliate Added" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
        .split(":")
        .splice(1)
        .join(":")
        .trim()
        .split(":")
        .splice(1)
        .join(":")
        .trim(),
    });
  }
};

//EDIT
export const editAffiliate = async (req, res) => {
  const updateFields = {};

  const {
    name,
    mobile,
    email,
    country,
    state,
    city,
    address,
    pincode,
    nameAsBank,
    accountNo,
    ifsc,
    bankName,
    branchName,
  } = req.body;

  // Add only the fields that are present in the request body to the updateFields object
  if (name) updateFields.name = name;
  if (mobile) updateFields.mobile = mobile;
  if (email) updateFields.email = email;
  if (country) updateFields.country = country;
  if (state) {
    updateFields.state = state;
  } else {
    updateFields.state = "";
  }
  if (city) {
    updateFields.city = city;
  } else {
    updateFields.city = "";
  }
  if (address) updateFields.address = address;
  if (pincode) updateFields.pincode = pincode;
  if (nameAsBank) updateFields.nameAsBank = nameAsBank;
  if (accountNo) updateFields.accountNo = accountNo;
  if (ifsc) updateFields.ifsc = ifsc;
  if (bankName) updateFields.bankName = bankName;
  if (branchName) updateFields.branchName = branchName;
  try {
    const saveData = await AffiliateModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      { new: true }
    );
    res.json({
      success: true,
      message: "Affiliate Updated Succesfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Updation",
    });
  }
};
//DELETE
export const deleteAffiliate = async (req, res) => {};
//PAY AFFILIATE TODO
export const payAffiliate = async (req, res) => {
  // console.log(req.body);
  const { noOfCoupons, amountToPay, amount, transecId, date, time } = req.body;
  if (
    !req.params.id ||
    !noOfCoupons ||
    !amountToPay ||
    !amount ||
    !transecId ||
    !date ||
    !time
  ) {
    return res.status(400).json({
      success: false,
      message: "Error in Payment",
    });
  }
  try {
    const affiliate = await AffiliateModel.findById(req.params.id);
    //Checking if it's valid data from the client
    if (
      amountToPay != affiliate.total_earning - affiliate.paid_amount ||
      noOfCoupons != affiliate.coupon_claimed - affiliate.no_of_paid_coupon
    ) {
      return res.status(400).json({
        success: false,
        message: "Data invalid",
      });
    }

    // Construct the update operation
    const updateOperation = {
      $push: {
        affiliate_pay_history: {
          amount: amountToPay,
          transecId: transecId,
          date: date,
          time: time,
        },
      },
      $inc: {
        paid_amount: amountToPay,
        no_of_paid_coupon: noOfCoupons,
      },
    };

    // Execute the update operation
    const updatedAffiliate = await AffiliateModel.findByIdAndUpdate(
      req.params.id,
      updateOperation,
      { new: true }
    );

    return res.json({
      success: true,
      message: "Payment Done Successfully",
      updatedAffiliate: { updatedAffiliate },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Error in Payment",
    });
  }
};

//GET ONE AFFLILIATE
export const getOneAffiliate = async (req, res) => {
  if (req.params?.id) {
    try {
      const saveData = await AffiliateModel.findById(req.params.id);
      const resObj = {
        name: saveData.name,
        mobile: saveData.mobile,
        email: saveData.email,
        country: saveData.country,
        state: saveData.state,
        city: saveData.city,
        address: saveData.address,
        pincode: saveData.pincode,
        nameAsBank: saveData.nameAsBank,
        accountNo: saveData.accountNo,
        ifsc: saveData.ifsc,
        bankName: saveData.bankName,
        branchName: saveData.branchName,
      };
      res.status(200).json({
        success: true,
        message: resObj,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in getting Affiliates",
      });
    }
  }
};
//LIST ALL AFFILIATE
export const listAllAffiliate = async (req, res) => {
  try {
    const affiliate = await AffiliateModel.find(
      {},
      {
        name: 1,
        _id: 1,
        coupon_claimed: 1,
        coupon_code: 1,
        total_earning: 1,
        paid_amount: 1,
        is_affiliate_active: 1,
        mobile: 1,
      }
    ).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: affiliate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      messgae: error.message ? error.message : "Something went wrong!",
    });
  }
};

//Activate & Deactivate Affiliates
export const suspendAffiliate = async (req, res) => {
  const { id, is_affiliate_active } = req.body;
  try {
    const saveData = await AffiliateModel.findByIdAndUpdate(id, {
      is_affiliate_active: is_affiliate_active,
    });
    res.status(200).json({
      success: true,
      message: "Success",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Affiliate Doesn't Exists",
    });
  }
};

//Get Affiliate data for payment
export const getOneAffiliateForPay = async (req, res) => {
  if (req.params?.id) {
    try {
      const saveData = await AffiliateModel.findById(req.params.id);
      const resObj = {
        name: saveData.name,
        coupon_claimed: saveData.coupon_claimed,
        total_earning: saveData.total_earning,
        paid_amount: saveData.paid_amount,
        no_of_paid_coupon: saveData.no_of_paid_coupon,
        affiliate_discount_amount: saveData.affiliate_discount_amount,
        coupon_code: saveData.coupon_code,
        nameAsBank: saveData.nameAsBank,
        accountNo: saveData.accountNo,
        ifsc: saveData.ifsc,
        bankName: saveData.bankName,
        branchName: saveData.branchName,
      };
      res.status(200).json({
        success: true,
        message: resObj,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error in getting Affiliates",
      });
    }
  }
};
//Get Affiliate data for History
export const affiliatePayHistory = async (req, res) => {
  if (req.params?.id) {
    try {
      const saveData = await AffiliateModel.findById(req.params.id).sort({
        updatedAt: -1,
      });
      const resObj = {
        affiliate_pay_history: saveData.affiliate_pay_history,
        name: saveData.name,
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

// Affiliate PayOut
export const affiliatPayOut = async (req, res) => {
  const {
    amountToPay,
    nameAsBank,
    accountNo,
    ifsc,
    bankName,
    branchName,
    affiliateDiscountAmt,
  } = req.body;

  if (!amountToPay)
    return res.status(400).json({ message: "amountToPay is  not empty!" });
  if (!nameAsBank)
    return res
      .status(404)
      .json({ message: "please Enter Your name As Bank PassBook!" });
  if (!accountNo)
    return res.status(404).json({ message: "please Enter accountNo!" });
  if (!nameAsBank)
    return res.status(404).json({ message: "please Enter nameAsBank!" });
  if (!ifsc)
    return res.status(404).json({ message: "please provide  Bank ifsc!" });
  if (!bankName)
    return res.status(404).json({ message: "please provide  Bank Name!" });
  if (!branchName)
    return res
      .status(404)
      .json({ message: "please provide  Bank branch Name!" });

  const amount = 50000; // Amount in paise (50000 paise = Rs 500)
  const currency = "INR";
  const accountNumber = "XXXXXXXXXXXX";
  const accountHolderName = "John Doe";
  const IFSCCode = "XXXXXXX";
  // 068105500883
  // ICIC0000681
  // const options = {
  //   // account_number: Number(accountNo),
  //   // fund_account_id: "fund_account_id", // Get this from Razorpay Dashboard
  //   // amount,
  //   // currency: "INR",
  //   // mode: "IMPS",
  //   // purpose: "payout",
  //   // recipient_contact: "+91XXXXXXXXXX", // Recipient contact number
  //   // recipient_email: "recipient@example.com", // Recipient email address
  //   // description: "Payout to Bank Account",

  //   account_number: "7878780080316316",
  //   fund_account_id: "fa_00000000000001",
  //   amount: 100,
  //   currency: "INR",
  //   mode: "IMPS",
  //   purpose: "refund",
  //   queue_if_low_balance: true,
  //   // reference_id: "Acme Transaction ID 12345",
  //   // narration: "Acme Corp Fund Transfer",
  //   notes: {
  //     account_holder_name: accountHolderName,
  //     ifsc_code: IFSCCode,
  //   },
  // };

  const options = {
    method: "post",
    url: "https://api.razorpay.com/v1/payouts",
    auth: {
      username: process.env.RAZERPAY_KEY_ID,
      password: process.env.RAZERPAY_SECRET_KEY,
    },
    data: {
      account_number: accountNumber,
      amount,
      currency: "INR",
      mode: "IMPS", // Specify the mode of transfer (IMPS/NEFT/RTGS)
      purpose: "payout", // Purpose of the payout
      recipient_contact: "+91XXXXXXXXXX", // Recipient's contact number
      recipient_email: "recipient@example.com", // Recipient's email address
      notes: {
        account_holder_name: "pawan",
        ifsc_code: IFSCCode,
      },
    },
  };

  try {
    // const saveData = await AffiliateModel.findById(req.params.id).sort({
    //   updatedAt: -1,
    // });
    // const resObj = {
    //   affiliate_pay_history: saveData.affiliate_pay_history,
    //   name: saveData.name,

    const response = await axios(options);
    //     res.json(response.data);
    // console.log(razorpay.payouts);
    // razorpay.payouts.create(options, function (err, payout) {
    //   if (err) {
    //     console.error(err);
    //     res.status(500).send("Server Error");
    //   } else {
    //     res.json(payout);
    //   }
    // });
    // const payout = await razorpay.payouts.create(options);

    // console.log("payout", payout);
    res.status(200).json({
      success: true,
      response,
      message: "lllllll",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error?.response?.data?.message
        ? error?.response?.data?.message
        : "Error  Payout",
    });
  }
};

//LIST ALL AFFILIATE
export const MyAllAffiliate = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (user?.email) {
      const affiliate = await AffiliateModel.find(
        { email: user?.email },
        {
          name: 1,
          _id: 1,
          email: 1,
          coupon_claimed: 1,
          coupon_code: 1,
          total_earning: 1,
          paid_amount: 1,
          // is_affiliate_active: 1,
        }
      ).sort({ createdAt: -1 });
      // console.log("affiliate", affiliate);
      return res.status(200).json({
        success: true,
        message: affiliate,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      messgae: error.message ? error.message : "Something went wrong!",
    });
  }
};
