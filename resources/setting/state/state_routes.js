import { Router } from "express";
const router = Router();
import {
  getNewId,
  addState,
  getAllStates,
  getStateById,
  updateState,
  deleteStateById,
} from "./state_controller.js";

router.get("/newid", getNewId);
router.get("/", getAllStates);
router.get("/:id", getStateById);
router.post("/", addState);
router.patch("/:id", updateState);
router.delete("/:id", deleteStateById);

export default router;
