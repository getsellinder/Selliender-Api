import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import { AddNewSeoRequest, ViewSeoRequest } from "./SEOController.js";

const router = express.Router();

router
  .route("/new")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    AddNewSeoRequest
  );

router.route("/view").get(ViewSeoRequest);

export default router;
