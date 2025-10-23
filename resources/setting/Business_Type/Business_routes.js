import { Router } from "express";
const router = Router();
import {
  getNewId,
  addBusiness_Type,
  getAllBusiness_Types,
  getBusiness_TypeById,
  updateBusiness_Type,
  deleteBusiness_TypeById,
  getBusiness_TypeByIdWithState,
} from "./Business_controller.js";

router.get("/newid", getNewId);
router.get("/", getAllBusiness_Types);
router.get("/:id", getBusiness_TypeById);
router.get("/withstate/:id", getBusiness_TypeByIdWithState);
router.post("/", addBusiness_Type);
router.patch("/:id", updateBusiness_Type);
router.delete("/:id", deleteBusiness_TypeById);

export default router;
