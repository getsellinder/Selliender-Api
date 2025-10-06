import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";
import {
  countSearchlimit,
  getAllPackages,
  getByIdPackage,
  InvoiceDetailsById,
  PackageCreate,
  PackageDelete,
  PackageUpdate,
  PlanPurchese,
} from "./Package.controll.js";

const Router = express.Router();
Router.post(
  "/create",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  PackageCreate
);
Router.get(
  "/get/all",
  // isAuthenticatedUser,
  // authorizeRoles(...roles),
  getAllPackages
);

Router.get(
  "/get/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getByIdPackage
);
Router.delete(
  "/delete/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  PackageDelete
);
Router.put(
  "/limit/update/:id",
  countSearchlimit
);
Router.put(
  "/update/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  PackageUpdate
);


Router.post("/purchase/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  PlanPurchese)

Router.get("/get/invoice/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  InvoiceDetailsById)


export default Router;
