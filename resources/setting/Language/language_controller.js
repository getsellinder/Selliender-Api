import mongoose from "mongoose";
import { Language } from "./language_model.js";
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

const addLanguage = async (req, res) => {
  await addEntity(req, res, Language);
};

const getLanguageById = async (req, res) => {
  await getEntity(req, res, Language);
};

const getLanguageByIdWithState = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id).populate("state");
    res.status(200).json(language);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllLanguages = async (req, res) => {
  try {
    const language = await Language.find().sort({ createdAt: -1 });
    res.status(200).json({ data: language });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateLanguage = async (req, res) => {
  await updateEntity(req, res, Language);
};

const deleteLanguageById = async (req, res) => {
  await deleteEntity(req, res, Language);
};

export {
  getNewId,
  addLanguage,
  getAllLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguageById,
  getLanguageByIdWithState,
};
