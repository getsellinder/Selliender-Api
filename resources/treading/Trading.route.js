import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";
import {
  createTrading,
  deleteTrading,
  getAllTradings,
  getAllTradingsForApp,
  getByIdTrading,
  getTreadingNotifications,
  MakeTreading,
  updateTrading,
} from "./Trading.controll.js";

const rounter = express.Router();

rounter.post(
  "/create/trading/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  createTrading
);
rounter.put(
  "/update/trading/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  updateTrading
);
rounter.get(
  "/get/trading/notificaitons",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getTreadingNotifications
);

rounter.get(
  "/get/trading/:id",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getByIdTrading
);

rounter.get(
  "/get/trading",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getAllTradings
);

rounter.get(
  "/get/app/trading",
  isAuthenticatedUser,
  authorizeRoles(...roles),
  getAllTradingsForApp
);

rounter.put(
  "/make/trading/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  MakeTreading
);

rounter.delete(
  "/delete/trading/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  deleteTrading
);

export default rounter;
