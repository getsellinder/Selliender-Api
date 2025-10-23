import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addColor,
  deleteColor,
  getColors,
  updateColor,
} from "./colorController.js";
const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addColor);
router.route("/getColors").get(getColors);
router
  .route("/update/:_id")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "Customer"), updateColor);
router
  .route("/delete/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteColor
  );

export default router;
