import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { getUserBills, getusercurrentplan } from "./Sellinder-user-controller.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";

const router = express.Router();

router
  .route("/plans/:id")
  .get(isAuthenticatedUser, authorizeRoles(...rolesAdmin), getusercurrentplan);
  
  router
  .route("/billing/get/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getUserBills);



export default router;
