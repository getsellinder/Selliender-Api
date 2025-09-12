import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import { getDashboardData } from "./reportsController.js";

const router = express.Router();

router
  .route("/")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getDashboardData
  );

export default router;
