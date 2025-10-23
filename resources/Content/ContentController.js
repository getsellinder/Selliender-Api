import { PrivacyAndPolicy } from "./PrivacyPolicyModel.js";
import { Refundpolicy } from "./RefundModel.js";
import { Shipping } from "./ShippingModel.js";
import { TermsAndCondition } from "./TermsandConditonModel.js";
import { AboutUs } from "./AboutUsModel.js";

export const AddTermsAndConditions = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content } = req.body;
    const termsAndCondition = await TermsAndCondition.create({
      termsAndContionContent: content,
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      termsAndCondition,
      message: "Added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getTermsAndCondition = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const termsAndCondition = await TermsAndCondition.find();

    res.status(200).json({
      success: true,
      termsAndCondition,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updateTermsAndConditions = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // new content
    const { content } = req.body;
    // id of the  terms and conndition document
    const id = req.query.id;

    // object for updated  terms and conndition data
    const updatedTermsData = {
      termsAndContionContent: content,
      addedBy: req.user._id,
    };

    // update the  terms and conndition in database
    const termsAndCondition = await TermsAndCondition.findByIdAndUpdate(
      { _id: id },
      { $set: updatedTermsData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      termsAndCondition,
      message: "updated successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
//refund Policy
export const RefundPolicy = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)
    const { content } = req.body;
    const refundPolicy = await Refundpolicy.create({
      addedBy: req.user._id,
      Refundpolicy: content,
    });

    res.status(200).json({
      success: true,
      refundPolicy,
      message: "updated successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

//

export const getRefundPolicy = async (req, res) => {
  try {
    const Refundpolicys = await Refundpolicy.find();

    res.status(200).json({
      success: true,
      Refundpolicys,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// update refund policy
export const updateRefundPolicy = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

    const { content } = req.body;
    // id of the refund policy document
    const id = req.query.id;

    // object for updated refund policy data
    const updatedRefundPolicyData = {
      Refundpolicy: content,
      addedBy: req.user._id,
    };

    // update the refund policy in database
    const refundPolicy = await Refundpolicy.findByIdAndUpdate(
      { _id: id },
      { $set: updatedRefundPolicyData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      refundPolicy,
      message: "updated successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// Privacy policy controller functions

export const AddPrivacyAndPolicy = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content } = req.body;
    const privacyAndPolicy = await PrivacyAndPolicy.create({
      privacyAndPolicyContent: content,
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      privacyAndPolicy,
      message: "Added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getPrivacyPolicy = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const privacyAndPolicy = await PrivacyAndPolicy.find();

    res.status(200).json({
      success: true,
      privacyAndPolicy,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updatePrivacyPolicy = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

    // new content
    const { content } = req.body;

    // id of the privacy policy document
    const id = req.query.id;

    // object for updated privacy policy data
    const updatedPrivacyPolicyData = {
      privacyAndPolicyContent: content,
      addedBy: req.user._id,
    };

    // update the privacy policy in database
    const privacyAndPolicy = await PrivacyAndPolicy.findByIdAndUpdate(
      { _id: id },
      { $set: updatedPrivacyPolicyData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      privacyAndPolicy,
      message: "updated successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// Shipping Controller

export const AddShipping = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content } = req.body;
    const shipping = await Shipping.create({
      shippingContent: content,
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      shipping,
      message: "Added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getShipping = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const shipping = await Shipping.find();

    res.status(200).json({
      success: true,
      shipping,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updateShipping = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // new content
    const { content } = req.body;

    // id of the shipping policy document
    const id = req.query.id;

    // object for updated shipping policy data
    const updatedShippingData = {
      shippingContent: content,
      addedBy: req.user._id,
    };

    // update the shipping policy in database
    const shipping = await Shipping.findByIdAndUpdate(
      { _id: id },
      { $set: updatedShippingData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      shipping,
      message: "updated successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// About us controller functions

export const AddAboutUs = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content } = req.body;
    const aboutUs = await AboutUs.create({
      aboutUsContent: content,
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      aboutUs,
      message: "Added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getAboutUs = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const aboutUs = await AboutUs.find();

    res.status(200).json({
      success: true,
      aboutUs,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updateAboutUs = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

    // new content
    const { content } = req.body;

    // id of the about us document
    const id = req.query.id;

    // object for updated about us data
    const updatedAboutUsData = {
      aboutUsContent: content,
      addedBy: req.user._id,
    };

    // update the about us in database
    const aboutUs = await AboutUs.findByIdAndUpdate(
      { _id: id },
      { $set: updatedAboutUsData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      aboutUs,
      message: "updated successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
