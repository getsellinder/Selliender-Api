import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";

import { countSearchlimit, ReferralPlan } from "./Referal.controll.js";

const Router = express.Router();

Router.post(
  "/create",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  ReferralPlan
);

Router.put(
  "/limit/update/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  countSearchlimit
);

export default Router;
