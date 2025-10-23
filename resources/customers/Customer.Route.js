import express from "express";

import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

import { getAllCustomer } from "./Customer.Controller.js";

const router = express.Router();
router
  .route("/customers")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getAllCustomer
  );

export default router;
