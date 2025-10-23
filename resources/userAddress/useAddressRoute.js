import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addUserAddress,
  deleteUserAddress,
  getOneAddress,
  getUserAddress,
  updateAddress,
} from "./userAddressController.js";
import { rolesAdmin } from "../../Utils/authorizeRoles.js";

const router = express.Router();

router
  .route("/addAddress")
  .post(isAuthenticatedUser, authorizeRoles(...rolesAdmin), addUserAddress);
router.route("/getAddressess").get(getUserAddress);
router.route("/getOneAddress/:_id").get(getOneAddress);
router
  .route("/updateAddress/:_id")
  .patch(isAuthenticatedUser, authorizeRoles(...rolesAdmin), updateAddress);
router
  .route("/deleteAddress/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles(...rolesAdmin),
    deleteUserAddress
  );

export default router;
