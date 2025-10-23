import express from "express";
import {
  AddPrivacyAndPolicy,
  AddShipping,
  AddTermsAndConditions,
  RefundPolicy,
  getPrivacyPolicy,
  getRefundPolicy,
  getShipping,
  getTermsAndCondition,
  updatePrivacyPolicy,
  updateShipping,
  updateTermsAndConditions,
  updateRefundPolicy,
  AddAboutUs,
  getAboutUs,
  updateAboutUs,
} from "./ContentController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

// router
//   .route("/terms-and-conditions")
//   .post(
//     isAuthenticatedUser,
//     authorizeRoles("admin", "Customer"),
//     AddTermsAndConditions
//   );
router.route("/terms-and-conditions").get(getTermsAndCondition);
router
  .route("/terms-and-condition-update")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateTermsAndConditions
  );
router
  .route("/privacy-and-policy")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    AddPrivacyAndPolicy
  );
router.route("/privacy-and-policy").get(getPrivacyPolicy);
router
  .route("/privacy-and-policy-update")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatePrivacyPolicy
  );

router
  .route("/shipping-and-policy")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddShipping);
router.route("/shipping-and-policy").get(getShipping);
router
  .route("/shipping-and-policy-update")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateShipping
  );
//refund Policy
router.route("/refund-policy").get(getRefundPolicy);
router
  .route("/refund-policy")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), RefundPolicy);
router
  .route("/refund-policy-update")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateRefundPolicy
  );
//about us
router
  .route("/about-us")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddAboutUs);
router.route("/about-us").get(getAboutUs);
router
  .route("/about-us-update")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateAboutUs
  );

export default router;
