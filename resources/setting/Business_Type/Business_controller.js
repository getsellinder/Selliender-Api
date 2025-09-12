import mongoose from "mongoose";
import { Business_Type } from "./Business_model.js";
import {
  addEntity,
  deleteEntity,
  getEntity,
  updateEntity,
} from "../../../Utils/reusableApi.js";

const getNewId = async (req, res) => {
  try {
    const newId = new mongoose.Types.ObjectId();
    res.status(200).json({ status: "OK", data: { _id: newId } });
  } catch (err) {
    return res.status(500).json({ message: "Unable to get ID." });
  }
};

const addBusiness_Type = async (req, res) => {
  await addEntity(req, res, Business_Type);
};

const getBusiness_TypeById = async (req, res) => {
  await getEntity(req, res, Business_Type);
};

const getBusiness_TypeByIdWithState = async (req, res) => {
  try {
    const business = await Business_Type.findById(req.params.id).populate("state");
    res.status(200).json(business);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllBusiness_Types = async (req, res) => {
  try {
    const business = await Business_Type.find().sort({ createdAt: -1 });
    res.status(200).json({ data: business });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateBusiness_Type = async (req, res) => {
  await updateEntity(req, res, Business_Type);
};

const deleteBusiness_TypeById = async (req, res) => {
  await deleteEntity(req, res, Business_Type);
};

export {
  getNewId,
  addBusiness_Type,
  getAllBusiness_Types,
  getBusiness_TypeById,
  updateBusiness_Type,
  deleteBusiness_TypeById,
  getBusiness_TypeByIdWithState,
};
