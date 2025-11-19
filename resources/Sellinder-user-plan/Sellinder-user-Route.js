import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { getUserBills, getusercurrentplan } from "./Sellinder-user-controller.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";

const router = express.Router();

router
  .route("/upgrade/plans/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getusercurrentplan);
  
  router
  .route("/billing/get/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getUserBills);



export default router;
