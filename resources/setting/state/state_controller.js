import mongoose from "mongoose";
import { State } from "./state_model.js";
import {
  addEntity,
  deleteEntity,
  getEntities,
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

const addState = async (req, res) => {
  await addEntity(req, res, State);
};

const getStateById = async (req, res) => {
  await getEntity(req, res, State);
};

const getAllStates = async (req, res) => {
  await getEntities(req, res, State);
};

const updateState = async (req, res) => {
  await updateEntity(req, res, State);
};

const deleteStateById = async (req, res) => {
  await deleteEntity(req, res, State);
};

export {
  getNewId,
  addState,
  getAllStates,
  getStateById,
  updateState,
  deleteStateById,
};
