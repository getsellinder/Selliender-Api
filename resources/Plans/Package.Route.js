import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";
import {
  getAllPackages,
  getByIdPackage,
  PackageCreate,
  PackageDelete,
  PackageUpdate,
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
  "/update/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  PackageUpdate
);

export default Router;
