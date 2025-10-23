import { Router } from "express";
import express from "express";
import {
  addAddress,
  // addGST,
  addLogo,
  addSocialMedia,
  deleteConfig,
  getConfig,
  // addScrollText,
  addTermsOfUse,
  addApplicationName,
  getTermsOfUse,
  addCopyRightMessage,
} from "./Config_controller.js";
import { upload } from "../../../Utils/cloudinary.js";

import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../../middlewares/auth.js";

const router = Router();
// router.route("/gst").post(isAuthenticatedUser,authorizeRoles("admin", "Customer"), addGST);
router
  .route("/social")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    addSocialMedia
  );
router
  .route("/application/name")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    addApplicationName
  );
router
  .route("/copyright/message")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    addCopyRightMessage
  );

router
  .route("/address")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addAddress);
// router.route("/scrollText").post(isAuthenticatedUser,authorizeRoles("admin", "Customer"), addScrollText);
router
  .route("/logo")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addLogo);
router
  .route("/")
  .get(getConfig)
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteConfig
  );

router
  .route("/termsofuse")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), getTermsOfUse)
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    addTermsOfUse
  );

export default router;
