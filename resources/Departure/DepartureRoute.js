import express from "express";
import { AddNewFlight, FindAllFlight } from "./DepartureController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/flight/new")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddNewFlight);
router
  .route("/flight/getAll")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), FindAllFlight);

// router.route("/product/getAll/").get(getAllProduct)

export default router;
