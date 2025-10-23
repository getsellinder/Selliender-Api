import { Router } from "express";
const router = Router();
import {
  getNewId,
  addPurpose,
  getAllPurposes,
  getPurposeById,
  updatePurpose,
  deletePurposeById,
  // getPurposeByIdWithState,
} from "./Purpose_controller.js";

router.get("/newid", getNewId);
router.get("/", getAllPurposes);
router.get("/:id", getPurposeById);
// router.get("/withstate/:id", getPurposeByIdWithState)
router.post("/", addPurpose);
router.patch("/:id", updatePurpose);
router.delete("/:id", deletePurposeById);

export default router;
