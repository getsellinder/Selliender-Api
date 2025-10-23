import { Router } from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  createSpecialty,
  deleteSpecialty,
  getAllSpecialty,
  getSingleSpecialty,
} from "./SpecialtiesController.js";

const router = Router();

router.route("/add").post(createSpecialty);
router.route("/getall").get(getAllSpecialty);
router.route("/get/:id").get(getSingleSpecialty);
router.route("/delete/:id").delete(deleteSpecialty);

export default router;
