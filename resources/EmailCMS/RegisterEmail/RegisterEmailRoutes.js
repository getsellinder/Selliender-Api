import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../../middlewares/auth.js";
import {
  GetRegisterEamilData,
  RegisterEmailSend,
} from "./registerEmailController.js";
import express from "express";
const router = express.Router();

router
  .route("/register-email")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    RegisterEmailSend
  );
router.route("/get-email-data").get(GetRegisterEamilData);

export default router;
