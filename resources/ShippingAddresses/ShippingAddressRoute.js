import express from "express";
import {
  AddshippingAddress,
  getSingleUserSippingAddress,
  deleteSelfShippingAddress,
  getSingleUserSippingAddressForAdmin,
  updateShippingAddress,
  getSingleSippingAddress,
  AddshippingAddressByAdmin,
} from "./ShippingAddressController.js";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
const router = express.Router();

router.route("/new").post(isAuthenticatedUser, AddshippingAddress);
router
  .route("/admin/new/:_id")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    AddshippingAddressByAdmin
  );

router
  .route("/user/address/")
  .get(isAuthenticatedUser, getSingleUserSippingAddress);

router
  .route("/user/address/:_id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getSingleUserSippingAddressForAdmin
  );

router
  .route("/delete/:id")
  .delete(isAuthenticatedUser, deleteSelfShippingAddress);

router.route("/update/:id").patch(isAuthenticatedUser, updateShippingAddress);
router.route("/get/:id").get(isAuthenticatedUser, getSingleSippingAddress);

export default router;
