import mongoose from "mongoose";

import { UserAddressModel } from "./userAddressModel.js";

// Add new Category
export const addUserAddress = async (req, res) => {
  if (!req?.user) return res.status(400).json({ message: "please login !" });
  try {
    // Get the user address data from the request body
    const { userType, name, email, phno, addressess } = req.body;

    // Create a new UserAddressModel instance with the data
    const userAddress = new UserAddressModel({
      userType,
      name,
      email,
      phno,
      addressess,
      addedBy: req.user._id,
    });

    // Save the user address data to the database
    await userAddress.save();

    res.status(201).json({
      success: true,
      userAddress,
      message: "User address data saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const getUserAddress = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const userAddress = await UserAddressModel.find({
      // addedBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    if (userAddress) {
      return res.status(200).json({ success: true, userAddress });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// Get single user addess
export const getOneAddress = async (req, res) => {
  try {
    const address = await UserAddressModel.findById(req.params._id);

    if (address) {
      return res.status(200).json({
        success: true,
        address,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;

    const { userType, name, email, phno, addressess } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    // Use findOneAndUpdate to update the document
    const update = await UserAddressModel.findOneAndUpdate(
      { _id: _id },
      { userType, name, email, phno, addressess }, // Provide the user address
      { new: true } // To return the updated document
    );

    if (update) {
      return res.status(200).json({ success: true, update });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const deleteUserAddress = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    const deleteAddress = await UserAddressModel.findOneAndDelete({ _id: _id });
    if (!deleteAddress) {
      return res.status(404).json({
        error: "Can not find the document with the provided id to delete  ",
      });
    }
    res.status(200).json({ success: true, deleteAddress });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};
