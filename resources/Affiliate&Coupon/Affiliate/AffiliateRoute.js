import express from "express";
import {
  MyAllAffiliate,
  affiliatPayOut,
  affiliatePayHistory,
  createAffiliate,
  editAffiliate,
  getOneAffiliate,
  getOneAffiliateForPay,
  listAllAffiliate,
  payAffiliate,
  suspendAffiliate,
} from "./AffiliateController.js";

import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../../../middlewares/auth.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  createAffiliate
);
router.get(
  "/getall",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  listAllAffiliate
);
router.get("/my/:id", isAuthenticatedUser, MyAllAffiliate);

router.get(
  "/getone/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  getOneAffiliate
);
router.patch(
  "/edit/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  editAffiliate
);
router.patch(
  "/suspend",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  suspendAffiliate
);
router.post(
  "/pay/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  payAffiliate
);
router.get(
  "/getpay/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  getOneAffiliateForPay
);
router.get(
  "/history/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  affiliatePayHistory
);

//pay affiliat Amount by razorpay
router.post(
  "/payout",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  affiliatPayOut
);
export default router;
