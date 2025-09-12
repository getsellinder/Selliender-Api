import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

import {
  addBanner,
  deleteBanner,
  getBanner,
  updateBanner,
} from "./BannerController.js";
import { rolesAdmin } from "../../Utils/authorizeRoles.js";
const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles(...rolesAdmin), addBanner);

router.route("/getBanners").get(getBanner);
router
  .route("/update/:_id")
  .patch(isAuthenticatedUser, authorizeRoles(...rolesAdmin), updateBanner);
router
  .route("/delete/:_id")
  .delete(isAuthenticatedUser, authorizeRoles(...rolesAdmin), deleteBanner);

export default router;
