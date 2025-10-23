import express from "express";
import {
  LoginUser,
  otpverification,
  RegisterUser,
} from "./AuthenticationControll.js";

const router = express.Router();
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/otp/verification", otpverification);

export default router;
