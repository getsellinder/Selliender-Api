import { Router } from "express";
const router = Router();
import {
  getNewId,
  addLanguage,
  getAllLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguageById,
  getLanguageByIdWithState,
} from "./language_controller.js";

router.get("/newid", getNewId);
router.get("/", getAllLanguages);
router.get("/:id", getLanguageById);
router.get("/withstate/:id", getLanguageByIdWithState);
router.post("/", addLanguage);
router.patch("/:id", updateLanguage);
router.delete("/:id", deleteLanguageById);

export default router;
