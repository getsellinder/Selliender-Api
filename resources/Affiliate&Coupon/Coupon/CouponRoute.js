import express from "express";
import {
  couponPayHistory,
  createCoupon,
  editCoupon,
  getOneCoupon,
  listAffiliateCoupon,
  listAllCoupon,
  suspendCoupon,
  usedCoupon,
  validateCoupon,
} from "./CouponController.js";

import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../../../middlewares/auth.js";
import { rolesAdmin } from "../../../Utils/authorizeRoles.js";

const router = express.Router();
router.get(
  "/getall",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  listAllCoupon
);
router.patch(
  "/create",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  createCoupon
);
router.get(
  "/getaffiliate",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  listAffiliateCoupon
);
router.patch(
  "/edit/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  editCoupon
);
router.get(
  "/getone/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  getOneCoupon
);
router.get("/validcoupon/:coupon", validateCoupon);
router.patch(
  "/suspend",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  suspendCoupon
);
router.patch(
  "/paycoupon",
  // isAuthenticatedUser,
  usedCoupon
);
/* url:http://localhost:5000/api/v1/coupon/paycoupon
 json structure to paycoupon , Need Header to be auth
{
    "userId":"random1",
    "orderId":"12s213",
    "coupon_code":"3000MONY"
}*/
router.get(
  "/history/:id",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  couponPayHistory
);

export default router;
