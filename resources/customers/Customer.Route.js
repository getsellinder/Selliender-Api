import express from "express";

import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

import { getAllCustomer, toggleStatus } from "./Customer.Controller.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";

const router = express.Router();
router
  .route("/customers")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getAllCustomer
  );
  router
  .route("/status/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles(...rolesAdmin),
    toggleStatus
  );

export default router;
