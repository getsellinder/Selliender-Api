import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";

import { getbillinvoice, getBills, viewbilling ,getUserBills} from "./Billing.controll.js";

const Router = express.Router();

Router.get(
  "/get",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getBills
);

Router.get(
  "/get",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getUserBills
);

Router.get(
  "/get/invoice/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getbillinvoice
);
Router.get(
  "/get/view/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  viewbilling
);

export default Router;
