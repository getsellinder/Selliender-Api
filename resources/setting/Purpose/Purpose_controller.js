import mongoose from "mongoose";
import { Purpose } from "./Purpose_model.js";
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

const addPurpose = async (req, res) => {
  await addEntity(req, res, Purpose);
};

const getPurposeById = async (req, res) => {
  await getEntity(req, res, Purpose);
};

const getPurposeByIdWithState = async (req, res) => {
  try {
    const purpose = await Purpose.findById(req.params.id).populate("state");
    res.status(200).json(purpose);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllPurposes = async (req, res) => {
  try {
    const purpose = await Purpose.find().sort({ createdAt: -1 });
    res.status(200).json({ data: purpose });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updatePurpose = async (req, res) => {
  await updateEntity(req, res, Purpose);
};

const deletePurposeById = async (req, res) => {
  await deleteEntity(req, res, Purpose);
};

export {
  getNewId,
  addPurpose,
  getAllPurposes,
  getPurposeById,
  updatePurpose,
  deletePurposeById,
  getPurposeByIdWithState,
};
