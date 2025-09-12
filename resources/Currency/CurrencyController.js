import mongoose from "mongoose";
import { CurrencyModel } from "./CurrencyModel.js";

// Add new Currency
export const createnew = async (req, res) => {
  const { CurrencyName, CurrencySymbol } = req.body;

  //   console.log(CurrencyName, CurrencySymbol);
  if (!CurrencyName || !CurrencySymbol) {
    return res
      .status(400)
      .json({ message: "Currency name & Currency symbol are required" });
  }

  try {
    // Check if the currency already exists
    const normalizedCurrencyName = CurrencyName.trim().toUpperCase();
    // console.log(normalizedCurrencyName);
    const trimmedCurrencySymbol = CurrencySymbol.trim();
    // Check if the currency already exists
    const existingCurrency = await CurrencyModel.findOne({
      CurrencyName: normalizedCurrencyName,
    });
    if (existingCurrency) {
      return res
        .status(400)
        .json({ message: " This Currency Name already exists" });
    }
    // console.log("existingCurrency", existingCurrency);

    // console.log(req.user?._id);
    // Create new currency
    // const newCurrency = new CurrencyModel({
    //   CurrencyName: normalizedCurrencyName,
    //   CurrencySymbol: trimmedCurrencySymbol,
    //   addedBy: req.user?._id,
    // });
    // console.log("newCurrency", newCurrency);

    const newCurrency = await CurrencyModel.create({
      CurrencyName: normalizedCurrencyName,
      CurrencySymbol: trimmedCurrencySymbol,
      addedBy: req.user?._id,
    });
    // await newCurrency.save();

    return res.status(201).json({
      message: "Currency created successfully",
      currency: newCurrency,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Currency already exists" });
    }
    res.status(500).json({
      message: error.message
        ? error.message
        : "An error occurred while creating the currency",
    });
  }
};

export const getAllcarrency = async (req, res) => {
  try {
    const currency = await CurrencyModel.find().sort({
      createdAt: -1,
    });

    if (!currency) {
      return res.status(404).json({ message: "No currencies found" });
    }

    res.status(200).json({ success: true, currency });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const updatecarrency = async (req, res) => {
  const { CurrencyName, CurrencySymbol } = req.body;
  const currencyId = req.params.id;

  if (!CurrencyName?.trim() || !CurrencySymbol?.trim()) {
    return res
      .status(400)
      .json({ message: "Currency name & Currency symbol are required" });
  }

  const normalizedCurrencyName = CurrencyName.trim().toUpperCase();
  const trimmedCurrencySymbol = CurrencySymbol.trim();

  try {
    // Check if the currency with the same name already exists
    const existingCurrency = await CurrencyModel.findOne({
      CurrencyName: normalizedCurrencyName,
      _id: { $ne: currencyId }, // Exclude the current currency being updated
    });

    if (existingCurrency) {
      return res.status(400).json({ message: "Currency name already exists" });
    }

    // Update currency
    const updatedCurrency = await CurrencyModel.findByIdAndUpdate(
      currencyId,
      {
        CurrencyName: normalizedCurrencyName,
        CurrencySymbol: trimmedCurrencySymbol,
      },
      { new: true }
    ); // To return the updated document

    if (!updatedCurrency) {
      return res.status(404).json({ message: "Currency not found" });
    }

    return res.status(200).json({
      message: "Currency updated successfully",
      currency: updatedCurrency,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
        ? error.message
        : "An error occurred while updating the currency",
    });
  }
};

export const deletecarrency = async (req, res) => {
  const currencyId = req.params.id;

  try {
    // Check if the currency exists
    const currency = await CurrencyModel.findById(currencyId);

    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }

    // Perform the deletion
    await CurrencyModel.findByIdAndDelete(currencyId);

    return res.status(200).json({
      message: "Currency deleted successfully",
      currency: currency,
    });
  } catch (error) {
    // console.error("Error deleting currency:", error); // Log for debugging
    res.status(500).json({
      message: error.message
        ? error.message
        : "An error occurred while deleting the currency",
    });
  }
};
