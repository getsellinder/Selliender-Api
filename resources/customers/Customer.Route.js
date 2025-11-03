import express from "express";

import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

import { DashboardUsers, getAllCustomer, toggleStatus } from "./Customer.Controller.js";
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

    router
  .route("/dashboard/status")
  .get(
    isAuthenticatedUser,
    authorizeRoles(...rolesAdmin),
    DashboardUsers
  );


  
export default router;
